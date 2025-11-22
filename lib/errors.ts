/**
 * 🚨 Custom Error Classes for DegenScore
 *
 * Structured error handling with proper error types.
 * Makes error handling more predictable and easier to debug.
 */

import { logger } from './logger';

// =============================================================================
// BASE ERROR CLASS
// =============================================================================

/**
 * Base application error with additional metadata
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.context && { context: this.context }),
    };
  }
}

// =============================================================================
// VALIDATION ERRORS (400)
// =============================================================================

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

export class InvalidAddressError extends ValidationError {
  constructor(address: string) {
    super('Invalid wallet address', { address });
    this.code = 'INVALID_ADDRESS';
  }
}

export class InvalidInputError extends ValidationError {
  constructor(field: string, reason: string) {
    super(`Invalid input for field: ${field}`, { field, reason });
    this.code = 'INVALID_INPUT';
  }
}

// =============================================================================
// AUTHENTICATION ERRORS (401)
// =============================================================================

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
  }
}

export class WalletNotConnectedError extends AuthenticationError {
  constructor() {
    super('Wallet not connected', {});
    this.code = 'WALLET_NOT_CONNECTED';
  }
}

export class InvalidSignatureError extends AuthenticationError {
  constructor() {
    super('Invalid wallet signature', {});
    this.code = 'INVALID_SIGNATURE';
  }
}

// =============================================================================
// AUTHORIZATION ERRORS (403)
// =============================================================================

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(requiredPermission: string) {
    super('Insufficient permissions', { requiredPermission });
    this.code = 'INSUFFICIENT_PERMISSIONS';
  }
}

// =============================================================================
// NOT FOUND ERRORS (404)
// =============================================================================

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, true, { resource, id });
  }
}

export class CardNotFoundError extends NotFoundError {
  constructor(walletAddress: string) {
    super('Card', walletAddress);
    this.code = 'CARD_NOT_FOUND';
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('User', userId);
    this.code = 'USER_NOT_FOUND';
  }
}

// =============================================================================
// CONFLICT ERRORS (409)
// =============================================================================

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, true, context);
  }
}

export class DuplicateEntryError extends ConflictError {
  constructor(field: string, value: string) {
    super(`Duplicate entry for ${field}`, { field, value });
    this.code = 'DUPLICATE_ENTRY';
  }
}

// =============================================================================
// RATE LIMIT ERRORS (429)
// =============================================================================

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super(
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
      true,
      { retryAfter }
    );
    this.retryAfter = retryAfter;
  }
}

// =============================================================================
// PAYMENT ERRORS (402/400)
// =============================================================================

export class PaymentError extends AppError {
  constructor(message: string, code: string = 'PAYMENT_ERROR', context?: Record<string, unknown>) {
    super(message, code, 402, true, context);
  }
}

export class InsufficientBalanceError extends PaymentError {
  constructor(required: number, available: number) {
    super('Insufficient balance', 'INSUFFICIENT_BALANCE', { required, available });
  }
}

export class TransactionFailedError extends PaymentError {
  constructor(txSignature?: string, reason?: string) {
    super('Transaction failed', 'TRANSACTION_FAILED', { txSignature, reason });
  }
}

// =============================================================================
// EXTERNAL SERVICE ERRORS (503)
// =============================================================================

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      503,
      true,
      { service, originalError: originalError?.message }
    );
  }
}

export class HeliusAPIError extends ExternalServiceError {
  constructor(endpoint: string, originalError?: Error) {
    super('Helius', originalError);
    this.code = 'HELIUS_API_ERROR';
    this.context = { ...this.context, endpoint };
  }
}

export class DatabaseError extends ExternalServiceError {
  constructor(operation: string, originalError?: Error) {
    super('Database', originalError);
    this.code = 'DATABASE_ERROR';
    this.context = { ...this.context, operation };
  }
}

// =============================================================================
// NETWORK ERRORS
// =============================================================================

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 503, true, context);
  }
}

export class TimeoutError extends NetworkError {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation timed out: ${operation}`, { operation, timeoutMs });
    this.code = 'TIMEOUT_ERROR';
  }
}

// =============================================================================
// ERROR HANDLER UTILITY
// =============================================================================

/**
 * Handle error and return appropriate response
 */
export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  context?: Record<string, unknown>;
} {
  // If it's our custom error, use it directly
  if (error instanceof AppError) {
    logger.error(error.message, error, error.context);

    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    };
  }

  // If it's a standard Error
  if (error instanceof Error) {
    logger.error('Unexpected error', error);

    return {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }

  // Unknown error type
  logger.error('Unknown error type', undefined, { error: String(error) });

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Wrap async function with error handling
 */
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : String(error),
        'WRAPPED_ERROR',
        500,
        false
      );
    }
  };
}

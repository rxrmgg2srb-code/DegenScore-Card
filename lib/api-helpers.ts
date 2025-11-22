/**
 * 🚀 API Response Helpers for DegenScore
 *
 * Standardized API response utilities for consistent API design.
 * Handles success/error responses, pagination, and more.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';
import { AppError, handleError } from './errors';
import { ApiResponse, PaginatedResponse } from './types';
import { RATE_LIMIT } from './constants';

// =============================================================================
// RESPONSE BUILDERS
// =============================================================================

/**
 * Send a successful API response
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200,
  message?: string
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  res.status(statusCode).json(response);
}

/**
 * Send an error API response
 */
export function sendError(
  res: NextApiResponse,
  error: string | Error | AppError,
  statusCode: number = 500,
  context?: Record<string, unknown>
): void {
  // If it's our custom error, extract the status code
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    context = error.context;
  }

  const errorMessage = error instanceof Error ? error.message : error;

  const response: ApiResponse = {
    success: false,
    error: errorMessage,
  };

  // Log the error
  if (error instanceof Error) {
    logger.error('API Error', error, context);
  } else {
    logger.error('API Error', undefined, { error: errorMessage, ...context });
  }

  res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export function sendPaginatedResponse<T>(
  res: NextApiResponse,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  statusCode: number = 200
): void {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };

  res.status(statusCode).json(response);
}

/**
 * Send a not found response
 */
export function sendNotFound(res: NextApiResponse, resource: string = 'Resource'): void {
  const response: ApiResponse = {
    success: false,
    error: `${resource} not found`,
  };

  res.status(404).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: NextApiResponse,
  errors: string[] | Record<string, string>
): void {
  const response: ApiResponse = {
    success: false,
    error: 'Validation failed',
    data: { errors },
  };

  logger.warn('Validation error', { errors });
  res.status(400).json(response);
}

/**
 * Send a rate limit error response
 */
export function sendRateLimitError(res: NextApiResponse, retryAfter: number = 60): void {
  const response: ApiResponse = {
    success: false,
    error: 'Too many requests. Please try again later.',
    data: { retryAfter },
  };

  res.setHeader('Retry-After', String(retryAfter));
  res.status(429).json(response);
}

/**
 * Send an unauthorized error response
 */
export function sendUnauthorized(res: NextApiResponse, message: string = 'Unauthorized'): void {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(401).json(response);
}

/**
 * Send a forbidden error response
 */
export function sendForbidden(res: NextApiResponse, message: string = 'Forbidden'): void {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(403).json(response);
}

// =============================================================================
// REQUEST HELPERS
// =============================================================================

/**
 * Extract pagination parameters from request
 */
export function getPaginationParams(req: NextApiRequest): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.pageSize || '20'), 10))
  );
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

/**
 * Extract sort parameters from request
 */
export function getSortParams(
  req: NextApiRequest,
  defaultField: string = 'createdAt',
  defaultDirection: 'asc' | 'desc' = 'desc'
): {
  sortField: string;
  sortDirection: 'asc' | 'desc';
} {
  const sortField = String(req.query.sortBy || defaultField);
  const sortDirection = (String(req.query.order || defaultDirection).toLowerCase() === 'asc'
    ? 'asc'
    : 'desc') as 'asc' | 'desc';

  return { sortField, sortDirection };
}

/**
 * Extract search query from request
 */
export function getSearchQuery(req: NextApiRequest): string {
  return String(req.query.q || req.query.search || '').trim();
}

/**
 * Check if request method is allowed
 */
export function checkMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
): boolean {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods.join(', '));
    sendError(res, 'Method not allowed', 405);
    return false;
  }
  return true;
}

/**
 * Extract bearer token from Authorization header
 */
export function getBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Extract wallet address from request (query or body)
 */
export function getWalletAddress(req: NextApiRequest): string | null {
  return String(req.query.walletAddress || req.body?.walletAddress || '').trim() || null;
}

/**
 * Parse request body safely
 */
export function parseRequestBody<T = Record<string, unknown>>(req: NextApiRequest): T | null {
  try {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body) as T;
    }
    return req.body as T;
  } catch (error) {
    logger.error('Failed to parse request body', error instanceof Error ? error : undefined);
    return null;
  }
}

// =============================================================================
// ERROR HANDLING WRAPPER
// =============================================================================

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      const errorInfo = handleError(error);
      sendError(res, errorInfo.message, errorInfo.statusCode, errorInfo.context);
    }
  };
}

/**
 * Wrap API route handler with method checking and error handling
 */
export function withMethodCheck(
  allowedMethods: string[],
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return withErrorHandler(async (req, res) => {
    if (!checkMethod(req, res, allowedMethods)) {
      return;
    }
    await handler(req, res);
  });
}

// =============================================================================
// RATE LIMITING
// =============================================================================

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT.REQUESTS_PER_MINUTE,
  windowMs: number = RATE_LIMIT.WINDOW_MS
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  // Clean up old records
  if (record && record.resetAt < now) {
    delete rateLimitStore[identifier];
  }

  // Check existing record
  if (record && record.resetAt >= now) {
    const allowed = record.count < maxRequests;

    if (allowed) {
      record.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, maxRequests - record.count),
      resetAt: record.resetAt,
    };
  }

  // Create new record
  const resetAt = now + windowMs;
  rateLimitStore[identifier] = {
    count: 1,
    resetAt,
  };

  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetAt,
  };
}

/**
 * Rate limit middleware
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  maxRequests: number = RATE_LIMIT.REQUESTS_PER_MINUTE
) {
  return withErrorHandler(async (req, res) => {
    // Use IP address as identifier (fallback to 'unknown')
    const identifier =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    const rateLimit = checkRateLimit(identifier, maxRequests);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
    res.setHeader('X-RateLimit-Reset', String(rateLimit.resetAt));

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      sendRateLimitError(res, retryAfter);
      return;
    }

    await handler(req, res);
  });
}

// =============================================================================
// CORS HELPERS
// =============================================================================

/**
 * Set CORS headers
 */
export function setCorsHeaders(res: NextApiResponse, origin: string = '*'): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Wrap API route with CORS support
 */
export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  origin: string = '*'
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    setCorsHeaders(res, origin);

    if (handleCorsPreFlight(req, res)) {
      return;
    }

    await handler(req, res);
  };
}

// =============================================================================
// CACHING HELPERS
// =============================================================================

/**
 * Set cache control headers
 */
export function setCacheHeaders(
  res: NextApiResponse,
  maxAge: number,
  options: {
    public?: boolean;
    staleWhileRevalidate?: number;
    staleIfError?: number;
  } = {}
): void {
  const directives: string[] = [];

  if (options.public) {
    directives.push('public');
  } else {
    directives.push('private');
  }

  directives.push(`max-age=${maxAge}`);

  if (options.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  res.setHeader('Cache-Control', directives.join(', '));
}

/**
 * Disable caching for sensitive endpoints
 */
export function disableCache(res: NextApiResponse): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

// =============================================================================
// COMPOSITE MIDDLEWARES
// =============================================================================

/**
 * Combine multiple middlewares
 */
export function composeMiddlewares(
  ...middlewares: Array<
    (req: NextApiRequest, res: NextApiResponse, next: () => void) => void | Promise<void>
  >
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= middlewares.length) {
        return;
      }

      const middleware = middlewares[index++];
      if (middleware) {
        await middleware(req, res, next);
      }
    };

    await next();
  };
}

/**
 * Standard API route wrapper with common middlewares
 */
export function createApiRoute(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: {
    methods?: string[];
    rateLimit?: number;
    cors?: boolean | string;
    cache?: number;
  } = {}
) {
  let wrappedHandler = handler;

  // Apply CORS if enabled
  if (options.cors) {
    const origin = typeof options.cors === 'string' ? options.cors : '*';
    wrappedHandler = withCors(wrappedHandler, origin);
  }

  // Apply rate limiting if specified
  if (options.rateLimit) {
    wrappedHandler = withRateLimit(wrappedHandler, options.rateLimit);
  }

  // Apply method checking if specified
  if (options.methods) {
    wrappedHandler = withMethodCheck(options.methods, wrappedHandler);
  } else {
    wrappedHandler = withErrorHandler(wrappedHandler);
  }

  // Apply caching if specified
  if (options.cache && options.cache > 0) {
    const originalHandler = wrappedHandler;
    wrappedHandler = async (req, res) => {
      setCacheHeaders(res, options.cache!, { public: true });
      await originalHandler(req, res);
    };
  }

  return wrappedHandler;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): {
  valid: boolean;
  missingFields: string[];
} {
  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Sanitize object by removing undefined/null values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * 🔍 Validation Functions for DegenScore
 *
 * Reusable validators for common validation scenarios.
 * Provides consistent validation logic across the application.
 */

import { PublicKey } from '@solana/web3.js';
import { VALIDATION, ERROR_MESSAGES } from './constants';

// =============================================================================
// WALLET & ADDRESS VALIDATION
// =============================================================================

/**
 * Validate Solana wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBuffer());
  } catch {
    return false;
  }
}

/**
 * Validate wallet address with detailed error
 */
export function validateWalletAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address || address.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.WALLET_NOT_CONNECTED };
  }

  if (!isValidSolanaAddress(address)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_ADDRESS };
  }

  return { valid: true };
}

// =============================================================================
// USER INPUT VALIDATION
// =============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= VALIDATION.EMAIL_MAX_LENGTH;
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  const { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH } = VALIDATION;

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return false;
  }

  // Alphanumeric, underscores, and hyphens only
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

/**
 * Validate display name format
 */
export function isValidDisplayName(displayName: string): boolean {
  if (!displayName || typeof displayName !== 'string') {
    return false;
  }

  const trimmed = displayName.trim();
  return trimmed.length > 0 && trimmed.length <= VALIDATION.DISPLAY_NAME_MAX_LENGTH;
}

/**
 * Validate bio text
 */
export function isValidBio(bio: string): boolean {
  if (!bio || typeof bio !== 'string') {
    return false;
  }

  return bio.length <= VALIDATION.BIO_MAX_LENGTH;
}

/**
 * Validate Twitter handle
 */
export function isValidTwitterHandle(handle: string): boolean {
  if (!handle || typeof handle !== 'string') {
    return false;
  }

  // Remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  // Twitter handles: 1-15 alphanumeric characters or underscores
  const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
  return twitterRegex.test(cleanHandle);
}

/**
 * Validate Telegram username
 */
export function isValidTelegramUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  // Remove @ if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

  // Telegram usernames: 5-32 alphanumeric characters or underscores
  const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
  return telegramRegex.test(cleanUsername);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// =============================================================================
// NUMERIC VALIDATION
// =============================================================================

/**
 * Validate SOL amount
 */
export function isValidSolAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }

  return amount >= 0 && amount <= VALIDATION.MAX_SOL_AMOUNT;
}

/**
 * Validate percentage value (0-100)
 */
export function isValidPercentage(value: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  return value >= 0 && value <= 100;
}

/**
 * Validate score value (0-100)
 */
export function isValidScore(score: number): boolean {
  if (typeof score !== 'number' || isNaN(score)) {
    return false;
  }

  return score >= 0 && score <= 100 && Number.isFinite(score);
}

/**
 * Validate positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validate non-negative integer
 */
export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

// =============================================================================
// API & REQUEST VALIDATION
// =============================================================================

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, pageSize: number): {
  valid: boolean;
  error?: string;
  normalized?: { page: number; pageSize: number };
} {
  const normalizedPage = Math.max(1, Math.floor(page || 1));
  const normalizedPageSize = Math.min(
    VALIDATION.MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize || VALIDATION.DEFAULT_PAGE_SIZE))
  );

  if (normalizedPage < 1) {
    return { valid: false, error: 'Page must be at least 1' };
  }

  if (normalizedPageSize < 1 || normalizedPageSize > VALIDATION.MAX_PAGE_SIZE) {
    return {
      valid: false,
      error: `Page size must be between 1 and ${VALIDATION.MAX_PAGE_SIZE}`,
    };
  }

  return {
    valid: true,
    normalized: { page: normalizedPage, pageSize: normalizedPageSize },
  };
}

/**
 * Validate sort field and direction
 */
export function validateSort(
  field: string,
  direction: 'asc' | 'desc',
  allowedFields: string[]
): {
  valid: boolean;
  error?: string;
} {
  if (!allowedFields.includes(field)) {
    return {
      valid: false,
      error: `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
    };
  }

  if (direction !== 'asc' && direction !== 'desc') {
    return { valid: false, error: 'Sort direction must be "asc" or "desc"' };
  }

  return { valid: true };
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Search query is required' };
  }

  const trimmed = query.trim();

  if (trimmed.length < VALIDATION.SEARCH_MIN_LENGTH) {
    return {
      valid: false,
      error: `Search query must be at least ${VALIDATION.SEARCH_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > VALIDATION.SEARCH_MAX_LENGTH) {
    return {
      valid: false,
      error: `Search query must not exceed ${VALIDATION.SEARCH_MAX_LENGTH} characters`,
    };
  }

  return { valid: true, normalized: trimmed };
}

// =============================================================================
// TRANSACTION VALIDATION
// =============================================================================

/**
 * Validate transaction signature format
 */
export function isValidTransactionSignature(signature: string): boolean {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  // Solana transaction signatures are base58-encoded and typically 87-88 characters
  const signatureRegex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
  return signatureRegex.test(signature);
}

/**
 * Validate lamports amount
 */
export function isValidLamports(lamports: number): boolean {
  if (typeof lamports !== 'number' || isNaN(lamports)) {
    return false;
  }

  return Number.isInteger(lamports) && lamports >= 0;
}

// =============================================================================
// BADGE & REFERRAL VALIDATION
// =============================================================================

/**
 * Validate badge name
 */
export function isValidBadgeName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Referral codes: 6-12 alphanumeric characters
  const codeRegex = /^[A-Z0-9]{6,12}$/;
  return codeRegex.test(code);
}

// =============================================================================
// FILE VALIDATION
// =============================================================================

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

/**
 * Validate image file size
 */
export function isValidImageSize(sizeInBytes: number): boolean {
  const maxSizeInBytes = VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate image dimensions
 */
export function isValidImageDimensions(
  width: number,
  height: number,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): boolean {
  return (
    width > 0 &&
    height > 0 &&
    width <= maxWidth &&
    height <= maxHeight &&
    Number.isInteger(width) &&
    Number.isInteger(height)
  );
}

// =============================================================================
// COMPOSITE VALIDATORS
// =============================================================================

/**
 * Validate user profile update data
 */
export function validateProfileUpdate(data: {
  displayName?: string;
  bio?: string;
  twitter?: string;
  telegram?: string;
  profileImage?: string;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (data.displayName !== undefined && !isValidDisplayName(data.displayName)) {
    errors.push(
      `Display name must be between 1 and ${VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters`
    );
  }

  if (data.bio !== undefined && !isValidBio(data.bio)) {
    errors.push(`Bio must not exceed ${VALIDATION.BIO_MAX_LENGTH} characters`);
  }

  if (data.twitter !== undefined && data.twitter !== '' && !isValidTwitterHandle(data.twitter)) {
    errors.push('Invalid Twitter handle format');
  }

  if (
    data.telegram !== undefined &&
    data.telegram !== '' &&
    !isValidTelegramUsername(data.telegram)
  ) {
    errors.push('Invalid Telegram username format');
  }

  if (
    data.profileImage !== undefined &&
    data.profileImage !== '' &&
    !isValidUrl(data.profileImage)
  ) {
    errors.push('Invalid profile image URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate card comparison input
 */
export function validateComparisonInput(wallet1: string, wallet2: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const wallet1Validation = validateWalletAddress(wallet1);
  if (!wallet1Validation.valid) {
    errors.push(`Wallet 1: ${wallet1Validation.error}`);
  }

  const wallet2Validation = validateWalletAddress(wallet2);
  if (!wallet2Validation.valid) {
    errors.push(`Wallet 2: ${wallet2Validation.error}`);
  }

  if (wallet1 === wallet2) {
    errors.push('Cannot compare a wallet with itself');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// SANITIZATION HELPERS
// =============================================================================

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Sanitize username (allow only safe characters)
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  return username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, VALIDATION.USERNAME_MAX_LENGTH);
}

/**
 * Sanitize and normalize Twitter handle
 */
export function normalizeTwitterHandle(handle: string): string {
  if (!handle || typeof handle !== 'string') {
    return '';
  }

  // Remove @ and any non-alphanumeric characters except underscore
  return handle.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
}

/**
 * Sanitize and normalize Telegram username
 */
export function normalizeTelegramUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  // Remove @ and any non-alphanumeric characters except underscore
  return username.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
}

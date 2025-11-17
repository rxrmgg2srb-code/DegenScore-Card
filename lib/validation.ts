import { PublicKey } from '@solana/web3.js';
import validator from 'validator';
import xss from 'xss';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

/**
 * Sanitizes a social media handle
 */
export function sanitizeHandle(handle: string): string {
  if (!handle) return '';
  return handle.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 200);
}

/**
 * Sanitizes display name with XSS protection
 */
export function sanitizeDisplayName(name: string): string {
  if (!name) return '';
  // First sanitize with XSS filter
  const cleaned = xss(validator.trim(name));
  // Allow letters, numbers, spaces, and common punctuation
  return cleaned.replace(/[^\w\s\-_.]/g, '').slice(0, 50);
}

/**
 * Validates and sanitizes profile data
 */
export function validateProfileData(data: {
  displayName?: string;
  twitter?: string;
  telegram?: string;
}): { isValid: boolean; errors: string[]; sanitized: typeof data } {
  const errors: string[] = [];
  const sanitized = { ...data };

  // Validate displayName
  if (data.displayName) {
    sanitized.displayName = sanitizeDisplayName(data.displayName);
    if (!sanitized.displayName || sanitized.displayName.length < 1) {
      errors.push('Display name must be at least 1 character');
    }
    if (sanitized.displayName && sanitized.displayName.length > 30) {
      errors.push('Display name must be less than 30 characters');
    }
  }

  // Validate twitter handle
  if (data.twitter) {
    sanitized.twitter = sanitizeHandle(data.twitter);
    if (sanitized.twitter.length > 50) {
      errors.push('Twitter handle must be less than 50 characters');
    }
  }

  // Validate telegram handle
  if (data.telegram) {
    sanitized.telegram = sanitizeHandle(data.telegram);
    if (sanitized.telegram.length > 50) {
      errors.push('Telegram handle must be less than 50 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validates sort field for leaderboard
 */
export const VALID_SORT_FIELDS = ['degenScore', 'totalVolume', 'winRate', 'likes'] as const;
export type SortField = typeof VALID_SORT_FIELDS[number];

export function isValidSortField(field: string): field is SortField {
  return VALID_SORT_FIELDS.includes(field as SortField);
}

/**
 * Validates pagination parameters
 */
export function validatePagination(page?: string | string[], limit?: string | string[]) {
  const pageNum = parseInt(typeof page === 'string' ? page : '1');
  const limitNum = parseInt(typeof limit === 'string' ? limit : '10');

  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : Math.min(pageNum, 1000),
    limit: isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100)
  };
}

/**
 * Validates file types by checking magic numbers (file signatures)
 */
export const VALID_IMAGE_TYPES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
} as const;

export function getFileMagicNumbers(buffer: Buffer): number[] {
  return Array.from(buffer.slice(0, 8));
}

export function isValidImageType(buffer: Buffer, declaredType: string): boolean {
  const magic = VALID_IMAGE_TYPES[declaredType as keyof typeof VALID_IMAGE_TYPES];
  if (!magic) return false;

  const fileHeader = getFileMagicNumbers(buffer);
  return magic.every((byte, i) => fileHeader[i] === byte);
}

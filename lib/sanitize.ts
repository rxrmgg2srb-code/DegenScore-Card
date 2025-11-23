/**
 * Sanitization utilities to prevent XSS attacks
 * Simple server-side implementation without DOMPurify/jsdom
 */

/**
 * Sanitize a string by removing HTML tags, script tags, null bytes, and trimming.
 * Returns an empty string for null/undefined or non‑string inputs.
 */
export function sanitizeString(dirty: string | null | undefined): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  // Remove script tags and their content
  let sanitized = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  // Trim whitespace
  return sanitized.trim();
}

/**
 * Sanitize HTML content to plain text.
 * Strips all tags (including script tags) and returns the cleaned text.
 */
export function sanitizeHTML(dirty: string | null | undefined): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  // Remove script tags first
  let sanitized = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Strip all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  return sanitized.trim();
}

/**
 * Sanitize URL (ensure it's a valid http/https URL or a relative path).
 * Returns an empty string for invalid URLs.
 */
export function sanitizeURL(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  // Allow relative URLs that start with '/'
  if (url.startsWith('/')) {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Recursively sanitize input objects/arrays.
 * Strings are passed through `sanitizeString`.
 */
export function sanitizeInput<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(input as any)) {
      result[key] = sanitizeInput(value);
    }
    return result;
  }
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }
  // numbers, booleans, null, undefined are returned unchanged
  return input;
}

// Backwards‑compatible aliases for existing codebase
export const sanitizeHtml = sanitizeHTML;
export const sanitizeText = sanitizeString;
export const sanitizeDisplayName = (name: string) => {
  const cleaned = sanitizeString(name);
  return cleaned.length > 50 ? cleaned.substring(0, 50) : cleaned;
};
export const sanitizeUrl = sanitizeURL;
export const sanitizeSocialHandle = (handle: string) => {
  if (!handle) return '';
  let sanitized = handle.replace(/^@/, '');
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');
  return sanitized.length > 30 ? sanitized.slice(0, 30) : sanitized;
};
export const sanitizePromoCode = (code: string) => {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize user display name
 */
export function sanitizeDisplayName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove all HTML
  let sanitized = sanitizeText(name);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  // Remove any remaining dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');

  return sanitized;
}

/**
 * Sanitize URL (ensure it's a valid http/https URL)
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize social media handle (Twitter, Telegram, etc)
 */
export function sanitizeSocialHandle(handle: string): string {
  if (!handle || typeof handle !== 'string') {
    return '';
  }

  // Remove @ if present
  let sanitized = handle.replace(/^@/, '');

  // Only allow alphanumeric, underscore, and hyphen
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');

  // Limit length
  if (sanitized.length > 30) {
    sanitized = sanitized.substring(0, 30);
  }

  return sanitized;
}

/**
 * Sanitize promo code
 */
export function sanitizePromoCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }

  // Convert to uppercase and remove non-alphanumeric
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

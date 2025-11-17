/**
 * Sanitization utilities to prevent XSS attacks
 * Simple server-side implementation without DOMPurify/jsdom
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Simple HTML sanitization - remove all tags except allowed ones
  let sanitized = dirty;

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Only keep safe tags: b, i, em, strong, a with href
  sanitized = sanitized.replace(/<(?!\/?(?:b|i|em|strong|a)\b)[^>]+>/gi, '');

  // Remove javascript: and data: from href
  sanitized = sanitized.replace(/href\s*=\s*["']?javascript:/gi, 'href="blocked:');
  sanitized = sanitized.replace(/href\s*=\s*["']?data:/gi, 'href="blocked:');

  return sanitized;
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Remove all HTML tags
  return dirty.replace(/<[^>]*>/g, '').trim();
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

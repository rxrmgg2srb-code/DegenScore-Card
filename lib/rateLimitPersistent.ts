import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

/**
 * Persistent rate limiting using database (or in-memory fallback)
 * Prevents abuse even across server restarts
 *
 * NOTE: RateLimitLog model doesn't exist in schema, using in-memory fallback
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string; // Optional custom identifier
  endpoint?: string; // Optional endpoint tracking
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// In-memory fallback when database is not available
const memoryStore = new Map<string, { count: number; resetAt: Date }>();

/**
 * Get client identifier (IP or wallet)
 */
function getClientIdentifier(req: NextApiRequest, customIdentifier?: string): string {
  if (customIdentifier) {
    return customIdentifier;
  }

  // Try to get IP from various headers
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0] || 'unknown'
      : req.socket.remoteAddress || 'unknown';

  return ip;
}

/**
 * Check rate limit using database persistence
 */
export async function checkRateLimitPersistent(
  req: NextApiRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier: customIdentifier, endpoint } = config;
  const identifier = getClientIdentifier(req, customIdentifier);
  const now = new Date();
  const key = `${identifier}:${endpoint || 'default'}`;

  try {
    // Use in-memory store as fallback (RateLimitLog model doesn't exist)
    const stored = memoryStore.get(key);

    // Clean up expired entries
    if (stored && stored.resetAt < now) {
      memoryStore.delete(key);
    }

    const current = memoryStore.get(key);
    let count = current ? current.count : 0;

    // Periodic cleanup of old entries (1% of requests)
    if (Math.random() < 0.01) {
      for (const [k, v] of memoryStore.entries()) {
        if (v.resetAt < now) {
          memoryStore.delete(k);
        }
      }
    }

    if (count >= maxRequests) {
      // Rate limit exceeded
      const resetAt = current?.resetAt || new Date(now.getTime() + windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Increment count in memory
    const resetAt = new Date(now.getTime() + windowMs);
    memoryStore.set(key, {
      count: count + 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetAt,
    };
  } catch (error) {
    logger.error('Rate limit check failed', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
}

/**
 * Middleware wrapper for persistent rate limiting
 */
export async function rateLimitMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
): Promise<boolean> {
  const result = await checkRateLimitPersistent(req, config);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return false;
  }

  return true;
}

/**
 * Preset configurations for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  // Very strict for expensive operations
  STRICT: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // Default for most API endpoints
  NORMAL: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  // Lenient for read operations
  LENIENT: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // For auth endpoints
  AUTH: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
} as const;

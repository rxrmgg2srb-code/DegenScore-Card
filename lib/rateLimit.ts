import { NextApiRequest, NextApiResponse } from 'next';
import { RATE_LIMIT_CONFIG } from './config';
import { logger } from '@/lib/logger';
import redis from '@/lib/cache/redis'; // ✅ SECURITY: Distributed rate limiting

// ✅ REMOVED: In-memory store (not suitable for production/scaling)
// const store: RateLimitStore = {};

function getClientIdentifier(req: NextApiRequest): string {
  // Try to get the real IP from various headers (for proxies/load balancers)
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (forwarded) {
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    return ip ? ip.trim() : 'unknown';
  }

  if (realIp) {
    const ip = typeof realIp === 'string' ? realIp : realIp[0];
    return ip || 'unknown';
  }

  // Fallback to socket address
  return req.socket.remoteAddress || 'unknown';
}

export type RateLimitConfig = {
  windowMs?: number;
  maxRequests?: number;
};

/**
 * Rate limiting middleware - Redis-based (distributed & persistent)
 * ✅ SECURITY FIX: Migrated from in-memory to Redis for:
 *    - Horizontal scaling support
 *    - Persistence across restarts
 *    - Multi-instance compatibility
 * Returns true if request should be allowed, false if rate limited
 */
export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig = {}
): Promise<boolean> {
  const windowMs = config.windowMs || RATE_LIMIT_CONFIG.WINDOW_MS;
  const maxRequests = config.maxRequests || RATE_LIMIT_CONFIG.MAX_REQUESTS;

  const identifier = getClientIdentifier(req);
  const key = `ratelimit:${req.url}:${identifier}`;

  // ✅ Handle Redis not configured (graceful degradation)
  if (!redis) {
    logger.warn('Redis not configured, rate limiting disabled');
    return true; // Allow request if Redis is not available
  }

  try {
    // ✅ Use Redis for distributed rate limiting
    const currentCount = await redis.get(key);

    if (!currentCount) {
      // First request in this window
      await redis.set(key, '1', { px: windowMs }); // px = milliseconds
      return true;
    }

    const count = parseInt(currentCount as string, 10);

    if (count < maxRequests) {
      // Increment counter
      await redis.incr(key);
      return true;
    }

    // Rate limit exceeded
    const ttl = await redis.pttl(key); // Time to live in milliseconds
    const resetTime = Math.ceil((ttl || 0) / 1000); // Convert to seconds

    res.status(429).json({
      error: 'Too many requests',
      retryAfter: resetTime,
    });
    res.setHeader('Retry-After', resetTime.toString());

    logger.warn('Rate limit exceeded', { identifier, url: req.url, count });
    return false;

  } catch (error) {
    // ✅ Graceful degradation: If Redis is down, allow request but log error
    logger.error('Redis rate limit check failed, allowing request', error instanceof Error ? error : undefined);
    return true; // Fail open to avoid blocking users if Redis is down
  }
}

/**
 * Strict rate limiter for expensive operations (analyze, generate-card)
 */
export async function strictRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  return rateLimit(req, res, {
    windowMs: RATE_LIMIT_CONFIG.STRICT_WINDOW_MS,
    maxRequests: RATE_LIMIT_CONFIG.STRICT_MAX_REQUESTS,
  });
}

/**
 * Payment rate limiter (prevents payment spam/attacks)
 */
export async function paymentRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  return rateLimit(req, res, {
    windowMs: RATE_LIMIT_CONFIG.PAYMENT_WINDOW_MS,
    maxRequests: RATE_LIMIT_CONFIG.PAYMENT_MAX_REQUESTS,
  });
}


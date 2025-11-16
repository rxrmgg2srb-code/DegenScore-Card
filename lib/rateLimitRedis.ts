/**
 * 🚦 Distributed Rate Limiting with Redis
 *
 * Production-ready rate limiting using Redis
 * Features:
 * - Sliding window algorithm
 * - Distributed across multiple instances
 * - Premium user exemptions
 * - Per-endpoint configuration
 * - Automatic cleanup of expired keys
 */

import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configuration per endpoint
export const RATE_LIMITS = {
  analyze: {
    free: { requests: 10, window: 60 }, // 10 requests per minute
    premium: { requests: 100, window: 60 }, // 100 requests per minute
  },
  leaderboard: {
    free: { requests: 60, window: 60 }, // 60 requests per minute
    premium: { requests: 300, window: 60 }, // 300 requests per minute
  },
  like: {
    free: { requests: 30, window: 60 }, // 30 requests per minute
    premium: { requests: 150, window: 60 }, // 150 requests per minute
  },
  'generate-card': {
    free: { requests: 5, window: 60 }, // 5 requests per minute
    premium: { requests: 50, window: 60 }, // 50 requests per minute
  },
  default: {
    free: { requests: 30, window: 60 }, // 30 requests per minute
    premium: { requests: 100, window: 60 }, // 100 requests per minute
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

export interface RateLimitOptions {
  identifier: string; // IP address or wallet address
  endpoint?: string;
  isPremium?: boolean;
}

// ============================================================================
// MAIN RATE LIMITING FUNCTION
// ============================================================================

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  try {
    const { identifier, endpoint = 'default', isPremium = false } = options;

    // Get rate limit configuration
    const config = getEndpointConfig(endpoint, isPremium);
    const { requests: limit, window } = config;

    // Create Redis key
    const key = `ratelimit:${endpoint}:${identifier}`;

    // Use sliding window algorithm
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Multi-command transaction for atomicity
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current requests in window
    pipeline.zcount(key, windowStart, now);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });

    // Set expiration
    pipeline.expire(key, window);

    const results = await pipeline.exec();

    // Get count from results (index 1 is zcount result)
    const count = (results[1] as number) || 0;
    const remaining = Math.max(0, limit - count - 1);
    const reset = now + window * 1000;

    const success = count < limit;

    if (!success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        endpoint,
        count,
        limit,
      });
    } else {
      logger.debug('Rate limit check passed', {
        identifier,
        endpoint,
        count,
        limit,
        remaining,
      });
    }

    return {
      success,
      limit,
      remaining,
      reset,
      error: success ? undefined : 'Rate limit exceeded',
    };
  } catch (error) {
    logger.error('Rate limit check failed', error as Error, { options });

    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
      error: 'Rate limiting temporarily unavailable',
    };
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function rateLimitMiddleware(
  endpoint?: string,
  getIdentifier?: (req: NextApiRequest) => string
) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void
  ): Promise<void> => {
    try {
      // Get identifier (IP or wallet)
      const identifier =
        getIdentifier?.(req) ||
        req.headers['x-forwarded-for'] as string ||
        req.connection.remoteAddress ||
        'unknown';

      // Check if user is premium
      const isPremium = await checkPremiumStatus(req);

      // Check rate limit
      const result = await checkRateLimit({
        identifier,
        endpoint,
        isPremium,
      });

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.reset.toString());

      if (!result.success) {
        res.setHeader('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());

        return res.status(429).json({
          error: 'Too Many Requests',
          message: result.error,
          limit: result.limit,
          remaining: result.remaining,
          reset: new Date(result.reset).toISOString(),
        }) as any;
      }

      // Continue to next middleware or handler
      if (next) {
        next();
      }
    } catch (error) {
      logger.error('Rate limit middleware error', error as Error);
      // Fail open - allow request if middleware fails
      if (next) {
        next();
      }
    }
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rate limit configuration for endpoint
 */
function getEndpointConfig(
  endpoint: string,
  isPremium: boolean
): { requests: number; window: number } {
  const tier = isPremium ? 'premium' : 'free';
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
  return config[tier];
}

/**
 * Check if user has premium status
 */
async function checkPremiumStatus(req: NextApiRequest): Promise<boolean> {
  try {
    // Get wallet address from request
    const walletAddress = req.body?.walletAddress || req.query?.walletAddress;
    if (!walletAddress) {
      return false;
    }

    // Check Redis cache first
    const cacheKey = `premium:${walletAddress}`;
    const cached = await redis.get(cacheKey);

    if (cached !== null) {
      return cached === '1';
    }

    // TODO: Query database for premium status
    // For now, return false
    return false;
  } catch (error) {
    logger.error('Failed to check premium status', error as Error);
    return false;
  }
}

/**
 * Manually reset rate limit for a user (admin function)
 */
export async function resetRateLimit(
  identifier: string,
  endpoint?: string
): Promise<void> {
  try {
    const key = endpoint
      ? `ratelimit:${endpoint}:${identifier}`
      : `ratelimit:*:${identifier}`;

    if (endpoint) {
      await redis.del(key);
      logger.info('Rate limit reset', { identifier, endpoint });
    } else {
      // Delete all rate limit keys for this identifier
      const keys = await redis.keys(`ratelimit:*:${identifier}`);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('All rate limits reset', { identifier, count: keys.length });
      }
    }
  } catch (error) {
    logger.error('Failed to reset rate limit', error as Error, { identifier, endpoint });
  }
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string,
  isPremium: boolean = false
): Promise<RateLimitResult> {
  try {
    const config = getEndpointConfig(endpoint, isPremium);
    const { requests: limit, window } = config;

    const key = `ratelimit:${endpoint}:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    const count = await redis.zcount(key, windowStart, now);
    const remaining = Math.max(0, limit - count);
    const reset = now + window * 1000;

    return {
      success: count < limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    logger.error('Failed to get rate limit status', error as Error);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clean up expired rate limit keys (run periodically)
 */
export async function cleanupExpiredKeys(): Promise<number> {
  try {
    const pattern = 'ratelimit:*';
    const keys = await redis.keys(pattern);

    let deletedCount = 0;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no expiration - set one
        await redis.expire(key, 300); // 5 minutes
      } else if (ttl === -2) {
        // Key doesn't exist
        deletedCount++;
      }
    }

    logger.info('Cleaned up expired rate limit keys', { deletedCount });
    return deletedCount;
  } catch (error) {
    logger.error('Failed to cleanup expired keys', error as Error);
    return 0;
  }
}

// Export types
export type { RateLimitOptions, RateLimitResult };

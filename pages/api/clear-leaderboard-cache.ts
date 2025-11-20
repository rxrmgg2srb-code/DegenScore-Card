import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { logger } from '../../lib/logger';

/**
 * API endpoint to clear ALL leaderboard caches
 * Usage: GET /api/clear-leaderboard-cache?secret=YOUR_SECRET
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Redis is configured
    const isRedisEnabled = !!(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );

    if (!isRedisEnabled) {
      return res.status(200).json({
        success: true,
        message: 'Redis not configured, no cache to clear',
      });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    logger.info('🗑️ Clearing ALL leaderboard caches...');

    // Delete all leaderboard cache keys (different sort options and limits)
    const patterns = [
      'leaderboard:likes:*',
      'leaderboard:referralCount:*',
      'leaderboard:badgePoints:*',
      'leaderboard:degenScore:*',
      'leaderboard:totalVolume:*',
      'leaderboard:winRate:*',
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      try {
        // Get all keys matching pattern
        const keys = await redis.keys(pattern);

        if (keys && keys.length > 0) {
          // Delete all matching keys
          await redis.del(...keys);
          totalDeleted += keys.length;
          logger.info(`Deleted ${keys.length} keys matching ${pattern}`);
        }
      } catch (error) {
        logger.warn(`Failed to delete pattern ${pattern}:`, error);
      }
    }

    logger.info(`✅ Cleared ${totalDeleted} leaderboard cache keys`);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({
      success: true,
      message: `Successfully cleared ${totalDeleted} leaderboard cache keys`,
      patterns,
    });
  } catch (error) {
    logger.error('Error clearing leaderboard cache:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    res.status(500).json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

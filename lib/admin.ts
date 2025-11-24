/**
 * Admin Analytics and Management Module
 * Provides analytics, monitoring, and system management functions
 */

import prisma from './prisma';
import logger from './logger';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export interface AdminAnalytics {
  users: number;
  wallets: number;
  totalTrades: number;
  avgScore: number;
  activeUsers: number;
  completedCards: number;
}

export interface AdminUser {
  id: number;
  wallet: string;
  score: number;
  rank: number;
  createdAt: Date;
  cardsGenerated: number;
}

export interface SystemSettings {
  maxPremiumSlots: number;
  cardGenerationTimeout: number;
  redisEnabled: boolean;
  enableNotifications: boolean;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  database: boolean;
  cache: boolean;
  uptime: number;
}

/**
 * Get comprehensive admin analytics
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  try {
    const [userCount, walletCount, scoreData, cardData, thirtyDaysAgo] = await Promise.all([
      prisma.user.count(),
      prisma.wallet.count(),
      prisma.score.aggregate({
        _avg: { score: true },
      }),
      prisma.degenCard.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      users: userCount,
      wallets: walletCount,
      totalTrades: 0, // Would be calculated from actual trade data
      avgScore: scoreData._avg.score ?? 0,
      activeUsers: thirtyDaysAgo,
      completedCards: cardData,
    };
  } catch (error) {
    logger.error('Error getting admin analytics:', error);
    throw error;
  }
}

/**
 * Get paginated list of admin users with their stats
 */
export async function getAdminUsers(page = 1, limit = 20): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
}> {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          score: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          degenCard: {
            select: { id: true },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        wallet: user.wallet || 'unknown',
        score: user.score?.[0]?.score ?? 0,
        rank: user.score?.[0]?.rank ?? 0,
        createdAt: user.createdAt,
        cardsGenerated: user.degenCard?.length ?? 0,
      })),
      total,
      page,
    };
  } catch (error) {
    logger.error('Error getting admin users:', error);
    throw error;
  }
}

/**
 * Update system-wide settings
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<{ success: boolean; updated: SystemSettings }> {
  try {
    // Store in cache and return
    const key = 'system:settings';
    const current = (await redis.get(key)) || {};
    const updated = { ...current, ...settings };

    await redis.set(key, JSON.stringify(updated), { ex: 86400 }); // 24h expiry

    return {
      success: true,
      updated: updated as SystemSettings,
    };
  } catch (error) {
    logger.error('Error updating system settings:', error);
    throw error;
  }
}

/**
 * Get metrics for SuperToken analysis
 */
export async function getSuperTokenMetrics(): Promise<{
  tokens: number;
  volume: number;
  topTokens: Array<{ symbol: string; volume: number }>;
}> {
  try {
    const tokenCount = await prisma.tokenAnalysis.count();

    const topTokens = await prisma.tokenAnalysis.findMany({
      orderBy: { marketCap: 'desc' },
      take: 5,
      select: { symbol: true, marketCap: true },
    });

    return {
      tokens: tokenCount,
      volume: topTokens.reduce((sum, t) => sum + (t.marketCap || 0), 0),
      topTokens: topTokens.map((t) => ({
        symbol: t.symbol || 'UNKNOWN',
        volume: t.marketCap || 0,
      })),
    };
  } catch (error) {
    logger.error('Error getting super token metrics:', error);
    throw error;
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // Check database connectivity
    const dbStart = Date.now();
    await prisma.user.count();
    const dbHealth = Date.now() - dbStart < 5000;

    // Check cache connectivity
    let cacheHealth = false;
    try {
      await redis.ping();
      cacheHealth = true;
    } catch {
      cacheHealth = false;
    }

    // Get system metrics
    const uptime = process.uptime();
    const memUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;

    return {
      cpu: 0, // Would use os.cpus() for real CPU
      memory: Math.round(memUsage * 100),
      database: dbHealth,
      cache: cacheHealth,
      uptime: Math.round(uptime),
    };
  } catch (error) {
    logger.error('Error getting system health:', error);
    throw error;
  }
}

/**
 * Sync database - perform integrity checks and cleanup
 */
export async function syncDatabase(): Promise<{
  success: boolean;
  message: string;
  cleaned: number;
}> {
  try {
    // Clean up orphaned records
    const deletedScores = await prisma.score.deleteMany({
      where: {
        user: {
          is: null,
        },
      },
    });

    logger.info(`Database sync completed: deleted ${deletedScores.count} orphaned records`);

    return {
      success: true,
      message: 'Database sync completed successfully',
      cleaned: deletedScores.count,
    };
  } catch (error) {
    logger.error('Error syncing database:', error);
    throw error;
  }
}

/**
 * Get daily statistics
 */
export async function getDailyStats(days = 7): Promise<{
  date: string;
  newUsers: number;
  cardsGenerated: number;
  avgScore: number;
}[]> {
  try {
    const stats = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [newUsers, cardsGenerated, avgScore] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        }),
        prisma.degenCard.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        }),
        prisma.score.aggregate({
          _avg: { score: true },
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        }),
      ]);

      stats.push({
        date: dayStart.toISOString().split('T')[0],
        newUsers,
        cardsGenerated,
        avgScore: avgScore._avg.score ?? 0,
      });
    }

    return stats;
  } catch (error) {
    logger.error('Error getting daily stats:', error);
    throw error;
  }
}

/**
 * Clear cache for testing/maintenance
 */
export async function clearCache(): Promise<{ success: boolean; message: string }> {
  try {
    await redis.flushall();
    logger.info('Cache cleared successfully');
    return { success: true, message: 'Cache cleared' };
  } catch (error) {
    logger.error('Error clearing cache:', error);
    throw error;
  }
}

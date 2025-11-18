import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSortField, validatePagination } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';
import { cacheGetOrSet, CacheKeys } from '../../lib/cache/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!(await rateLimit(req, res))) {
    return;
  }

  try {
    const { sortBy = 'degenScore', limit: limitParam } = req.query;

    // Validate and sanitize sort field
    const sortField = isValidSortField(sortBy as string) ? sortBy as string : 'degenScore';

    // Validate limit
    const { limit } = validatePagination(undefined, limitParam);
    const safeLimit = Math.min(limit, 100); // Max 100 entries

    logger.debug('Leaderboard request:', { sortBy: sortField, limit: safeLimit });

    // 🚀 OPTIMIZACIÓN: Cachear leaderboard por 5 minutos
    const cacheKey = `${CacheKeys.leaderboard()}:${sortField}:${safeLimit}`;
    const result = await cacheGetOrSet(
      cacheKey,
      async () => {
        // SOLO mostrar cards de quienes pagaron/descargaron (isPaid = true)
        // Y excluir cards eliminadas (deletedAt = null)
        const cards = await prisma.degenCard.findMany({
          where: {
            isPaid: true,
            deletedAt: null, // ✅ Solo mostrar cards activas (no eliminadas)
          },
          orderBy: {
            [sortField]: 'desc',
          },
          take: safeLimit,
          include: {
            badges: true,
          },
        });

        // Stats solo de cards pagadas y activas (no eliminadas)
        const statsWhere = { isPaid: true, deletedAt: null };

        const totalCards = await prisma.degenCard.count({
          where: statsWhere,
        });

        const avgScore = await prisma.degenCard.aggregate({
          where: statsWhere,
          _avg: { degenScore: true },
        });

        const topScore = await prisma.degenCard.aggregate({
          where: statsWhere,
          _max: { degenScore: true },
        });

        const totalVolume = await prisma.degenCard.aggregate({
          where: statsWhere,
          _sum: { totalVolume: true },
        });

        return {
          success: true,
          leaderboard: cards,
          stats: {
            totalCards,
            avgScore: avgScore._avg.degenScore || 0,
            topScore: topScore._max.degenScore || 0,
            totalVolume: totalVolume._sum.totalVolume || 0,
          },
        };
      },
      { ttl: 300 } // 5 minutos
    );

    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos
    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Error fetching leaderboard:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to fetch leaderboard';

    res.status(500).json({ error: errorMessage });
  }
}

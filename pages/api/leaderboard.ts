import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSortField, validatePagination } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';
import { cacheGetOrSet, CacheKeys } from '../../lib/cache/redis';
import { checkAllBadges } from '../../lib/badges-with-points';

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
    const { sortBy = 'likes', limit: limitParam } = req.query;

    // Validate and sanitize sort field - ahora aceptamos: likes, referralCount, badgePoints
    const validSortFields = ['likes', 'referralCount', 'badgePoints', 'degenScore', 'totalVolume', 'winRate'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'likes';

    // Validate limit
    const { limit } = validatePagination(undefined, limitParam);
    const safeLimit = Math.min(limit, 100); // Max 100 entries

    logger.debug('Leaderboard request:', { sortBy: sortField, limit: safeLimit });

    // 🚀 OPTIMIZACIÓN: Cachear leaderboard por 5 minutos
    const cacheKey = `${CacheKeys.leaderboard()}:${sortField}:${safeLimit}`;
    const result = await cacheGetOrSet(
      cacheKey,
      async () => {
        // SOLO mostrar cards de quienes pagaron/descargaron (isPaid = true) y no eliminadas
        const cards = await prisma.degenCard.findMany({
          where: {
            isPaid: true,
            deletedAt: null, // Exclude soft-deleted cards
          },
          include: {
            badges: true,
          },
        });

        // Calcular badgePoints y referralCount para cada card
        const cardsWithExtras = await Promise.all(
          cards.map(async (card) => {
            // Calcular badge points
            const { totalPoints } = checkAllBadges({
              totalVolume: card.totalVolume,
              profitLoss: card.profitLoss,
              winRate: card.winRate,
              totalTrades: card.totalTrades,
              tradingDays: card.tradingDays,
              moonshots: card.moonshots,
              diamondHands: card.diamondHands,
              isPaid: card.isPaid,
              twitter: card.twitter,
              telegram: card.telegram,
              profileImage: card.profileImage,
              displayName: card.displayName,
            });

            // Obtener conteo de referidos (solo los que pagaron)
            const referralCount = await prisma.referral.count({
              where: {
                referrerAddress: card.walletAddress,
                hasPaid: true,
              },
            });

            return {
              ...card,
              badgePoints: totalPoints,
              referralCount,
            };
          })
        );

        // Ordenar según el campo solicitado
        let sortedCards = [...cardsWithExtras];
        if (sortField === 'badgePoints' || sortField === 'referralCount') {
          sortedCards.sort((a, b) => {
            const aValue = sortField === 'badgePoints' ? (a.badgePoints || 0) : (a.referralCount || 0);
            const bValue = sortField === 'badgePoints' ? (b.badgePoints || 0) : (b.referralCount || 0);
            return bValue - aValue; // DESC
          });
        } else {
          // Para otros campos (likes, degenScore, etc.), ya vienen ordenados de Prisma
          // pero los re-ordenamos por si acaso después de añadir los campos extra
          sortedCards.sort((a, b) => {
            const aValue = (a as any)[sortField] || 0;
            const bValue = (b as any)[sortField] || 0;
            return bValue - aValue; // DESC
          });
        }

        // Limitar resultados
        const limitedCards = sortedCards.slice(0, safeLimit);

        // Stats solo de cards pagadas y no eliminadas
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
          leaderboard: limitedCards,
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

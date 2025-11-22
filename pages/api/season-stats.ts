import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
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
    // Cache por 5 minutos
    const result = await cacheGetOrSet(
      CacheKeys.seasonStats(),
      async () => {
        // Top 5 most liked cards
        const topLiked = await prisma.degenCard.findMany({
          where: {
            isPaid: true,
            deletedAt: null,
            likes: { gt: 0 },
          },
          orderBy: { likes: 'desc' },
          take: 5,
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
            degenScore: true,
            likes: true,
            profileImage: true,
          },
        });

        // Top 5 referrers (mock data por ahora - cuando implementes referrals, actualiza esto)
        const topReferrers = await prisma.degenCard.groupBy({
          by: ['walletAddress'],
          where: {
            isPaid: true,
            deletedAt: null,
          },
          _count: {
            walletAddress: true,
          },
          orderBy: {
            _count: {
              walletAddress: 'desc',
            },
          },
          take: 5,
        });

        // Get display names for referrers
        const referrersWithDetails = await Promise.all(
          topReferrers.map(async (r) => {
            const card = await prisma.degenCard.findFirst({
              where: {
                walletAddress: r.walletAddress,
                isPaid: true,
                deletedAt: null,
              },
              select: {
                displayName: true,
                profileImage: true,
              },
            });

            return {
              wallet: r.walletAddress,
              displayName: card?.displayName,
              referralCount: r._count.walletAddress - 1, // -1 porque cuenta la card propia
              profileImage: card?.profileImage,
            };
          })
        );

        // Filter out users with 0 referrals
        const validReferrers = referrersWithDetails.filter(r => r.referralCount > 0);

        // Recent achievements (placeholder - cuando implementes achievements, actualiza esto)
        const recentAchievements = [
          {
            name: 'First Blood',
            description: 'First degen to reach 90+ score',
            emoji: '🩸',
            unlockedBy: topLiked.length > 0 && topLiked[0].degenScore >= 90 ? 1 : 0,
          },
          {
            name: 'Popular Kid',
            description: 'Got 10+ likes on your card',
            emoji: '⭐',
            unlockedBy: topLiked.filter(c => c.likes >= 10).length,
          },
          {
            name: 'Community Builder',
            description: 'Referred 5+ degens',
            emoji: '🏗️',
            unlockedBy: validReferrers.filter(r => r.referralCount >= 5).length,
          },
        ].filter(a => a.unlockedBy > 0);

        // Total stats
        const totalCards = await prisma.degenCard.count({
          where: { isPaid: true, deletedAt: null },
        });

        const totalLikesResult = await prisma.degenCard.aggregate({
          where: { isPaid: true, deletedAt: null },
          _sum: { likes: true },
        });

        const totalLikes = totalLikesResult._sum.likes || 0;

        // Season start (primera card creada)
        const firstCard = await prisma.degenCard.findFirst({
          where: { isPaid: true, deletedAt: null },
          orderBy: { mintedAt: 'asc' },
          select: { mintedAt: true },
        });

        return {
          success: true,
          topLiked,
          topReferrers: validReferrers,
          recentAchievements,
          seasonStart: firstCard?.mintedAt?.toISOString() || new Date().toISOString(),
          totalCards,
          totalLikes,
        };
      },
      { ttl: 300 } // 5 minutos
    );

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Error fetching season stats:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to fetch season stats';

    res.status(500).json({ error: errorMessage });
  }
}

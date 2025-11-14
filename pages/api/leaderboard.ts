import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSortField, validatePagination } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimit';
import { logger } from '../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!rateLimit(req, res)) {
    return;
  }

  try {
    const { sortBy = 'degenScore', limit: limitParam } = req.query;

    // Validate and sanitize sort field
    const sortField = isValidSortField(sortBy as string) ? sortBy as string : 'degenScore';

    // Validate limit
    const { limit } = validatePagination(undefined, limitParam);
    const safeLimit = Math.min(limit, 100); // Max 100 entries

    logger.debug('Leaderboard request - sortBy:', sortField, 'limit:', safeLimit);

    // SOLO mostrar cards de quienes pagaron/descargaron (isPaid = true)
    const cards = await prisma.degenCard.findMany({
      where: {
        isPaid: true,
      },
      orderBy: {
        [sortField]: 'desc',
      },
      take: safeLimit,
      include: {
        badges: true,
      },
    });

    // Stats solo de cards pagadas
    const totalCards = await prisma.degenCard.count({
      where: { isPaid: true },
    });
    
    const avgScore = await prisma.degenCard.aggregate({
      where: { isPaid: true },
      _avg: { degenScore: true },
    });
    
    const topScore = await prisma.degenCard.aggregate({
      where: { isPaid: true },
      _max: { degenScore: true },
    });
    
    const totalVolume = await prisma.degenCard.aggregate({
      where: { isPaid: true },
      _sum: { totalVolume: true },
    });

    res.status(200).json({
      success: true,
      leaderboard: cards,
      stats: {
        totalCards,
        avgScore: avgScore._avg.degenScore || 0,
        topScore: topScore._max.degenScore || 0,
        totalVolume: totalVolume._sum.totalVolume || 0,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching leaderboard:', error);

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to fetch leaderboard';

    res.status(500).json({ error: errorMessage });
  }
}

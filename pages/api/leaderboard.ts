import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sortBy = 'degenScore', limit = 100 } = req.query;

    // SOLO mostrar cards de quienes pagaron/descargaron (isPaid = true)
    const cards = await prisma.degenCard.findMany({
      where: {
        isPaid: true, // 🔥 FILTRO CLAVE: Solo mostrar quien pagó
      },
      orderBy: {
        [sortBy as string]: 'desc',
      },
      take: parseInt(limit as string),
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
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

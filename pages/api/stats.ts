import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiLimiter } from '../../lib/rateLimit';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get all stats in parallel for better performance
    const [
      totalCards,
      cardsToday,
      totalPremiumCards,
      totalVolume,
    ] = await Promise.all([
      // Total cards (all time)
      prisma.degenCard.count(),

      // Cards created today
      prisma.degenCard.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      // Total premium cards
      prisma.degenCard.count({
        where: {
          isPaid: true,
        },
      }),

      // Total volume (sum of all confirmed payments)
      prisma.payment.aggregate({
        where: {
          status: 'confirmed',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const volume = totalVolume._sum.amount || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalCards,
        cardsToday,
        totalPremiumCards,
        totalVolume: Math.round(volume * 100) / 100, // Round to 2 decimals
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

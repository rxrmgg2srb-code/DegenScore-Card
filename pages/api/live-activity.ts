import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiLimiter } from '../../lib/rateLimit';

const prisma = new PrismaClient();

interface Activity {
  id: string;
  type: 'card_created' | 'premium_upgrade' | 'high_score';
  walletAddress: string;
  displayName: string | null;
  degenScore: number;
  timestamp: Date;
  icon: string;
  message: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get recent activities (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent card creations
    const recentCards = await prisma.degenCard.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        walletAddress: true,
        displayName: true,
        degenScore: true,
        isPaid: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Transform to activity feed format
    const activities: Activity[] = [];

    recentCards.forEach((card) => {
      // Check if it's a new card or an upgrade
      const isUpgrade = card.updatedAt.getTime() - card.createdAt.getTime() > 60000; // More than 1 min diff

      if (card.isPaid && isUpgrade) {
        // Premium upgrade activity
        activities.push({
          id: `upgrade-${card.walletAddress}-${card.updatedAt.getTime()}`,
          type: 'premium_upgrade',
          walletAddress: card.walletAddress,
          displayName: card.displayName,
          degenScore: card.degenScore,
          timestamp: card.updatedAt,
          icon: '💎',
          message: `${card.displayName || 'Anon Degen'} upgraded to Premium!`,
        });
      }

      // High score activity (>= 80)
      if (card.degenScore >= 80) {
        activities.push({
          id: `score-${card.walletAddress}-${card.createdAt.getTime()}`,
          type: 'high_score',
          walletAddress: card.walletAddress,
          displayName: card.displayName,
          degenScore: card.degenScore,
          timestamp: card.createdAt,
          icon: card.degenScore >= 95 ? '👑' : card.degenScore >= 90 ? '🔥' : '⚡',
          message: `${card.displayName || 'Anon Degen'} scored ${card.degenScore}/100!`,
        });
      } else {
        // Regular card creation
        activities.push({
          id: `card-${card.walletAddress}-${card.createdAt.getTime()}`,
          type: 'card_created',
          walletAddress: card.walletAddress,
          displayName: card.displayName,
          degenScore: card.degenScore,
          timestamp: card.createdAt,
          icon: '🎴',
          message: `${card.displayName || 'Anon Degen'} generated their card!`,
        });
      }
    });

    // Sort by timestamp descending and take top 10
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return res.status(200).json({ activities: sortedActivities });
  } catch (error) {
    console.error('Error fetching live activity:', error);
    return res.status(500).json({ error: 'Failed to fetch live activity' });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

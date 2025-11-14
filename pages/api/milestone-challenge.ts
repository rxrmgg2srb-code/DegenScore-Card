import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Count total premium cards
    const totalPremiumCards = await prisma.card.count({
      where: {
        isPaid: true
      }
    });

    // Find the card with most likes (current leader)
    const currentLeader = await prisma.card.findFirst({
      where: {
        isPaid: true
      },
      orderBy: {
        likesCount: 'desc'
      },
      select: {
        walletAddress: true,
        displayName: true,
        likesCount: true,
        degenScore: true
      }
    });

    const milestoneTarget = 100;
    const progress = Math.min(totalPremiumCards, milestoneTarget);
    const percentage = Math.round((progress / milestoneTarget) * 100);
    const isCompleted = totalPremiumCards >= milestoneTarget;

    return res.status(200).json({
      totalPremiumCards,
      milestoneTarget,
      progress,
      percentage,
      isCompleted,
      currentLeader,
      prizeAmount: 1 // 1 SOL
    });

  } catch (error) {
    console.error('Error fetching milestone challenge:', error);
    return res.status(500).json({ error: 'Failed to fetch milestone challenge' });
  } finally {
    await prisma.$disconnect();
  }
}

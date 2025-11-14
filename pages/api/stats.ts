import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count users who upgraded today (paid or used promo code)
    const upgradesCount = await prisma.card.count({
      where: {
        isPaid: true,
        updatedAt: {
          gte: today
        }
      }
    });

    // Count total premium users (all time)
    const totalPremiumUsers = await prisma.card.count({
      where: {
        isPaid: true
      }
    });

    // Calculate percentage for "founder slots" (example: assume 500 total slots)
    const founderSlotsTotal = 500;
    const founderSlotsUsed = Math.min(totalPremiumUsers, founderSlotsTotal);
    const founderPercentage = Math.round((founderSlotsUsed / founderSlotsTotal) * 100);

    return res.status(200).json({
      upgradesCount,
      totalPremiumUsers,
      founderPercentage,
      founderSlotsUsed,
      founderSlotsTotal
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

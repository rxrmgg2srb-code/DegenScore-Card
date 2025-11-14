import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isValidSolanaAddress } from '../../../lib/validation';
import { apiLimiter } from '../../../lib/rateLimit';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string' || !isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
      select: {
        referralCode: true,
        totalReferrals: true,
        paidReferrals: true,
        isPaid: true,
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Get list of referred users (optional, for showing who they referred)
    const referrals = await prisma.degenCard.findMany({
      where: { referredBy: walletAddress },
      select: {
        walletAddress: true,
        displayName: true,
        isPaid: true,
        degenScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      referralCode: card.referralCode,
      totalReferrals: card.totalReferrals,
      paidReferrals: card.paidReferrals,
      isPremium: card.isPaid,
      referrals,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return res.status(500).json({ error: 'Failed to fetch referral stats' });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

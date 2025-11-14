import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isValidSolanaAddress } from '../../lib/validation';
import { apiLimiter } from '../../lib/rateLimit';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.query;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ error: 'Invalid wallet parameter' });
  }

  if (!isValidSolanaAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid Solana address format' });
  }

  try {
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress: wallet },
      select: {
        walletAddress: true,
        displayName: true,
        degenScore: true,
        isPaid: true,
        createdAt: true,
        twitter: true,
        telegram: true,
        totalReferrals: true,
        paidReferrals: true,
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Determine tier based on score
    const getTier = (score: number) => {
      if (score >= 86) return 'Whale';
      if (score >= 71) return 'Shark';
      if (score >= 51) return 'Dolphin';
      if (score >= 31) return 'Fish';
      return 'Plankton';
    };

    return res.status(200).json({
      card: {
        ...card,
        tier: getTier(card.degenScore),
        createdAt: card.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return res.status(500).json({ error: 'Failed to fetch card' });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

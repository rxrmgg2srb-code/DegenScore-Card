import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isValidSolanaAddress } from '../../../lib/validation';
import { apiLimiter } from '../../../lib/rateLimit';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a unique referral code
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.body;

  if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Check if user already has a card
    let card = await prisma.degenCard.findUnique({
      where: { walletAddress },
      select: { referralCode: true, isPaid: true }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Only paid users can get referral codes
    if (!card.isPaid) {
      return res.status(403).json({ error: 'Only premium users can generate referral codes' });
    }

    // If they already have a code, return it
    if (card.referralCode) {
      return res.status(200).json({ referralCode: card.referralCode });
    }

    // Generate a unique referral code
    let referralCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      referralCode = generateReferralCode();
      const existing = await prisma.degenCard.findUnique({
        where: { referralCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    // Update user with referral code
    await prisma.degenCard.update({
      where: { walletAddress },
      data: { referralCode: referralCode! },
    });

    return res.status(200).json({ referralCode: referralCode! });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return res.status(500).json({ error: 'Failed to generate referral code' });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

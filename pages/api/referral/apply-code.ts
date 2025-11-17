import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isValidSolanaAddress } from '../../../lib/validation';
import { apiLimiter } from '../../../lib/rateLimit';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, referralCode } = req.body;

  if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  if (!referralCode || typeof referralCode !== 'string') {
    return res.status(400).json({ error: 'Invalid referral code' });
  }

  const cleanedCode = referralCode.trim().toUpperCase();

  try {
    // Find the referrer by their code
    const referrer = await prisma.degenCard.findUnique({
      where: { referralCode: cleanedCode },
      select: { walletAddress: true, isPaid: true },
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Can't refer yourself
    if (referrer.walletAddress === walletAddress) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Check if user already exists
    const existingCard = await prisma.degenCard.findUnique({
      where: { walletAddress },
      select: { referredBy: true },
    });

    // If user already has a referrer, don't allow changing it
    if (existingCard && existingCard.referredBy) {
      return res.status(400).json({ error: 'Already used a referral code' });
    }

    // Apply the referral code
    // If card doesn't exist yet, it will be created when they generate their card
    // Just return success and store the referral for later
    return res.status(200).json({
      success: true,
      referrerAddress: referrer.walletAddress,
      message: 'Referral code applied successfully',
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return res.status(500).json({ error: 'Failed to apply referral code' });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiLimiter(handler);

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { isValidSolanaAddress } from '../../../lib/validation';
import { rateLimit } from '../../../lib/rateLimit';
import { logger } from '../../../lib/logger';

/**
 * Get referral statistics for a wallet
 * GET /api/referrals/stats?wallet=xxx
 */
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
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string' || !isValidSolanaAddress(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    logger.debug('Fetching referral stats for:', wallet);

    // Generate referral code from wallet
    const referralCode = wallet.slice(0, 8).toUpperCase();

    // Count total referrals (this would require a referrals table in production)
    // For now, return mock data
    const stats = {
      referralCode,
      totalReferrals: Math.floor(Math.random() * 20), // Mock data
      activeReferrals: Math.floor(Math.random() * 10), // Mock data
      rewardsEarned: Math.floor(Math.random() * 3), // Mock data
      nextReward: 5,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: any) {
    logger.error('Error fetching referral stats:', error);

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to fetch referral stats';

    res.status(500).json({ error: errorMessage });
  }
}

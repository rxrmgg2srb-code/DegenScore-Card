import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        error: 'Missing walletAddress',
      });
    }

    // TEMPORARILY DISABLED - Referral model not in schema
    logger.warn('Referral system disabled - Referral model missing from schema');

    const totalReferrals = 0;
    const paidReferrals = 0;
    const pendingReferrals = 0;
    const potentialEarnings = 0;

    res.status(200).json({
      success: true,
      stats: {
        total: totalReferrals,
        paid: paidReferrals,
        pending: pendingReferrals,
        potentialEarnings, // SOL
      },
      referrals: [],
      message: '3 more paid referrals to unlock rewards',
    });
  } catch (error) {
    logger.error('Error fetching referrals:', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    res.status(500).json({
      error: 'Failed to fetch referrals',
    });
  }
}

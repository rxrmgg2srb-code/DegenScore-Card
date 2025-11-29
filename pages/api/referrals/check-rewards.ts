import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { isValidSolanaAddress } from '../../../lib/validation';
import { rateLimit } from '../../../lib/rateLimit';
import { logger } from '../../../lib/logger';

/**
 * Referral reward tiers
 */
const REFERRAL_REWARDS = [
  {
    minReferrals: 3,
    badge: 'Influencer',
    badgeDescription: 'Brought 3 degens to the platform',
    proMonths: 1,
    sol: 0,
  },
  {
    minReferrals: 10,
    badge: 'Whale Hunter',
    badgeDescription: 'Recruited 10 degens successfully',
    proMonths: 0,
    sol: 0.1,
  },
  {
    minReferrals: 25,
    badge: 'Viral King',
    badgeDescription: 'Built an army of 25+ degens',
    proMonths: 3,
    sol: 0.3,
  },
  {
    minReferrals: 50,
    badge: 'Legend',
    badgeDescription: 'Achieved legendary status with 50+ referrals',
    proMonths: 0,
    sol: 1.0,
    vipLifetime: true,
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!(await rateLimit(req, res))) {
    return;
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Missing wallet address' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    logger.debug('Checking referral rewards for:', { walletAddress });

    // TEMPORARILY DISABLED - Referral model not in schema
    logger.warn('Referral system disabled - Referral model missing from schema');

    const response = {
      totalReferrals: 0,
      paidReferrals: 0,
      pendingReferrals: 0,
      unlockedRewards: [],
      claimableRewards: [],
      nextMilestone: REFERRAL_REWARDS[0]
        ? {
            badge: REFERRAL_REWARDS[0].badge,
            requiredReferrals: REFERRAL_REWARDS[0].minReferrals,
            remaining: REFERRAL_REWARDS[0].minReferrals,
            reward: {
              proMonths: REFERRAL_REWARDS[0].proMonths,
              sol: REFERRAL_REWARDS[0].sol,
              vipLifetime: REFERRAL_REWARDS[0].vipLifetime || false,
            },
          }
        : null,
      currentTier: 'FREE',
      hasClaimable: false,
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error checking referral rewards:', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    res.status(500).json({
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to check rewards',
    });
  }
}

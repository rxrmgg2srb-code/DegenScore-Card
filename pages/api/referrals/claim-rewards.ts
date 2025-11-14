import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { isValidSolanaAddress } from '../../../lib/validation';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '../../../lib/rateLimitPersistent';
import { logger } from '../../../lib/logger';

/**
 * Referral reward tiers (same as check-rewards)
 */
const REFERRAL_REWARDS = [
  {
    minReferrals: 3,
    badge: 'Influencer',
    badgeDescription: 'Brought 3 degens to the platform',
    badgeIcon: '🎯',
    badgeRarity: 'RARE',
    proMonths: 1,
    sol: 0,
  },
  {
    minReferrals: 10,
    badge: 'Whale Hunter',
    badgeDescription: 'Recruited 10 degens successfully',
    badgeIcon: '🐋',
    badgeRarity: 'EPIC',
    proMonths: 0,
    sol: 0.1,
  },
  {
    minReferrals: 25,
    badge: 'Viral King',
    badgeDescription: 'Built an army of 25+ degens',
    badgeIcon: '👑',
    badgeRarity: 'LEGENDARY',
    proMonths: 3,
    sol: 0.3,
  },
  {
    minReferrals: 50,
    badge: 'Legend',
    badgeDescription: 'Achieved legendary status with 50+ referrals',
    badgeIcon: '⭐',
    badgeRarity: 'MYTHIC',
    proMonths: 0,
    sol: 1.0,
    vipLifetime: true,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply strict rate limiting
  if (!(await rateLimitMiddleware(req, res, RATE_LIMIT_PRESETS.STRICT))) {
    return;
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    logger.info('Claiming referral rewards for:', walletAddress);

    const result = await prisma.$transaction(async (tx) => {
      // Count paid referrals
      const paidReferralsCount = await tx.referral.count({
        where: {
          referrerAddress: walletAddress,
          hasPaid: true,
        },
      });

      // Get card
      const card = await tx.degenCard.findUnique({
        where: { walletAddress },
        include: { badges: true },
      });

      if (!card) {
        throw new Error('Card not found. Generate your metrics first.');
      }

      // Determine unlocked but unclaimed rewards
      const claimableRewards = [];
      for (const reward of REFERRAL_REWARDS) {
        if (paidReferralsCount >= reward.minReferrals) {
          const hasBadge = card.badges.some(b => b.name === reward.badge);
          if (!hasBadge) {
            claimableRewards.push(reward);
          }
        }
      }

      if (claimableRewards.length === 0) {
        throw new Error('No rewards available to claim');
      }

      // Award all claimable rewards
      const awardedRewards = [];
      let totalProMonths = 0;
      let totalSol = 0;
      let grantVipLifetime = false;

      for (const reward of claimableRewards) {
        // Add badge
        await tx.badge.create({
          data: {
            cardId: card.id,
            name: reward.badge,
            description: reward.badgeDescription,
            icon: reward.badgeIcon,
            rarity: reward.badgeRarity,
          },
        });

        totalProMonths += reward.proMonths;
        totalSol += reward.sol;
        if (reward.vipLifetime) {
          grantVipLifetime = true;
        }

        awardedRewards.push({
          badge: reward.badge,
          proMonths: reward.proMonths,
          sol: reward.sol,
          vipLifetime: reward.vipLifetime || false,
        });

        logger.info(`Awarded ${reward.badge} badge to ${walletAddress}`);
      }

      // Update subscription if PRO months awarded
      if (totalProMonths > 0 || grantVipLifetime) {
        const subscription = await tx.subscription.findUnique({
          where: { walletAddress },
        });

        const now = new Date();
        let newExpiresAt: Date | null = null;

        if (grantVipLifetime) {
          // VIP lifetime = 100 years from now
          newExpiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
        } else if (subscription?.expiresAt && subscription.expiresAt > now) {
          // Extend existing subscription
          newExpiresAt = new Date(
            subscription.expiresAt.getTime() + totalProMonths * 30 * 24 * 60 * 60 * 1000
          );
        } else {
          // Create new subscription
          newExpiresAt = new Date(now.getTime() + totalProMonths * 30 * 24 * 60 * 60 * 1000);
        }

        await tx.subscription.upsert({
          where: { walletAddress },
          create: {
            walletAddress,
            tier: 'PRO',
            expiresAt: newExpiresAt,
          },
          update: {
            tier: 'PRO',
            expiresAt: newExpiresAt,
          },
        });
      }

      // Mark referrals as rewarded (future use)
      await tx.referral.updateMany({
        where: {
          referrerAddress: walletAddress,
          hasPaid: true,
          rewardPaid: false,
        },
        data: {
          rewardPaid: true,
          rewardAmount: totalSol,
        },
      });

      return {
        awardedRewards,
        totalProMonths,
        totalSol,
        vipLifetime: grantVipLifetime,
      };
    });

    logger.info('Referral rewards claimed successfully:', result);

    res.status(200).json({
      success: true,
      message: 'Rewards claimed successfully!',
      rewards: result.awardedRewards,
      summary: {
        proMonthsAdded: result.totalProMonths,
        solEarned: result.totalSol,
        vipLifetime: result.vipLifetime,
      },
    });
  } catch (error: any) {
    logger.error('Error claiming referral rewards:', error);
    res.status(400).json({
      error: error.message || 'Failed to claim rewards',
    });
  }
}

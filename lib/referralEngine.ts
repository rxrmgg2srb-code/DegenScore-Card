/**
 * 🔥 Viral Referral Engine
 *
 * Multi-level referral system (3 levels deep) with rewards
 * Designed to create exponential user growth through economic incentives.
 *
 * Structure:
 * - Level 1 (Direct): 20% of referral's earnings
 * - Level 2: 10% of Level 1's referrals
 * - Level 3: 5% of Level 2's referrals
 *
 * Milestones:
 * - 5 referrals: Badge + 5,000 $DEGEN
 * - 25 referrals: Badge + 50,000 $DEGEN + NFT
 * - 100 referrals: Badge + 500,000 $DEGEN + Lifetime VIP
 * - 500 referrals: Badge + 10% equity stake
 */

import { prisma } from './prisma';

// ============================================================================
// TYPES
// ============================================================================

export interface ReferralStats {
  totalReferrals: number;
  level1Referrals: number;
  level2Referrals: number;
  level3Referrals: number;
  totalEarnings: number;
  pendingRewards: number;
  claimedRewards: number;
  currentTier: ReferralTier;
  nextMilestone: ReferralMilestone | null;
}

export enum ReferralTier {
  NONE = 'NONE',
  INFLUENCER = 'INFLUENCER',        // 5 referrals
  WHALE_HUNTER = 'WHALE_HUNTER',    // 25 referrals
  VIRAL_KING = 'VIRAL_KING',        // 100 referrals
  LEGEND = 'LEGEND',                // 500 referrals
}

export interface ReferralMilestone {
  tier: ReferralTier;
  requiredReferrals: number;
  rewards: {
    degenTokens: number;
    badge: string;
    perks: string[];
  };
}

// ============================================================================
// MILESTONES CONFIGURATION
// ============================================================================

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    tier: ReferralTier.INFLUENCER,
    requiredReferrals: 5,
    rewards: {
      degenTokens: 5000,
      badge: 'Influencer',
      perks: ['Basic referral tracking', 'Public referral stats'],
    },
  },
  {
    tier: ReferralTier.WHALE_HUNTER,
    requiredReferrals: 25,
    rewards: {
      degenTokens: 50000,
      badge: 'Whale Hunter',
      perks: ['Exclusive NFT', 'Featured on homepage', '1 month PRO subscription'],
    },
  },
  {
    tier: ReferralTier.VIRAL_KING,
    requiredReferrals: 100,
    rewards: {
      degenTokens: 500000,
      badge: 'Viral King',
      perks: ['Lifetime VIP', 'Custom profile badge', 'Priority support'],
    },
  },
  {
    tier: ReferralTier.LEGEND,
    requiredReferrals: 500,
    rewards: {
      degenTokens: 0, // Special reward handled separately
      badge: 'Legend',
      perks: ['10% equity stake', 'Advisory board seat', 'Revenue sharing'],
    },
  },
];

// Reward percentages by level
export const REWARD_PERCENTAGES = {
  LEVEL_1: 0.20, // 20%
  LEVEL_2: 0.10, // 10%
  LEVEL_3: 0.05, // 5%
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate a unique referral code for a wallet
 */
export function generateReferralCode(walletAddress: string): string {
  // Use first 6 chars of wallet + random suffix
  const prefix = walletAddress.slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

/**
 * Track a referral (when someone signs up using a code)
 */
export async function trackReferral(
  referrerCode: string,
  newUserWallet: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find referrer by code
    const referrer = await prisma.degenCard.findFirst({
      where: {
        // Assuming we add a referralCode field to DegenCard
        displayName: referrerCode, // Temporary - should be separate field
      },
    });

    if (!referrer) {
      return { success: false, error: 'Invalid referral code' };
    }

    // Prevent self-referral
    if (referrer.walletAddress === newUserWallet) {
      return { success: false, error: 'Cannot refer yourself' };
    }

    // Check if user already has a referrer
    const existingReferral = await prisma.referral.findUnique({
      where: { referredWallet: newUserWallet },
    });

    if (existingReferral) {
      return { success: false, error: 'User already has a referrer' };
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerWallet: referrer.walletAddress,
        referredWallet: newUserWallet,
        code: referrerCode,
        status: 'ACTIVE',
        level: 1, // Direct referral
      },
    });

    // Create Level 2 and Level 3 referral links
    await createMultiLevelReferrals(referrer.walletAddress, newUserWallet);

    // Check for milestone rewards
    await checkAndAwardMilestones(referrer.walletAddress);

    return { success: true };
  } catch (error) {
    console.error('Error tracking referral:', error);
    return { success: false, error: 'Failed to track referral' };
  }
}

/**
 * Create multi-level referral relationships
 */
async function createMultiLevelReferrals(
  level1Referrer: string,
  newUser: string
): Promise<void> {
  // Find Level 1's referrer (would be Level 2 for new user)
  const level1Ref = await prisma.referral.findFirst({
    where: { referredWallet: level1Referrer },
  });

  if (level1Ref) {
    // Create Level 2 referral
    await prisma.referral.create({
      data: {
        referrerWallet: level1Ref.referrerWallet,
        referredWallet: newUser,
        code: level1Ref.code,
        status: 'ACTIVE',
        level: 2,
      },
    });

    // Find Level 2's referrer (would be Level 3 for new user)
    const level2Ref = await prisma.referral.findFirst({
      where: { referredWallet: level1Ref.referrerWallet },
    });

    if (level2Ref) {
      // Create Level 3 referral
      await prisma.referral.create({
        data: {
          referrerWallet: level2Ref.referrerWallet,
          referredWallet: newUser,
          code: level2Ref.code,
          status: 'ACTIVE',
          level: 3,
        },
      });
    }
  }
}

/**
 * Award earnings to referrers when a referred user earns $DEGEN
 */
export async function distributeReferralRewards(
  userWallet: string,
  amount: number
): Promise<void> {
  try {
    // Find all referral relationships for this user
    const referrals = await prisma.referral.findMany({
      where: {
        referredWallet: userWallet,
        status: 'ACTIVE',
      },
    });

    for (const referral of referrals) {
      let rewardPercentage = 0;

      switch (referral.level) {
        case 1:
          rewardPercentage = REWARD_PERCENTAGES.LEVEL_1;
          break;
        case 2:
          rewardPercentage = REWARD_PERCENTAGES.LEVEL_2;
          break;
        case 3:
          rewardPercentage = REWARD_PERCENTAGES.LEVEL_3;
          break;
      }

      const rewardAmount = amount * rewardPercentage;

      // Update referral earnings
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          totalEarnings: {
            increment: rewardAmount,
          },
        },
      });

      // Log the reward
      await prisma.activityLog.create({
        data: {
          walletAddress: referral.referrerWallet,
          action: 'REFERRAL_REWARD',
          details: JSON.stringify({
            from: userWallet,
            amount: rewardAmount,
            level: referral.level,
          }),
        },
      });

      console.log(
        `💰 Referral reward: ${referral.referrerWallet} earned ${rewardAmount} $DEGEN (Level ${referral.level})`
      );
    }
  } catch (error) {
    console.error('Error distributing referral rewards:', error);
  }
}

/**
 * Check if user reached a new milestone and award rewards
 */
async function checkAndAwardMilestones(referrerWallet: string): Promise<void> {
  const stats = await getReferralStats(referrerWallet);

  for (const milestone of REFERRAL_MILESTONES) {
    if (stats.totalReferrals >= milestone.requiredReferrals) {
      // Check if already awarded
      const existingAward = await prisma.activityLog.findFirst({
        where: {
          walletAddress: referrerWallet,
          action: 'MILESTONE_ACHIEVED',
          details: {
            contains: milestone.tier,
          },
        },
      });

      if (!existingAward) {
        // Award milestone rewards
        await awardMilestone(referrerWallet, milestone);
      }
    }
  }
}

/**
 * Award a milestone to a user
 */
async function awardMilestone(
  wallet: string,
  milestone: ReferralMilestone
): Promise<void> {
  // Award badge
  await prisma.badge.create({
    data: {
      cardId: wallet, // Assuming badge is linked to card
      name: milestone.rewards.badge,
      description: `Achieved ${milestone.requiredReferrals} referrals`,
      icon: `milestone-${milestone.tier.toLowerCase()}`,
      rarity: milestone.tier === ReferralTier.LEGEND ? 'LEGENDARY' : 'EPIC',
    },
  });

  // Log milestone achievement
  await prisma.activityLog.create({
    data: {
      walletAddress: wallet,
      action: 'MILESTONE_ACHIEVED',
      details: JSON.stringify({
        tier: milestone.tier,
        rewards: milestone.rewards,
      }),
    },
  });

  console.log(
    `🏆 Milestone achieved: ${wallet} reached ${milestone.tier} (${milestone.requiredReferrals} referrals)`
  );
}

/**
 * Get referral statistics for a wallet
 */
export async function getReferralStats(wallet: string): Promise<ReferralStats> {
  const referrals = await prisma.referral.findMany({
    where: {
      referrerWallet: wallet,
      status: 'ACTIVE',
    },
  });

  const level1 = referrals.filter(r => r.level === 1).length;
  const level2 = referrals.filter(r => r.level === 2).length;
  const level3 = referrals.filter(r => r.level === 3).length;
  const totalReferrals = level1 + level2 + level3;

  const totalEarnings = referrals.reduce((sum, r) => sum + r.totalEarnings, 0);
  const claimedRewards = referrals.reduce((sum, r) => sum + r.rewardsClaimed, 0);
  const pendingRewards = totalEarnings - claimedRewards;

  // Determine current tier
  let currentTier = ReferralTier.NONE;
  for (const milestone of [...REFERRAL_MILESTONES].reverse()) {
    if (totalReferrals >= milestone.requiredReferrals) {
      currentTier = milestone.tier;
      break;
    }
  }

  // Find next milestone
  const nextMilestone = REFERRAL_MILESTONES.find(
    m => totalReferrals < m.requiredReferrals
  ) || null;

  return {
    totalReferrals,
    level1Referrals: level1,
    level2Referrals: level2,
    level3Referrals: level3,
    totalEarnings,
    pendingRewards,
    claimedRewards,
    currentTier,
    nextMilestone,
  };
}

/**
 * Claim pending referral rewards
 */
export async function claimReferralRewards(
  wallet: string
): Promise<{ success: boolean; amount: number; error?: string }> {
  try {
    const stats = await getReferralStats(wallet);

    if (stats.pendingRewards === 0) {
      return { success: false, amount: 0, error: 'No pending rewards' };
    }

    // Update all referrals as claimed
    await prisma.referral.updateMany({
      where: {
        referrerWallet: wallet,
        status: 'ACTIVE',
      },
      data: {
        rewardsClaimed: {
          increment: stats.pendingRewards,
        },
      },
    });

    // Log the claim
    await prisma.activityLog.create({
      data: {
        walletAddress: wallet,
        action: 'REWARDS_CLAIMED',
        details: JSON.stringify({
          amount: stats.pendingRewards,
          type: 'referral',
        }),
      },
    });

    return { success: true, amount: stats.pendingRewards };
  } catch (error) {
    console.error('Error claiming rewards:', error);
    return { success: false, amount: 0, error: 'Failed to claim rewards' };
  }
}

/**
 * Get leaderboard of top referrers
 */
export async function getReferralLeaderboard(limit: number = 100): Promise<any[]> {
  const topReferrers = await prisma.referral.groupBy({
    by: ['referrerWallet'],
    where: {
      status: 'ACTIVE',
      level: 1, // Only count direct referrals
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  // Enrich with wallet data
  const enriched = await Promise.all(
    topReferrers.map(async (item) => {
      const card = await prisma.degenCard.findUnique({
        where: { walletAddress: item.referrerWallet },
        select: {
          displayName: true,
          profileImage: true,
          degenScore: true,
        },
      });

      const stats = await getReferralStats(item.referrerWallet);

      return {
        wallet: item.referrerWallet,
        displayName: card?.displayName || 'Anonymous',
        profileImage: card?.profileImage,
        degenScore: card?.degenScore || 0,
        totalReferrals: stats.totalReferrals,
        directReferrals: item._count.id,
        totalEarnings: stats.totalEarnings,
        tier: stats.currentTier,
      };
    })
  );

  return enriched;
}

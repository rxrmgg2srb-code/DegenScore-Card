/**
 * 🔥 Viral Referral Engine
 *
 * ⚠️ TEMPORARILY DISABLED - Referral model missing from Prisma schema
 * TODO: Add Referral model to prisma/schema.prisma to re-enable
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

// import { prisma } from './prisma'; // Temporarily disabled
import { logger } from '@/lib/logger';

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
  INFLUENCER = 'INFLUENCER', // 5 referrals
  WHALE_HUNTER = 'WHALE_HUNTER', // 25 referrals
  VIRAL_KING = 'VIRAL_KING', // 100 referrals
  LEGEND = 'LEGEND', // 500 referrals
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
      perks: ['Lifetime VIP status', 'Custom NFT', 'Revenue share program'],
    },
  },
  {
    tier: ReferralTier.LEGEND,
    requiredReferrals: 500,
    rewards: {
      degenTokens: 5000000,
      badge: 'Legend',
      perks: ['10% equity stake', 'Board advisor position', 'Custom perks'],
    },
  },
];

// ============================================================================
// CORE FUNCTIONS (TEMPORARILY DISABLED)
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
 * TEMPORARILY DISABLED - Referral model not in schema
 */
export async function trackReferral(
  _referrerCode: string,
  _newUserWallet: string
): Promise<{ success: boolean; error?: string }> {
  logger.warn('Referral system disabled - Referral model missing from schema');
  return { success: false, error: 'Referral system temporarily disabled' };
}

/**
 * Distribute referral rewards (multi-level)
 * TEMPORARILY DISABLED - Referral model not in schema
 */
export async function distributeReferralRewards(_userWallet: string, _amount: number): Promise<void> {
  logger.warn('Referral rewards disabled - Referral model missing from schema');
  // Do nothing
}

/**
 * Get referral statistics for a wallet
 * TEMPORARILY DISABLED - Referral model not in schema
 */
export async function getReferralStats(_wallet: string): Promise<ReferralStats> {
  logger.warn('Referral stats disabled - Referral model missing from schema');
  return {
    totalReferrals: 0,
    level1Referrals: 0,
    level2Referrals: 0,
    level3Referrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    claimedRewards: 0,
    currentTier: ReferralTier.NONE,
    nextMilestone: REFERRAL_MILESTONES[0] || null,
  };
}

/**
 * Claim referral rewards
 * TEMPORARILY DISABLED - Referral model not in schema
 */
export async function claimReferralRewards(
  _wallet: string
): Promise<{ success: boolean; amount: number; error?: string }> {
  logger.warn('Referral claim disabled - Referral model missing from schema');
  return { success: false, amount: 0, error: 'Referral system temporarily disabled' };
}

/**
 * Get referral leaderboard
 * TEMPORARILY DISABLED - Referral model not in schema
 */
export async function getReferralLeaderboard(_limit: number = 100): Promise<any[]> {
  logger.warn('Referral leaderboard disabled - Referral model missing from schema');
  return [];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate current tier based on total referrals
 */
export function calculateTier(totalReferrals: number): ReferralTier {
  if (totalReferrals >= 500) return ReferralTier.LEGEND;
  if (totalReferrals >= 100) return ReferralTier.VIRAL_KING;
  if (totalReferrals >= 25) return ReferralTier.WHALE_HUNTER;
  if (totalReferrals >= 5) return ReferralTier.INFLUENCER;
  return ReferralTier.NONE;
}

/**
 * Get next milestone for a wallet
 */
export function getNextMilestone(totalReferrals: number): ReferralMilestone | null {
  return (
    REFERRAL_MILESTONES.find((m) => m.requiredReferrals > totalReferrals) || null
  );
}

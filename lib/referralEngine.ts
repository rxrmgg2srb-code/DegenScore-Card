/**
 * 🔥 Viral Referral Engine - DISABLED
 *
 * NOTE: Referral model doesn't exist in Prisma schema.
 * This is a stub file to prevent build errors.
 * All functions return empty/default values.
 */

import { logger } from '@/lib/logger';

export interface ReferralStats {
  totalReferrals: number;
  level1Referrals: number;
  level2Referrals: number;
  level3Referrals: number;
  totalEarnings: number;
  pendingRewards: number;
  claimedRewards: number;
  nextMilestone: {
    referralsNeeded: number;
    reward: string;
  } | null;
}

export interface ReferralLeaderboard {
  rank: number;
  walletAddress: string;
  totalReferrals: number;
  totalEarnings: number;
}

// Stub function - returns empty stats
export async function trackReferral(
  referrerCode: string,
  newUserWallet: string
): Promise<{ success: boolean; message: string }> {
  logger.warn('[ReferralEngine] Disabled - Referral model not in schema');
  return {
    success: false,
    message: 'Referral system currently disabled',
  };
}

// Stub function - returns empty stats
export async function getReferralStats(walletAddress: string): Promise<ReferralStats> {
  return {
    totalReferrals: 0,
    level1Referrals: 0,
    level2Referrals: 0,
    level3Referrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    claimedRewards: 0,
    nextMilestone: null,
  };
}

// Stub function - returns empty array
export async function getReferralLeaderboard(limit: number = 10): Promise<ReferralLeaderboard[]> {
  return [];
}

// Stub function - returns failure
export async function claimReferralRewards(
  walletAddress: string
): Promise<{ success: boolean; amount: number; message: string }> {
  return {
    success: false,
    amount: 0,
    message: 'Referral system currently disabled',
  };
}

// Stub function - returns empty object
export async function processReferralReward(
  walletAddress: string,
  amount: number
): Promise<void> {
  logger.warn('[ReferralEngine] Disabled - No-op');
}

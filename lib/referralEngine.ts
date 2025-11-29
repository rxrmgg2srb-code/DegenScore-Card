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
  _referrerCode: string,
  _newUserWallet: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  logger.warn('[ReferralEngine] Disabled - Referral model not in schema');
  return {
    success: false,
    error: 'Referral system currently disabled',
  };
}

// Stub function - returns empty stats
export async function getReferralStats(_walletAddress: string): Promise<ReferralStats> {
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
export async function getReferralLeaderboard(_limit: number = 10): Promise<ReferralLeaderboard[]> {
  return [];
}

// Stub function - returns failure
export async function claimReferralRewards(
  _walletAddress: string
): Promise<{ success: boolean; amount: number; message?: string; error?: string }> {
  return {
    success: false,
    amount: 0,
    error: 'Referral system currently disabled',
  };
}

// Stub function - returns empty object
export async function processReferralReward(
  _walletAddress: string,
  _amount: number
): Promise<void> {
  logger.warn('[ReferralEngine] Disabled - No-op');
}

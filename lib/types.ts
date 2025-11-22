/**
 * 📦 Shared TypeScript Types for DegenScore
 *
 * Centralized type definitions to avoid duplication
 * and ensure consistency across the application.
 */

import { PublicKey } from '@solana/web3.js';

// =============================================================================
// WALLET & USER TYPES
// =============================================================================

/**
 * Wallet address type - can be string or PublicKey
 */
export type WalletAddress = string | PublicKey;

/**
 * User profile data
 */
export interface UserProfile {
  walletAddress: string;
  displayName?: string | null;
  profileImage?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// CARD & SCORE TYPES
// =============================================================================

/**
 * Trading card data structure
 */
export interface DegenCard {
  id: string;
  walletAddress: string;
  degenScore: number;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  level: number;
  xp: number;
  bestTrade: number;
  worstTrade: number;
  badges: string[];
  mintedAt: string;
  isPaid?: boolean;
  likes: number;
  badgePoints?: number;
  referralCount?: number;
  displayName?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  profileImage?: string | null;
}

/**
 * Comparison winner type
 */
export type WinnerType = 'wallet1' | 'wallet2' | 'tie';

/**
 * Wallet data for comparison
 */
export interface WalletComparisonData {
  address: string;
  displayName?: string;
  degenScore: number;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  bestTrade: number;
  badges: number;
  likes: number;
}

/**
 * Comparison winner metrics
 */
export interface ComparisonWinner {
  degenScore: WinnerType;
  totalTrades: WinnerType;
  totalVolume: WinnerType;
  profitLoss: WinnerType;
  winRate: WinnerType;
  bestTrade: WinnerType;
  badges: WinnerType;
  likes: WinnerType;
}

/**
 * Full comparison data
 */
export interface CardComparison {
  wallet1: WalletComparisonData;
  wallet2: WalletComparisonData;
  differences?: Record<string, number>;
  winner: ComparisonWinner;
}

// =============================================================================
// BADGE TYPES
// =============================================================================

/**
 * Badge rarity levels
 */
export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

/**
 * Badge definition
 */
export interface Badge {
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

// =============================================================================
// REFERRAL TYPES
// =============================================================================

/**
 * Referral milestone
 */
export interface ReferralMilestone {
  referrals: number;
  reward: number;
  tier: string;
}

/**
 * Referral statistics
 */
export interface ReferralStats {
  totalReferrals: number;
  level1Referrals: number;
  level2Referrals: number;
  level3Referrals: number;
  totalEarnings: number;
  pendingRewards: number;
  claimedRewards: number;
  currentTier: string;
  nextMilestone: ReferralMilestone | null;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  environment: string;
  uptime: number;
  checks: {
    nodeEnv: boolean;
    database: boolean;
    helius: boolean;
    jwt: boolean;
  };
}

// =============================================================================
// TRANSACTION & TRADING TYPES
// =============================================================================

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Trading position
 */
export interface TradingPosition {
  token: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  profitLoss?: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
}

// =============================================================================
// LEADERBOARD TYPES
// =============================================================================

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry extends DegenCard {
  rank?: number;
  calculatedBadges?: Badge[];
}

/**
 * Leaderboard stats
 */
export interface LeaderboardStats {
  totalCards: number;
  avgScore: number;
  topScore: number;
  totalVolume: number;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification data
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extract promise type
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

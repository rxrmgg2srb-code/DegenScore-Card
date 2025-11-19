/**
 * 🛡️ Zod Validation Schemas for API Endpoints
 *
 * Comprehensive input validation for all user-facing APIs
 * Prevents injection attacks, XSS, and invalid data
 */

import { z } from 'zod';
import { isValidSolanaAddress } from '../validation';

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 CUSTOM VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Custom Zod validator for Solana wallet addresses
 */
const solanaAddressSchema = z.string()
  .min(32, 'Wallet address is too short')
  .max(44, 'Wallet address is too long')
  .refine(
    (address) => isValidSolanaAddress(address),
    'Invalid Solana wallet address format'
  );

/**
 * Social media handle validator (Twitter, Telegram)
 * Allows: alphanumeric, underscore
 * Max length: 200 chars
 */
const socialHandleSchema = z.string()
  .min(1, 'Handle cannot be empty')
  .max(200, 'Handle is too long (max 200 characters)')
  .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores')
  .optional()
  .or(z.literal(''));

/**
 * Display name validator
 * Allows: letters, numbers, spaces, hyphens, underscores, dots
 * Max length: 50 chars
 */
const displayNameSchema = z.string()
  .min(1, 'Display name cannot be empty')
  .max(50, 'Display name is too long (max 50 characters)')
  .regex(/^[\w\s\-_.]+$/, 'Display name contains invalid characters')
  .optional()
  .or(z.literal(''));

/**
 * Profile image URL validator
 * Supports: http/https URLs or relative paths starting with /
 */
const profileImageSchema = z.string()
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'),
    'Invalid profile image URL'
  )
  .optional()
  .or(z.literal(''));

// ═══════════════════════════════════════════════════════════════════════════
// 📋 API REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wallet analysis request - /api/analyze
 */
export const analyzeWalletSchema = z.object({
  walletAddress: solanaAddressSchema,
});

export type AnalyzeWalletInput = z.infer<typeof analyzeWalletSchema>;

/**
 * Badge schema for card data
 */
const badgeSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500),
  icon: z.string().max(50),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']),
});

/**
 * Analysis data schema for save-card endpoint
 */
const analysisDataSchema = z.object({
  degenScore: z.number().min(0).max(100),
  totalTrades: z.number().min(0),
  totalVolume: z.number().min(0),
  profitLoss: z.number(),
  winRate: z.number().min(0).max(100),
  bestTrade: z.number(),
  worstTrade: z.number(),
  avgTradeSize: z.number().min(0),
  totalFees: z.number().min(0),
  tradingDays: z.number().min(0),
  level: z.number().min(1),
  xp: z.number().min(0),
  rugsSurvived: z.number().min(0),
  rugsCaught: z.number().min(0),
  totalRugValue: z.number().min(0),
  moonshots: z.number().min(0),
  avgHoldTime: z.number().min(0),
  quickFlips: z.number().min(0),
  diamondHands: z.number().min(0),
  realizedPnL: z.number(),
  unrealizedPnL: z.number(),
  firstTradeDate: z.string().datetime().optional().or(z.literal('')),
  longestWinStreak: z.number().min(0),
  longestLossStreak: z.number().min(0),
  volatilityScore: z.number().min(0).max(100),
  badges: z.array(badgeSchema).optional().default([]),
});

/**
 * Save card request - /api/save-card
 */
export const saveCardSchema = z.object({
  walletAddress: solanaAddressSchema,
  analysisData: analysisDataSchema,
});

export type SaveCardInput = z.infer<typeof saveCardSchema>;

/**
 * Update profile request - /api/update-profile
 */
export const updateProfileSchema = z.object({
  walletAddress: solanaAddressSchema,
  displayName: displayNameSchema,
  twitter: socialHandleSchema,
  telegram: socialHandleSchema,
  profileImage: profileImageSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Generate card request - /api/generate-card
 */
export const generateCardSchema = z.object({
  walletAddress: solanaAddressSchema,
});

export type GenerateCardInput = z.infer<typeof generateCardSchema>;

/**
 * Token analysis request - /api/analyze-token
 */
export const analyzeTokenSchema = z.object({
  tokenAddress: solanaAddressSchema,
});

export type AnalyzeTokenInput = z.infer<typeof analyzeTokenSchema>;

/**
 * Compare wallets request - /api/compare-cards
 */
export const compareWalletsSchema = z.object({
  wallet1: solanaAddressSchema,
  wallet2: solanaAddressSchema,
});

export type CompareWalletsInput = z.infer<typeof compareWalletsSchema>;

/**
 * Leaderboard request - /api/leaderboard
 */
export const leaderboardSchema = z.object({
  sortBy: z.enum(['degenScore', 'totalVolume', 'winRate', 'likes']).optional().default('degenScore'),
  page: z.number().min(1).max(1000).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type LeaderboardInput = z.infer<typeof leaderboardSchema>;

/**
 * Like card request - /api/like
 */
export const likeCardSchema = z.object({
  walletAddress: solanaAddressSchema,
  liked: z.boolean(),
});

export type LikeCardInput = z.infer<typeof likeCardSchema>;

/**
 * Payment verification request - /api/verify-payment
 */
export const verifyPaymentSchema = z.object({
  signature: z.string().min(64).max(128),
  walletAddress: solanaAddressSchema,
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/**
 * Promo code application request - /api/apply-promo-code
 */
export const applyPromoCodeSchema = z.object({
  walletAddress: solanaAddressSchema,
  promoCode: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/, 'Invalid promo code format'),
});

export type ApplyPromoCodeInput = z.infer<typeof applyPromoCodeSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ VALIDATION HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates request body against a Zod schema
 * Returns parsed data or throws validation error
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safely validates request body and returns result
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Formats Zod validation errors for user-friendly API responses
 */
export function formatValidationError(error: z.ZodError): {
  error: string;
  details: Array<{ field: string; message: string }>;
} {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

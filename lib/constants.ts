/**
 * 🎯 Application Constants
 *
 * Centralized constants to avoid magic numbers and strings
 * scattered throughout the codebase.
 */

// =============================================================================
// SCORE & LEVEL CONSTANTS
// =============================================================================

export const SCORE = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 50,
  EXCELLENT_THRESHOLD: 80,
  GOOD_THRESHOLD: 60,
  AVERAGE_THRESHOLD: 40,
} as const;

export const LEVEL = {
  MIN: 1,
  MAX: 100,
  XP_PER_LEVEL: 1000,
} as const;

// =============================================================================
// TRADING THRESHOLDS
// =============================================================================

export const TRADING = {
  MIN_TRADES_FOR_SCORE: 10,
  MOONSHOT_MULTIPLIER: 100, // 100x gain
  RUG_LOSS_THRESHOLD: -0.9, // -90% loss
  DIAMOND_HANDS_DAYS: 30,
  MIN_VOLUME_SOL: 0.1,
  HIGH_VOLUME_THRESHOLD: 1000, // SOL
  WHALE_THRESHOLD: 10000, // SOL
} as const;

// =============================================================================
// RATE LIMITING
// =============================================================================

export const RATE_LIMIT = {
  WINDOW_MS: 60000, // 1 minute in milliseconds
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
  REQUESTS_PER_DAY: 10000,
  BURST_LIMIT: 10,
} as const;

// =============================================================================
// CACHE DURATIONS (in seconds)
// =============================================================================

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

// =============================================================================
// PAGINATION
// =============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LEADERBOARD_PAGE_SIZE: 50,
} as const;

// =============================================================================
// BADGE POINTS
// =============================================================================

export const BADGE_POINTS = {
  COMMON: 10,
  RARE: 50,
  EPIC: 200,
  LEGENDARY: 1000,
} as const;

// =============================================================================
// REFERRAL REWARDS
// =============================================================================

export const REFERRAL = {
  LEVEL_1_PERCENTAGE: 0.1, // 10%
  LEVEL_2_PERCENTAGE: 0.05, // 5%
  LEVEL_3_PERCENTAGE: 0.025, // 2.5%
  MIN_REWARD_SOL: 0.001,
  MAX_LEVELS: 3,
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI = {
  TOAST_DURATION: 5000, // milliseconds
  ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 500, // milliseconds
  LOADING_MIN_DURATION: 1000, // milliseconds (prevent flash)
} as const;

// =============================================================================
// FILE UPLOAD
// =============================================================================

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGES: 5,
} as const;

// =============================================================================
// VALIDATION
// =============================================================================

export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_BIO_LENGTH: 0,
  MAX_BIO_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
  WALLET_ADDRESS_LENGTH: 44, // Base58 encoded Solana address
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
} as const;

// =============================================================================
// NETWORK
// =============================================================================

export const NETWORK = {
  MAINNET_BETA: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALHOST: 'localhost',
} as const;

export const RPC_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
} as const;

// =============================================================================
// PAYMENT
// =============================================================================

export const PAYMENT = {
  MINT_PRICE_SOL: 0.2,
  PREMIUM_PRICE_SOL: 0.5,
  MIN_TRANSACTION_AMOUNT: 0.001,
  CONFIRMATION_TIMEOUT_MS: 60000, // 1 minute
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  GENERATE_CARD: '/api/generate-card',
  COMPARE_CARDS: '/api/compare-cards',
  LEADERBOARD: '/api/leaderboard',
  PROFILE: '/api/profile',
  REFERRALS: '/api/referrals',
  FOLLOWS: '/api/follows',
} as const;

// =============================================================================
// ENVIRONMENT
// =============================================================================

export const ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  THEME: 'degenscore_theme',
  LANGUAGE: 'degenscore_language',
  WALLET_CONNECTED: 'degenscore_wallet_connected',
  ONBOARDING_COMPLETED: 'degenscore_onboarding_completed',
  LAST_VISIT: 'degenscore_last_visit',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURES = {
  ENABLE_REFERRALS: true,
  ENABLE_CHALLENGES: true,
  ENABLE_PREMIUM: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_I18N: true,
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error. Please try again',
  INVALID_ADDRESS: 'Invalid wallet address',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  CARD_GENERATED: 'Card generated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed!',
  REFERRAL_CLAIMED: 'Referral reward claimed!',
  FOLLOW_SUCCESS: 'Successfully followed user',
  UNFOLLOW_SUCCESS: 'Successfully unfollowed user',
} as const;

// =============================================================================
// TYPE EXPORTS (for strict typing)
// =============================================================================

export type ScoreValue = typeof SCORE[keyof typeof SCORE];
export type NetworkType = typeof NETWORK[keyof typeof NETWORK];
export type EnvironmentType = typeof ENV[keyof typeof ENV];
export type BadgeRarityPoints = typeof BADGE_POINTS[keyof typeof BADGE_POINTS];

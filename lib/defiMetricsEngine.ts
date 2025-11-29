/**
 * 🔥 DeFi-Focused Metrics Engine
 *
 * This engine uses ONLY Solscan DeFi activities instead of all transactions.
 * This ensures we analyze REAL trading activity and ignore spam/transfers.
 *
 * Key improvements:
 * - Uses Solscan Pro API for verified DeFi activities
 * - No need to filter out spam or random transfers
 * - More accurate trade detection
 * - Better categorization (swaps, liquidity, staking, etc.)
 */

import {
  getAllWalletDefiActivities,
  DefiActivity,
  DefiActivityType,
  standardizeDefiActivities,
  StandardizedActivity,
} from './services/solscan';
import { logger } from '@/lib/logger';
import { WalletMetrics, Trade, Position } from './metricsEngine';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Stablecoins and wrapped tokens to exclude from speculative trading
const EXCLUDED_TOKENS = new Set([
  // Stablecoins
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', // PAI
  'EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz', // BAI
  'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3', // FakeUSDC

  // Wrapped tokens
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // WETH
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // WBTC
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // WBTC (v2)
  '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // WETH (Sollet)

  // Liquid staking tokens
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL
  'He3iAEV5rYjv6Xf7PxKro19eVrC3QAcdic5CF2D2obPt', // scnSOL
  'DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9', // daoSOL
]);

/**
 * Extract trades from Solscan DeFi activities
 * Much cleaner than parsing all transactions!
 */
function extractTradesFromDefiActivities(
  activities: StandardizedActivity[],
  walletAddress: string
): Trade[] {
  const trades: Trade[] = [];
  let skippedNoSwapInfo = 0;
  let skippedStablecoin = 0;
  let skippedDust = 0;
  let skippedZeroAmount = 0;
  let skippedSanity = 0;

  logger.info(`📊 Processing ${activities.length} DeFi activities`);

  for (const activity of activities) {
    // Only process swap activities
    if (
      activity.activityType !== DefiActivityType.TOKEN_SWAP &&
      activity.activityType !== DefiActivityType.AGG_TOKEN_SWAP
    ) {
      continue;
    }

    // Must have swap info
    if (!activity.swapInfo) {
      skippedNoSwapInfo++;
      continue;
    }

    const { tokenIn, tokenInDecimals, amountIn, tokenOut, tokenOutDecimals, amountOut } =
      activity.swapInfo;

    // Determine if tokenIn or tokenOut is SOL
    const isSolIn = tokenIn === SOL_MINT;
    const isSolOut = tokenOut === SOL_MINT;

    // We only want SOL <-> Token swaps (not token <-> token)
    if (!isSolIn && !isSolOut) {
      // This is a token-to-token swap, skip for now
      continue;
    }

    // Determine trade type and amounts
    let isBuy: boolean;
    let tokenMint: string;
    let tokenAmount: number;
    let solAmount: number;

    if (isSolIn) {
      // SOL -> Token = BUY
      isBuy = true;
      tokenMint = tokenOut;
      tokenAmount = amountOut / Math.pow(10, tokenOutDecimals);
      solAmount = amountIn / Math.pow(10, tokenInDecimals);
    } else {
      // Token -> SOL = SELL
      isBuy = false;
      tokenMint = tokenIn;
      tokenAmount = amountIn / Math.pow(10, tokenInDecimals);
      solAmount = amountOut / Math.pow(10, tokenOutDecimals);
    }

    // Skip stablecoins and wrapped tokens
    if (EXCLUDED_TOKENS.has(tokenMint)) {
      skippedStablecoin++;
      continue;
    }

    // Skip zero amounts
    if (solAmount === 0 || tokenAmount === 0) {
      skippedZeroAmount++;
      continue;
    }

    // Skip dust trades (less than 0.000001 SOL)
    if (solAmount < 0.000001) {
      skippedDust++;
      continue;
    }

    // Calculate price per token
    const pricePerToken = solAmount / tokenAmount;

    // Sanity checks
    if (pricePerToken < 0.000000001 || pricePerToken > 1000000) {
      skippedSanity++;
      continue;
    }

    if (solAmount > 1000) {
      skippedSanity++;
      continue;
    }

    // ✅ Valid trade!
    trades.push({
      timestamp: activity.timestamp,
      tokenMint,
      type: isBuy ? 'buy' : 'sell',
      solAmount,
      tokenAmount,
      pricePerToken,
    });
  }

  // Log statistics
  logger.info('🔍 DeFi Activity extraction stats:', {
    totalActivities: activities.length,
    tradesExtracted: trades.length,
    extractionRate: `${((trades.length / activities.length) * 100).toFixed(1)}%`,
    skipped: {
      noSwapInfo: skippedNoSwapInfo,
      stablecoin: skippedStablecoin,
      dust: skippedDust,
      zeroAmount: skippedZeroAmount,
      sanity: skippedSanity,
    },
  });

  return trades;
}

/**
 * Build positions from trades
 * (Imported from original metricsEngine - same logic)
 */
function buildPositions(trades: Trade[]): Position[] {
  const positions = new Map<string, Position>();

  for (const trade of trades) {
    const existing = positions.get(trade.tokenMint);

    if (trade.type === 'buy') {
      if (!existing) {
        // New position
        positions.set(trade.tokenMint, {
          tokenMint: trade.tokenMint,
          entryTime: trade.timestamp,
          buyAmount: trade.solAmount,
          tokensBought: trade.tokenAmount,
          entryPrice: trade.pricePerToken,
          isOpen: true,
          isRug: false,
          isMoonshot: false,
        });
      } else if (existing.isOpen) {
        // Adding to existing position (DCA)
        existing.buyAmount += trade.solAmount;
        existing.tokensBought += trade.tokenAmount;
        existing.entryPrice = existing.buyAmount / existing.tokensBought;
      } else {
        // Re-opening closed position
        positions.set(trade.tokenMint, {
          tokenMint: trade.tokenMint,
          entryTime: trade.timestamp,
          buyAmount: trade.solAmount,
          tokensBought: trade.tokenAmount,
          entryPrice: trade.pricePerToken,
          isOpen: true,
          isRug: false,
          isMoonshot: false,
        });
      }
    } else {
      // Sell
      if (existing && existing.isOpen) {
        existing.exitTime = trade.timestamp;
        existing.sellAmount = (existing.sellAmount || 0) + trade.solAmount;
        existing.tokensSold = (existing.tokensSold || 0) + trade.tokenAmount;
        existing.exitPrice = existing.sellAmount / existing.tokensSold;
        existing.profitLoss = existing.sellAmount - existing.buyAmount;
        existing.profitLossPercent = (existing.profitLoss / existing.buyAmount) * 100;
        existing.holdTime = existing.exitTime - existing.entryTime;

        // Check for moonshot (>10x) or rug (<-80%)
        if (existing.profitLossPercent >= 900) {
          existing.isMoonshot = true;
        }
        if (existing.profitLossPercent <= -80) {
          existing.isRug = true;
        }

        // Close position if fully sold
        if (existing.tokensSold >= existing.tokensBought * 0.95) {
          existing.isOpen = false;
        }
      }
    }
  }

  return Array.from(positions.values());
}

/**
 * Calculate metrics from trades and positions
 * (Using same logic as original metricsEngine)
 */
function calculateMetrics(trades: Trade[], positions: Position[]): WalletMetrics {
  // Basic metrics
  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, t) => sum + t.solAmount, 0);
  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;

  // Calculate realized and unrealized PnL
  const closedPositions = positions.filter((p) => !p.isOpen && p.profitLoss !== undefined);
  const openPositions = positions.filter((p) => p.isOpen);

  const realizedPnL = closedPositions.reduce((sum, p) => sum + (p.profitLoss || 0), 0);
  const unrealizedPnL = 0; // Would need current prices

  const profitLoss = realizedPnL + unrealizedPnL;

  // Win rate
  const winningTrades = closedPositions.filter((p) => (p.profitLoss || 0) > 0).length;
  const winRate = closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0;

  // Best and worst trades
  const bestTrade =
    closedPositions.length > 0
      ? Math.max(...closedPositions.map((p) => p.profitLoss || 0))
      : 0;
  const worstTrade =
    closedPositions.length > 0
      ? Math.min(...closedPositions.map((p) => p.profitLoss || 0))
      : 0;

  // Rug detection
  const rugsCaught = closedPositions.filter((p) => p.isRug).length;
  const rugsSurvived = closedPositions.length - rugsCaught;
  const totalRugValue = closedPositions
    .filter((p) => p.isRug)
    .reduce((sum, p) => sum + Math.abs(p.profitLoss || 0), 0);

  // Moonshots
  const moonshots = closedPositions.filter((p) => p.isMoonshot).length;

  // Hold time analysis
  const avgHoldTime =
    closedPositions.length > 0
      ? closedPositions.reduce((sum, p) => sum + (p.holdTime || 0), 0) / closedPositions.length
      : 0;

  const quickFlips = closedPositions.filter((p) => (p.holdTime || 0) < 3600).length; // < 1 hour
  const diamondHands = closedPositions.filter((p) => (p.holdTime || 0) > 86400 * 7).length; // > 7 days

  // Trading days
  const uniqueDays = new Set(trades.map((t) => Math.floor(t.timestamp / 86400)));
  const tradingDays = uniqueDays.size;

  // First trade date
  const firstTradeDate = trades.length > 0 ? Math.min(...trades.map((t) => t.timestamp)) : 0;

  // Streaks
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  const sortedClosedPositions = [...closedPositions].sort((a, b) => a.exitTime! - b.exitTime!);
  for (const pos of sortedClosedPositions) {
    if ((pos.profitLoss || 0) > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  }

  // Volatility score (based on PnL variance)
  const pnlValues = closedPositions.map((p) => p.profitLossPercent || 0);
  const avgPnL = pnlValues.length > 0 ? pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length : 0;
  const variance =
    pnlValues.length > 0
      ? pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnL, 2), 0) / pnlValues.length
      : 0;
  const volatilityScore = Math.min(Math.sqrt(variance), 100);

  // Favorite tokens
  const tokenCounts = new Map<string, number>();
  for (const trade of trades) {
    tokenCounts.set(trade.tokenMint, (tokenCounts.get(trade.tokenMint) || 0) + 1);
  }
  const favoriteTokens = Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mint, count]) => ({
      mint,
      symbol: 'UNKNOWN', // Would need to fetch from metadata
      count,
    }));

  // Calculate DegenScore (0-100)
  let degenScore = 50; // Start at 50

  // Win rate contribution (max +20)
  degenScore += (winRate / 100) * 20;

  // Volume contribution (max +15)
  const volumeScore = Math.min(totalVolume / 100, 1) * 15;
  degenScore += volumeScore;

  // Moonshots bonus (+5 per moonshot, max +15)
  degenScore += Math.min(moonshots * 5, 15);

  // Rug penalty (-3 per rug, max -15)
  degenScore -= Math.min(rugsCaught * 3, 15);

  // Trading consistency (+10 if trading regularly)
  if (tradingDays > 30) {
    degenScore += 10;
  } else if (tradingDays > 7) {
    degenScore += 5;
  }

  // Profitability bonus/penalty (max ±10)
  const profitability = realizedPnL / (totalVolume || 1);
  degenScore += Math.max(Math.min(profitability * 100, 10), -10);

  // Clamp to 0-100
  degenScore = Math.max(0, Math.min(100, degenScore));

  return {
    degenScore,
    totalTrades,
    totalVolume,
    profitLoss,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize,
    totalFees: 0, // Would need to calculate from activities
    tradingDays,
    rugsSurvived,
    rugsCaught,
    totalRugValue,
    moonshots,
    avgHoldTime,
    quickFlips,
    diamondHands,
    realizedPnL,
    unrealizedPnL,
    firstTradeDate,
    longestWinStreak,
    longestLossStreak,
    volatilityScore,
    favoriteTokens,
  };
}

/**
 * Default metrics for wallets with no activity
 */
function getDefaultMetrics(): WalletMetrics {
  return {
    degenScore: 0,
    totalTrades: 0,
    totalVolume: 0,
    profitLoss: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: 0,
    totalFees: 0,
    tradingDays: 0,
    rugsSurvived: 0,
    rugsCaught: 0,
    totalRugValue: 0,
    moonshots: 0,
    avgHoldTime: 0,
    quickFlips: 0,
    diamondHands: 0,
    realizedPnL: 0,
    unrealizedPnL: 0,
    firstTradeDate: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    volatilityScore: 0,
    favoriteTokens: [],
  };
}

/**
 * 🔥 MAIN FUNCTION: Calculate metrics using Solscan DeFi activities
 *
 * This is the new approach - using ONLY verified DeFi activities
 * instead of parsing all transactions.
 */
export async function calculateDefiMetrics(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<WalletMetrics> {
  try {
    logger.info('🔥 DeFi Metrics Engine v3.0 - Using Solscan DeFi Activities');

    if (onProgress) {
      onProgress(5, '📡 Fetching DeFi activities from Solscan...');
    }

    // Fetch DeFi activities from Solscan (max 1000)
    const defiActivities = await getAllWalletDefiActivities(walletAddress, 1000);

    if (!defiActivities || defiActivities.length === 0) {
      logger.warn('❌ No DeFi activities found for wallet:', { walletAddress });
      logger.warn('⚠️ Returning default metrics (all zeros)');
      return getDefaultMetrics();
    }

    logger.info(`📊 Total DeFi activities fetched: ${defiActivities.length}`);

    if (onProgress) {
      onProgress(50, '🔄 Standardizing activities...');
    }

    // Standardize activities
    const standardizedActivities = standardizeDefiActivities(defiActivities);

    if (onProgress) {
      onProgress(60, '💱 Extracting trades...');
    }

    // Extract trades from activities
    const trades = extractTradesFromDefiActivities(standardizedActivities, walletAddress);
    logger.info(`✅ Extracted ${trades.length} valid trades from ${defiActivities.length} activities`);

    if (trades.length === 0) {
      logger.warn('⚠️ No valid trades found in DeFi activities');
      logger.warn('⚠️ Returning default metrics (all zeros)');
      return getDefaultMetrics();
    }

    if (onProgress) {
      onProgress(75, '📈 Building positions...');
    }

    // Build positions from trades
    const positions = buildPositions(trades);
    logger.info(`📦 Built ${positions.length} positions`);

    if (onProgress) {
      onProgress(90, '🎯 Calculating metrics...');
    }

    // Calculate all metrics
    const metrics = calculateMetrics(trades, positions);

    if (onProgress) {
      onProgress(100, '✅ Analysis complete!');
    }

    return metrics;
  } catch (error) {
    logger.error('❌ Error in DeFi metrics engine', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    return getDefaultMetrics();
  }
}

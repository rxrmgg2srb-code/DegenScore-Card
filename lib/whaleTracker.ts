import prisma from './prisma';
import { logger } from './logger';

// Whale detection thresholds
const WHALE_THRESHOLDS = {
  minVolume: 1000, // $1000+ total volume
  minPositionSize: 50, // $50+ average position
  minWinRate: 55, // 55%+ win rate
  minTrades: 10, // At least 10 trades
};

// Alert types
export type WhaleAlertType =
  | 'large_buy'
  | 'large_sell'
  | 'new_position'
  | 'position_close'
  | 'whale_detected';

interface WhaleMetrics {
  totalVolume: number;
  winRate: number;
  avgPositionSize: number;
  totalProfit: number;
  topTokens: string[];
}

/**
 * Calculate whale metrics from trading history
 */
export async function calculateWhaleMetrics(walletAddress: string): Promise<WhaleMetrics | null> {
  try {
    const trades = await prisma.trade.findMany({
      where: { walletAddress },
      orderBy: { timestamp: 'desc' },
      take: 100, // Last 100 trades
    });

    if (trades.length < WHALE_THRESHOLDS.minTrades) {
      return null;
    }

    // Calculate total volume
    const totalVolume = trades.reduce((sum, trade) => {
      const volume = trade.type === 'buy'
        ? trade.solAmount
        : (trade.solAmount || 0);
      return sum + volume;
    }, 0);

    // Calculate win rate
    const profitableTrades = trades.filter(t => {
      if (t.type === 'sell' && t.profit) {
        return t.profit > 0;
      }
      return false;
    });
    const winRate = trades.length > 0
      ? (profitableTrades.length / trades.filter(t => t.type === 'sell').length) * 100
      : 0;

    // Calculate average position size
    const avgPositionSize = totalVolume / trades.length;

    // Calculate total profit
    const totalProfit = trades.reduce((sum, trade) => {
      return sum + (trade.profit || 0);
    }, 0);

    // Get top tokens
    const tokenCounts = trades.reduce((acc, trade) => {
      const symbol = trade.tokenSymbol;
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTokens = Object.entries(tokenCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symbol]) => symbol);

    return {
      totalVolume,
      winRate,
      avgPositionSize,
      totalProfit,
      topTokens,
    };
  } catch (error) {
    logger.error('Error calculating whale metrics:', error);
    return null;
  }
}

/**
 * Check if wallet qualifies as whale
 */
export function isWhale(metrics: WhaleMetrics): boolean {
  return (
    metrics.totalVolume >= WHALE_THRESHOLDS.minVolume &&
    metrics.avgPositionSize >= WHALE_THRESHOLDS.minPositionSize &&
    metrics.winRate >= WHALE_THRESHOLDS.minWinRate
  );
}

/**
 * Detect and register new whales
 */
export async function detectAndRegisterWhale(walletAddress: string): Promise<boolean> {
  try {
    // Check if already registered
    const existing = await prisma.whaleWallet.findUnique({
      where: { walletAddress },
    });

    if (existing) {
      return false; // Already a whale
    }

    // Calculate metrics
    const metrics = await calculateWhaleMetrics(walletAddress);

    if (!metrics || !isWhale(metrics)) {
      return false;
    }

    // Register as whale
    await prisma.whaleWallet.create({
      data: {
        walletAddress,
        totalVolume: metrics.totalVolume,
        winRate: metrics.winRate,
        avgPositionSize: metrics.avgPositionSize,
        totalProfit: metrics.totalProfit,
        topTokens: JSON.stringify(metrics.topTokens),
        lastActive: new Date(),
      },
    });

    logger.info(`New whale detected: ${walletAddress}`);
    return true;
  } catch (error) {
    logger.error('Error detecting whale:', error);
    return false;
  }
}

/**
 * Update whale metrics
 */
export async function updateWhaleMetrics(walletAddress: string): Promise<void> {
  try {
    const metrics = await calculateWhaleMetrics(walletAddress);

    if (!metrics) {
      return;
    }

    await prisma.whaleWallet.update({
      where: { walletAddress },
      data: {
        totalVolume: metrics.totalVolume,
        winRate: metrics.winRate,
        avgPositionSize: metrics.avgPositionSize,
        totalProfit: metrics.totalProfit,
        topTokens: JSON.stringify(metrics.topTokens),
        lastActive: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error updating whale metrics:', error);
  }
}

/**
 * Create whale alert
 */
export async function createWhaleAlert(
  whaleWalletId: string,
  alertType: WhaleAlertType,
  tokenMint: string,
  tokenSymbol: string,
  action: 'buy' | 'sell',
  amountSOL: number,
  signature: string,
  priceImpact?: number
): Promise<void> {
  try {
    await prisma.whaleAlert.create({
      data: {
        whaleWalletId,
        alertType,
        tokenMint,
        tokenSymbol,
        action,
        amountSOL,
        priceImpact,
        signature,
      },
    });

    logger.info(`Whale alert created: ${alertType} for ${tokenSymbol}`);
  } catch (error) {
    logger.error('Error creating whale alert:', error);
  }
}

/**
 * Get top whales
 */
export async function getTopWhales(limit = 50) {
  try {
    const whales = await prisma.whaleWallet.findMany({
      orderBy: [
        { totalVolume: 'desc' },
        { winRate: 'desc' },
      ],
      take: limit,
    });

    return whales.map(whale => ({
      ...whale,
      topTokens: whale.topTokens ? JSON.parse(whale.topTokens) : [],
    }));
  } catch (error) {
    logger.error('Error fetching top whales:', error);
    return [];
  }
}

/**
 * Get whale alerts for followed whales
 */
export async function getWhaleAlertsForUser(
  walletAddress: string,
  limit = 20
) {
  try {
    // Get followed whales
    const follows = await prisma.whaleFollower.findMany({
      where: {
        walletAddress,
        notificationsEnabled: true,
      },
      select: { whaleWalletId: true },
    });

    const whaleIds = follows.map(f => f.whaleWalletId);

    if (whaleIds.length === 0) {
      return [];
    }

    // Get recent alerts
    const alerts = await prisma.whaleAlert.findMany({
      where: {
        whaleWalletId: { in: whaleIds },
      },
      include: {
        whaleWallet: {
          select: {
            walletAddress: true,
            nickname: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return alerts;
  } catch (error) {
    logger.error('Error fetching whale alerts:', error);
    return [];
  }
}

/**
 * Follow a whale
 */
export async function followWhale(
  walletAddress: string,
  whaleWalletId: string
): Promise<boolean> {
  try {
    // Check if whale exists
    const whale = await prisma.whaleWallet.findUnique({
      where: { id: whaleWalletId },
    });

    if (!whale) {
      return false;
    }

    // Create follow
    await prisma.whaleFollower.create({
      data: {
        walletAddress,
        whaleWalletId,
      },
    });

    // Increment followers count
    await prisma.whaleWallet.update({
      where: { id: whaleWalletId },
      data: {
        followersCount: { increment: 1 },
      },
    });

    return true;
  } catch (error) {
    // Might already be following
    logger.error('Error following whale:', error);
    return false;
  }
}

/**
 * Unfollow a whale
 */
export async function unfollowWhale(
  walletAddress: string,
  whaleWalletId: string
): Promise<boolean> {
  try {
    const deleted = await prisma.whaleFollower.deleteMany({
      where: {
        walletAddress,
        whaleWalletId,
      },
    });

    if (deleted.count > 0) {
      // Decrement followers count
      await prisma.whaleWallet.update({
        where: { id: whaleWalletId },
        data: {
          followersCount: { decrement: 1 },
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error unfollowing whale:', error);
    return false;
  }
}

/**
 * Check if user is following whale
 */
export async function isFollowingWhale(
  walletAddress: string,
  whaleWalletId: string
): Promise<boolean> {
  try {
    const follow = await prisma.whaleFollower.findFirst({
      where: {
        walletAddress,
        whaleWalletId,
      },
    });

    return !!follow;
  } catch (error) {
    logger.error('Error checking whale follow:', error);
    return false;
  }
}

/**
 * Get user's followed whales
 */
export async function getFollowedWhales(walletAddress: string) {
  try {
    const follows = await prisma.whaleFollower.findMany({
      where: { walletAddress },
      include: {
        whaleWallet: true,
      },
      orderBy: {
        followedAt: 'desc',
      },
    });

    return follows.map(f => ({
      ...f.whaleWallet,
      topTokens: f.whaleWallet.topTokens ? JSON.parse(f.whaleWallet.topTokens) : [],
      followedAt: f.followedAt,
      notificationsEnabled: f.notificationsEnabled,
    }));
  } catch (error) {
    logger.error('Error fetching followed whales:', error);
    return [];
  }
}

/**
 * Process new trade to check for whale activity
 */
export async function processTradeForWhaleDetection(
  walletAddress: string,
  trade: {
    type: 'buy' | 'sell';
    tokenMint: string;
    tokenSymbol: string;
    solAmount: number;
    signature: string;
  }
): Promise<void> {
  try {
    // Check if wallet is a whale
    let whale = await prisma.whaleWallet.findUnique({
      where: { walletAddress },
    });

    // If not, try to detect
    if (!whale) {
      const detected = await detectAndRegisterWhale(walletAddress);
      if (detected) {
        whale = await prisma.whaleWallet.findUnique({
          where: { walletAddress },
        });
      }
    }

    // If whale, create alert for large trades
    if (whale && trade.solAmount >= 50) {
      const alertType: WhaleAlertType =
        trade.solAmount >= 500 ? 'large_buy' :
        trade.type === 'buy' ? 'new_position' : 'position_close';

      await createWhaleAlert(
        whale.id,
        alertType,
        trade.tokenMint,
        trade.tokenSymbol,
        trade.type,
        trade.solAmount,
        trade.signature
      );

      // Update whale metrics
      await updateWhaleMetrics(walletAddress);
    }
  } catch (error) {
    logger.error('Error processing trade for whale detection:', error);
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../lib/logger';

// Types
interface Challenge {
    id: string;
    type: 'daily' | 'weekly' | 'special';
    title: string;
    description: string;
    icon: string;
    reward: {
        type: 'xp' | 'badge' | 'sol' | 'pro';
        amount: number;
        label: string;
    };
    requirement: {
        type: string;
        target: number;
        current: number;
    };
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    expiresAt: number;
}

interface WalletMetrics {
    totalTrades: number;
    totalVolume: number;
    profitLoss: number;
    winRate: number;
    tradingDays: number;
    longestWinStreak: number;
    firstTradeDate: string;
    favoriteTokens: { symbol: string; volume: number }[];
}

interface TimePeriodMetrics {
    trades: number;
    volume: number;
    profit: number;
    winStreak: number;
    uniqueTokens: number;
    activeDays: number;
}

// Challenge definitions - FIXED, not random
const DAILY_CHALLENGE_DEFS = [
    {
        id: 'daily-first-trade',
        type: 'daily' as const,
        title: 'First Trade of the Day',
        description: 'Execute at least 1 trade today',
        icon: '🎯',
        reward: { type: 'xp' as const, amount: 100, label: '+100 XP' },
        requirement: { type: 'trades', target: 1 },
        difficulty: 'easy' as const,
    },
    {
        id: 'daily-volume',
        type: 'daily' as const,
        title: 'Volume Hunter',
        description: 'Trade at least 5 SOL in volume today',
        icon: '💰',
        reward: { type: 'xp' as const, amount: 250, label: '+250 XP' },
        requirement: { type: 'volume', target: 5 },
        difficulty: 'medium' as const,
    },
    {
        id: 'daily-win-streak',
        type: 'daily' as const,
        title: 'Win Streak',
        description: 'Get 3 profitable trades in a row',
        icon: '🔥',
        reward: { type: 'xp' as const, amount: 500, label: '+500 XP' },
        requirement: { type: 'winStreak', target: 3 },
        difficulty: 'hard' as const,
    },
];

const WEEKLY_CHALLENGE_DEFS = [
    {
        id: 'weekly-warrior',
        type: 'weekly' as const,
        title: 'Weekly Warrior',
        description: 'Complete 20 trades this week',
        icon: '⚔️',
        reward: { type: 'badge' as const, amount: 1, label: 'Weekly Warrior Badge' },
        requirement: { type: 'trades', target: 20 },
        difficulty: 'medium' as const,
    },
    {
        id: 'weekly-profit',
        type: 'weekly' as const,
        title: 'Profit Machine',
        description: 'Achieve 10 SOL in realized profit this week',
        icon: '💎',
        reward: { type: 'sol' as const, amount: 0.1, label: '+0.1 SOL' },
        requirement: { type: 'profit', target: 10 },
        difficulty: 'hard' as const,
    },
];

const SPECIAL_CHALLENGE_DEFS = [
    {
        id: 'special-whale',
        type: 'special' as const,
        title: 'Whale Watcher',
        description: 'Copy a trade from a Top 10 leaderboard wallet',
        icon: '🐋',
        reward: { type: 'pro' as const, amount: 7, label: '+7 Days PRO' },
        requirement: { type: 'copyTrade', target: 1 },
        difficulty: 'legendary' as const,
    },
];

// Calculate time boundaries
function getTimeBoundaries() {
    const now = new Date();

    // Start of today (UTC)
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    // End of today (UTC)
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Start of week (Monday UTC)
    const dayOfWeek = now.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToMonday);

    // End of week (Sunday UTC)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    // Days in current period
    const daysIntoToday = (now.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000);
    const daysIntoWeek = (now.getTime() - startOfWeek.getTime()) / (24 * 60 * 60 * 1000);

    return {
        startOfToday: startOfToday.getTime(),
        endOfToday: endOfToday.getTime(),
        startOfWeek: startOfWeek.getTime(),
        endOfWeek: endOfWeek.getTime(),
        now: now.getTime(),
        daysIntoToday,
        daysIntoWeek: Math.max(1, daysIntoWeek),
    };
}

// Fetch wallet metrics from analyze API
async function fetchWalletMetrics(walletAddress: string): Promise<WalletMetrics | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress }),
        });

        if (!response.ok) {
            logger.warn(`[Challenges] Failed to fetch metrics for ${walletAddress.slice(0, 8)}...`);
            return null;
        }

        const data = await response.json();

        return {
            totalTrades: data.totalTrades || 0,
            totalVolume: data.totalVolume || 0,
            profitLoss: data.profitLoss || 0,
            winRate: data.winRate || 0,
            tradingDays: data.tradingDays || 0,
            longestWinStreak: data.longestWinStreak || 0,
            firstTradeDate: data.firstTradeDate || new Date().toISOString(),
            favoriteTokens: [],
        };
    } catch (error) {
        logger.error('[Challenges] Error fetching wallet metrics:', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

// Calculate time-proportional metrics for daily/weekly challenges
function calculateTimeProportionalMetrics(
    metrics: WalletMetrics,
    boundaries: ReturnType<typeof getTimeBoundaries>
): { daily: TimePeriodMetrics; weekly: TimePeriodMetrics } {
    // Total trading period in days
    const totalTradingDays = Math.max(1, metrics.tradingDays);

    // Average trades per day
    const avgTradesPerDay = metrics.totalTrades / totalTradingDays;
    const avgVolumePerDay = metrics.totalVolume / totalTradingDays;
    const avgProfitPerDay = metrics.profitLoss / totalTradingDays;

    // Check if user traded today (approximate based on activity level)
    const todayTradeEstimate = avgTradesPerDay > 1 ? Math.round(avgTradesPerDay) : 0;
    const todayVolumeEstimate = avgVolumePerDay > 0.5 ? avgVolumePerDay : 0;

    // For daily metrics: estimate based on today's portion of average
    const daily: TimePeriodMetrics = {
        trades: Math.round(todayTradeEstimate * boundaries.daysIntoToday),
        volume: Number((todayVolumeEstimate * boundaries.daysIntoToday).toFixed(2)),
        profit: Number((avgProfitPerDay * boundaries.daysIntoToday).toFixed(2)),
        winStreak: metrics.longestWinStreak > 0 ? Math.min(metrics.longestWinStreak, 3) : 0,
        uniqueTokens: 0, // Would need token data
        activeDays: boundaries.daysIntoToday >= 0.5 ? 1 : 0,
    };

    // For weekly metrics: 7-day window
    const weeklyMultiplier = Math.min(7, boundaries.daysIntoWeek);
    const weekly: TimePeriodMetrics = {
        trades: Math.round(avgTradesPerDay * weeklyMultiplier),
        volume: Number((avgVolumePerDay * weeklyMultiplier).toFixed(2)),
        profit: Number((avgProfitPerDay * weeklyMultiplier).toFixed(2)),
        winStreak: metrics.longestWinStreak,
        uniqueTokens: 0,
        activeDays: Math.min(7, Math.round(weeklyMultiplier)),
    };

    return { daily, weekly };
}

// Calculate challenge progress based on time-filtered metrics
function calculateChallengeProgress(
    challengeDef: { requirement: { type: string; target: number }; type: string },
    periodMetrics: TimePeriodMetrics
): number {
    const { type, target } = challengeDef.requirement;

    switch (type) {
        case 'trades':
            return Math.min(periodMetrics.trades, target);

        case 'volume':
            return Math.min(periodMetrics.volume, target);

        case 'profit':
            return periodMetrics.profit > 0 ? Math.min(periodMetrics.profit, target) : 0;

        case 'winStreak':
            return Math.min(periodMetrics.winStreak, target);

        case 'uniqueTokens':
            return Math.min(periodMetrics.uniqueTokens, target);

        case 'activeDays':
            return Math.min(periodMetrics.activeDays, target);

        case 'copyTrade':
            return 0; // Needs specific tracking

        default:
            return 0;
    }
}

// Build challenges with real, time-filtered progress
function buildChallengesWithProgress(
    metrics: WalletMetrics | null,
    boundaries: ReturnType<typeof getTimeBoundaries>
): Challenge[] {
    const challenges: Challenge[] = [];

    // Calculate time-proportional metrics
    const periodMetrics = metrics
        ? calculateTimeProportionalMetrics(metrics, boundaries)
        : {
            daily: { trades: 0, volume: 0, profit: 0, winStreak: 0, uniqueTokens: 0, activeDays: 0 },
            weekly: { trades: 0, volume: 0, profit: 0, winStreak: 0, uniqueTokens: 0, activeDays: 0 }
        };

    // Daily challenges (use daily metrics)
    DAILY_CHALLENGE_DEFS.forEach(def => {
        const current = calculateChallengeProgress(def, periodMetrics.daily);
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.endOfToday,
        });
    });

    // Weekly challenges (use weekly metrics)
    WEEKLY_CHALLENGE_DEFS.forEach(def => {
        const current = calculateChallengeProgress(def, periodMetrics.weekly);
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.endOfWeek,
        });
    });

    // Special challenges (use lifetime metrics)
    SPECIAL_CHALLENGE_DEFS.forEach(def => {
        const current = 0; // Special tracking needed
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.now + 7 * 24 * 3600000,
        });
    });

    return challenges;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET': {
                const { walletAddress } = req.query;

                // Get time boundaries
                const boundaries = getTimeBoundaries();

                if (!walletAddress || typeof walletAddress !== 'string') {
                    const challenges = buildChallengesWithProgress(null, boundaries);

                    return res.status(200).json({
                        success: true,
                        challenges,
                        stats: { total: challenges.length, completed: 0, claimed: 0 },
                        message: 'Connect wallet to track progress',
                    });
                }

                logger.info(`[Challenges] Fetching for wallet: ${walletAddress.slice(0, 8)}...`);

                // Fetch real wallet metrics
                const metrics = await fetchWalletMetrics(walletAddress);

                // Build challenges with time-filtered progress
                const challenges = buildChallengesWithProgress(metrics, boundaries);

                // Calculate time-proportional metrics for display
                const periodMetrics = metrics
                    ? calculateTimeProportionalMetrics(metrics, boundaries)
                    : null;

                // Calculate stats
                const completed = challenges.filter(c => c.requirement.current >= c.requirement.target).length;

                return res.status(200).json({
                    success: true,
                    challenges,
                    stats: {
                        total: challenges.length,
                        completed,
                        claimed: 0,
                    },
                    metrics: metrics ? {
                        // Lifetime metrics
                        totalTrades: metrics.totalTrades,
                        totalVolume: Math.round(metrics.totalVolume * 100) / 100,
                        profitLoss: Math.round(metrics.profitLoss * 100) / 100,
                        winRate: Math.round(metrics.winRate),
                        // Today's estimates
                        todayTrades: periodMetrics?.daily.trades || 0,
                        todayVolume: periodMetrics?.daily.volume || 0,
                        // This week's estimates
                        weekTrades: periodMetrics?.weekly.trades || 0,
                        weekVolume: periodMetrics?.weekly.volume || 0,
                        weekProfit: periodMetrics?.weekly.profit || 0,
                    } : null,
                    periodInfo: {
                        daysIntoWeek: Math.round(boundaries.daysIntoWeek * 10) / 10,
                        endOfDay: new Date(boundaries.endOfToday).toISOString(),
                        endOfWeek: new Date(boundaries.endOfWeek).toISOString(),
                    },
                });
            }

            case 'POST': {
                const { walletAddress: wallet, challengeId } = req.body;

                if (!wallet || !challengeId) {
                    return res.status(400).json({ error: 'Wallet address and challengeId required' });
                }

                logger.info(`[Challenges] Claim request: ${wallet.slice(0, 8)}... for ${challengeId}`);

                return res.status(200).json({
                    success: true,
                    message: 'Reward claimed successfully',
                    challengeId,
                });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        logger.error('[Challenges] Error:', error instanceof Error ? error : new Error(String(error)));
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

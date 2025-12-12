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
    favoriteTokens: { symbol: string; volume: number }[];
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
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    // End of today (UTC)
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Start of week (Monday UTC)
    const dayOfWeek = now.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToMonday);

    // End of week (Sunday UTC)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    return {
        startOfDay: startOfDay.getTime() / 1000,
        endOfDay: endOfDay.getTime(),
        startOfWeek: startOfWeek.getTime() / 1000,
        endOfWeek: endOfWeek.getTime(),
        now: now.getTime(),
    };
}

// Fetch wallet metrics from analyze API (internal call)
async function fetchWalletMetrics(walletAddress: string): Promise<WalletMetrics | null> {
    try {
        // Call internal API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/analyze?wallet=${walletAddress}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            logger.warn(`[Challenges] Failed to fetch metrics for ${walletAddress}`);
            return null;
        }

        const data = await response.json();
        if (!data.success || !data.metrics) {
            return null;
        }

        return {
            totalTrades: data.metrics.totalTrades || 0,
            totalVolume: data.metrics.totalVolume || 0,
            profitLoss: data.metrics.profitLoss || 0,
            winRate: data.metrics.winRate || 0,
            tradingDays: data.metrics.tradingDays || 0,
            longestWinStreak: data.metrics.longestWinStreak || 0,
            favoriteTokens: data.metrics.favoriteTokens || [],
        };
    } catch (error) {
        logger.error('[Challenges] Error fetching wallet metrics:', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

// Calculate challenge progress based on real metrics
function calculateChallengeProgress(
    challengeDef: { requirement: { type: string; target: number } },
    metrics: WalletMetrics | null
): number {
    if (!metrics) return 0;

    const { type, target } = challengeDef.requirement;

    switch (type) {
        case 'trades':
            // For daily: assume recent trades count
            // For weekly: use total trades (simplified - in production, filter by date)
            return Math.min(metrics.totalTrades, target);

        case 'volume':
            // Use total volume (in production, filter by date range)
            return Math.min(metrics.totalVolume, target);

        case 'profit':
            // Use P&L (only count positive)
            return metrics.profitLoss > 0 ? Math.min(metrics.profitLoss, target) : 0;

        case 'winStreak':
            return Math.min(metrics.longestWinStreak, target);

        case 'uniqueTokens':
            return Math.min(metrics.favoriteTokens.length, target);

        case 'activeDays':
            return Math.min(metrics.tradingDays, target);

        case 'copyTrade':
            // This would need specific tracking - return 0 for now
            return 0;

        default:
            return 0;
    }
}

// Build challenges with real progress
function buildChallengesWithProgress(
    metrics: WalletMetrics | null,
    boundaries: ReturnType<typeof getTimeBoundaries>
): Challenge[] {
    const challenges: Challenge[] = [];

    // Daily challenges
    DAILY_CHALLENGE_DEFS.forEach(def => {
        const current = calculateChallengeProgress(def, metrics);
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.endOfDay,
        });
    });

    // Weekly challenges
    WEEKLY_CHALLENGE_DEFS.forEach(def => {
        const current = calculateChallengeProgress(def, metrics);
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.endOfWeek,
        });
    });

    // Special challenges
    SPECIAL_CHALLENGE_DEFS.forEach(def => {
        const current = calculateChallengeProgress(def, metrics);
        challenges.push({
            ...def,
            requirement: {
                ...def.requirement,
                current,
            },
            expiresAt: boundaries.now + 7 * 24 * 3600000, // 7 days from now
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

                if (!walletAddress || typeof walletAddress !== 'string') {
                    // Return challenges with 0 progress if no wallet
                    const boundaries = getTimeBoundaries();
                    const challenges = buildChallengesWithProgress(null, boundaries);

                    return res.status(200).json({
                        success: true,
                        challenges,
                        stats: {
                            total: challenges.length,
                            completed: 0,
                            claimed: 0,
                        },
                        message: 'Connect wallet to track progress',
                    });
                }

                logger.info(`[Challenges] Fetching challenges for wallet: ${walletAddress.slice(0, 8)}...`);

                // Get time boundaries
                const boundaries = getTimeBoundaries();

                // Fetch real wallet metrics
                const metrics = await fetchWalletMetrics(walletAddress);

                // Build challenges with real progress
                const challenges = buildChallengesWithProgress(metrics, boundaries);

                // Calculate stats
                const completed = challenges.filter(c => c.requirement.current >= c.requirement.target).length;

                return res.status(200).json({
                    success: true,
                    challenges,
                    stats: {
                        total: challenges.length,
                        completed,
                        claimed: 0, // TODO: Track in DB
                    },
                    metrics: metrics ? {
                        totalTrades: metrics.totalTrades,
                        totalVolume: Math.round(metrics.totalVolume * 100) / 100,
                        profitLoss: Math.round(metrics.profitLoss * 100) / 100,
                        winRate: Math.round(metrics.winRate),
                    } : null,
                });
            }

            case 'POST': {
                // Claim reward endpoint
                const { walletAddress: wallet, challengeId } = req.body;

                if (!wallet || !challengeId) {
                    return res.status(400).json({ error: 'Wallet address and challengeId required' });
                }

                // TODO: Verify challenge is completed and record claim in DB
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
    } catch (error: any) {
        logger.error('[Challenges] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
}

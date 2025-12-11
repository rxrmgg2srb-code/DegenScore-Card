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
    };
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    startsAt: number;
    expiresAt: number;
    active: boolean;
}

interface UserProgress {
    walletAddress: string;
    challengeId: string;
    progress: number;
    completed: boolean;
    completedAt?: number;
    claimed: boolean;
    claimedAt?: number;
}

// Challenge templates
const DAILY_CHALLENGES: Omit<Challenge, 'id' | 'startsAt' | 'expiresAt' | 'active'>[] = [
    {
        type: 'daily' as const,
        title: 'First Trade',
        description: 'Execute at least 1 trade today',
        icon: '🎯',
        reward: { type: 'xp' as const, amount: 100, label: '+100 XP' },
        requirement: { type: 'trades', target: 1 },
        difficulty: 'easy' as const,
    },
    {
        type: 'daily' as const,
        title: 'Volume Hunter',
        description: 'Trade at least 5 SOL in volume',
        icon: '💰',
        reward: { type: 'xp' as const, amount: 250, label: '+250 XP' },
        requirement: { type: 'volume', target: 5 },
        difficulty: 'medium' as const,
    },
    {
        type: 'daily' as const,
        title: 'Win Streak',
        description: 'Get 3 profitable trades in a row',
        icon: '🔥',
        reward: { type: 'xp' as const, amount: 500, label: '+500 XP' },
        requirement: { type: 'winStreak', target: 3 },
        difficulty: 'hard' as const,
    },
    {
        type: 'daily' as const,
        title: 'Diversify',
        description: 'Trade 3 different tokens',
        icon: '🌈',
        reward: { type: 'xp' as const, amount: 200, label: '+200 XP' },
        requirement: { type: 'uniqueTokens', target: 3 },
        difficulty: 'medium' as const,
    },
    {
        type: 'daily' as const,
        title: 'Early Bird',
        description: 'Make a trade before 9 AM UTC',
        icon: '🌅',
        reward: { type: 'xp' as const, amount: 150, label: '+150 XP' },
        requirement: { type: 'earlyTrade', target: 1 },
        difficulty: 'easy' as const,
    },
];

const WEEKLY_CHALLENGES: Omit<Challenge, 'id' | 'startsAt' | 'expiresAt' | 'active'>[] = [
    {
        type: 'weekly' as const,
        title: 'Weekly Warrior',
        description: 'Complete 20 trades this week',
        icon: '⚔️',
        reward: { type: 'badge' as const, amount: 1, label: 'Weekly Warrior Badge' },
        requirement: { type: 'trades', target: 20 },
        difficulty: 'medium' as const,
    },
    {
        type: 'weekly' as const,
        title: 'Profit Machine',
        description: 'Achieve 10 SOL in realized profit',
        icon: '💎',
        reward: { type: 'sol' as const, amount: 0.1, label: '+0.1 SOL' },
        requirement: { type: 'profit', target: 10 },
        difficulty: 'hard' as const,
    },
    {
        type: 'weekly' as const,
        title: 'Consistent Trader',
        description: 'Trade every day for 7 days',
        icon: '📅',
        reward: { type: 'xp' as const, amount: 1000, label: '+1000 XP' },
        requirement: { type: 'activeDays', target: 7 },
        difficulty: 'hard' as const,
    },
    {
        type: 'weekly' as const,
        title: 'Social Butterfly',
        description: 'Get 5 referral sign-ups',
        icon: '🦋',
        reward: { type: 'pro' as const, amount: 7, label: '+7 Days PRO' },
        requirement: { type: 'referrals', target: 5 },
        difficulty: 'legendary' as const,
    },
];

const SPECIAL_CHALLENGES: Omit<Challenge, 'id' | 'startsAt' | 'expiresAt' | 'active'>[] = [
    {
        type: 'special' as const,
        title: 'Whale Watcher',
        description: 'Copy a trade from a Top 10 wallet',
        icon: '🐋',
        reward: { type: 'pro' as const, amount: 7, label: '+7 Days PRO' },
        requirement: { type: 'copyTrade', target: 1 },
        difficulty: 'legendary' as const,
    },
    {
        type: 'special' as const,
        title: 'Diamond Hands',
        description: 'Hold a position for 30+ days with profit',
        icon: '💎',
        reward: { type: 'badge' as const, amount: 1, label: 'Diamond Hands Badge' },
        requirement: { type: 'holdDays', target: 30 },
        difficulty: 'legendary' as const,
    },
];

// In-memory storage (use DB in production)
const userProgress = new Map<string, UserProgress[]>();

// Helper to generate active challenges
function generateActiveChallenges(): Challenge[] {
    const now = Date.now();
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const endOfWeek = new Date();
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + (7 - endOfWeek.getUTCDay()));
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const challenges: Challenge[] = [];

    // Add 3 random daily challenges
    const shuffledDaily = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
    shuffledDaily.slice(0, 3).forEach((c, i) => {
        const challenge: Challenge = {
            ...c,
            id: `daily-${i + 1}-${new Date().toISOString().split('T')[0]}`,
            startsAt: now,
            expiresAt: endOfDay.getTime(),
            active: true,
        } as Challenge;
        challenges.push(challenge);
    });

    // Add 2 weekly challenges
    const shuffledWeekly = [...WEEKLY_CHALLENGES].sort(() => Math.random() - 0.5);
    shuffledWeekly.slice(0, 2).forEach((c, i) => {
        const challenge: Challenge = {
            ...c,
            id: `weekly-${i + 1}-week${Math.floor(Date.now() / 604800000)}`,
            startsAt: now,
            expiresAt: endOfWeek.getTime(),
            active: true,
        } as Challenge;
        challenges.push(challenge);
    });

    // Add 1 special challenge
    const randomSpecial = SPECIAL_CHALLENGES[Math.floor(Math.random() * SPECIAL_CHALLENGES.length)];
    if (randomSpecial) {
        const challenge: Challenge = {
            ...randomSpecial,
            id: `special-${Math.floor(Date.now() / 86400000)}`,
            startsAt: now,
            expiresAt: now + 7 * 24 * 3600000, // 7 days
            active: true,
        } as Challenge;
        challenges.push(challenge);
    }

    return challenges;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        switch (method) {
            // GET - Fetch active challenges and user progress
            case 'GET': {
                const { walletAddress } = req.query;

                const challenges = generateActiveChallenges();

                if (walletAddress) {
                    const progress = userProgress.get(walletAddress as string) || [];

                    // Merge challenges with user progress
                    const withProgress = challenges.map(challenge => {
                        const userProg = progress.find(p => p.challengeId === challenge.id);
                        return {
                            ...challenge,
                            userProgress: userProg ? {
                                progress: userProg.progress,
                                completed: userProg.completed,
                                completedAt: userProg.completedAt,
                                claimed: userProg.claimed,
                                claimedAt: userProg.claimedAt,
                            } : {
                                progress: 0,
                                completed: false,
                                claimed: false,
                            },
                        };
                    });

                    return res.status(200).json({
                        success: true,
                        challenges: withProgress,
                        stats: {
                            total: challenges.length,
                            completed: progress.filter(p => p.completed).length,
                            claimed: progress.filter(p => p.claimed).length,
                        },
                    });
                }

                return res.status(200).json({
                    success: true,
                    challenges,
                });
            }

            // POST - Update progress or claim reward
            case 'POST': {
                const { action, walletAddress, challengeId, progress: newProgress } = req.body;

                if (!walletAddress) {
                    return res.status(400).json({ error: 'Wallet address required' });
                }

                const existing = userProgress.get(walletAddress) || [];

                if (action === 'updateProgress') {
                    const idx = existing.findIndex(p => p.challengeId === challengeId);

                    const challenges = generateActiveChallenges();
                    const challenge = challenges.find(c => c.id === challengeId);

                    if (!challenge) {
                        return res.status(404).json({ error: 'Challenge not found' });
                    }

                    const completed = newProgress >= challenge.requirement.target;

                    const progressEntry: UserProgress = {
                        walletAddress,
                        challengeId,
                        progress: newProgress,
                        completed,
                        completedAt: completed ? Date.now() : undefined,
                        claimed: false,
                    };

                    if (idx >= 0) {
                        existing[idx] = { ...existing[idx], ...progressEntry };
                    } else {
                        existing.push(progressEntry);
                    }

                    userProgress.set(walletAddress, existing);

                    return res.status(200).json({
                        success: true,
                        message: completed ? 'Challenge completed!' : 'Progress updated',
                        progress: progressEntry,
                    });
                }

                if (action === 'claim') {
                    const idx = existing.findIndex(p => p.challengeId === challengeId);

                    if (idx === -1) {
                        return res.status(400).json({ error: 'No progress found for this challenge' });
                    }

                    if (!existing[idx] || !existing[idx].completed) {
                        return res.status(400).json({ error: 'Challenge not completed yet' });
                    }

                    if (existing[idx].claimed) {
                        return res.status(400).json({ error: 'Reward already claimed' });
                    }

                    if (existing[idx]) {
                        existing[idx].claimed = true;
                        existing[idx].claimedAt = Date.now();
                        userProgress.set(walletAddress, existing);
                    }

                    const challenges = generateActiveChallenges();
                    const challenge = challenges.find(c => c.id === challengeId);

                    logger.info(`[Challenges] Reward claimed: ${challengeId} by ${walletAddress}`);

                    return res.status(200).json({
                        success: true,
                        message: 'Reward claimed!',
                        reward: challenge?.reward,
                    });
                }

                return res.status(400).json({ error: 'Invalid action' });
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

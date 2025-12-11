import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

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
    completedAt?: number;
    claimedAt?: number;
}

const DIFFICULTY_COLORS = {
    easy: { bg: 'from-green-900/30 to-green-950/50', border: 'border-green-500/30', text: 'text-green-400' },
    medium: { bg: 'from-blue-900/30 to-blue-950/50', border: 'border-blue-500/30', text: 'text-blue-400' },
    hard: { bg: 'from-purple-900/30 to-purple-950/50', border: 'border-purple-500/30', text: 'text-purple-400' },
    legendary: { bg: 'from-yellow-900/30 to-orange-950/50', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

const MOCK_CHALLENGES: Challenge[] = [
    {
        id: 'daily-1',
        type: 'daily',
        title: 'First Trade of the Day',
        description: 'Execute at least one trade today',
        icon: '🎯',
        reward: { type: 'xp', amount: 100, label: '+100 XP' },
        requirement: { type: 'trades', target: 1, current: 0 },
        difficulty: 'easy',
        expiresAt: Date.now() + 8 * 3600000,
    },
    {
        id: 'daily-2',
        type: 'daily',
        title: 'Volume Hunter',
        description: 'Trade at least 5 SOL in volume today',
        icon: '💰',
        reward: { type: 'xp', amount: 250, label: '+250 XP' },
        requirement: { type: 'volume', target: 5, current: 2.5 },
        difficulty: 'medium',
        expiresAt: Date.now() + 8 * 3600000,
    },
    {
        id: 'daily-3',
        type: 'daily',
        title: 'Win Streak',
        description: 'Get 3 profitable trades in a row',
        icon: '🔥',
        reward: { type: 'xp', amount: 500, label: '+500 XP' },
        requirement: { type: 'winStreak', target: 3, current: 1 },
        difficulty: 'hard',
        expiresAt: Date.now() + 8 * 3600000,
    },
    {
        id: 'weekly-1',
        type: 'weekly',
        title: 'Weekly Warrior',
        description: 'Complete 20 trades this week',
        icon: '⚔️',
        reward: { type: 'badge', amount: 1, label: 'Weekly Warrior Badge' },
        requirement: { type: 'trades', target: 20, current: 12 },
        difficulty: 'medium',
        expiresAt: Date.now() + 3 * 24 * 3600000,
    },
    {
        id: 'weekly-2',
        type: 'weekly',
        title: 'Profit Machine',
        description: 'Achieve 10 SOL in realized profit this week',
        icon: '💎',
        reward: { type: 'sol', amount: 0.1, label: '+0.1 SOL' },
        requirement: { type: 'profit', target: 10, current: 7.5 },
        difficulty: 'hard',
        expiresAt: Date.now() + 3 * 24 * 3600000,
    },
    {
        id: 'special-1',
        type: 'special',
        title: 'Whale Watcher',
        description: 'Copy a trade from a Top 10 leaderboard wallet',
        icon: '🐋',
        reward: { type: 'pro', amount: 7, label: '+7 Days PRO' },
        requirement: { type: 'copyTrade', target: 1, current: 0 },
        difficulty: 'legendary',
        expiresAt: Date.now() + 7 * 24 * 3600000,
    },
];

export default function DailyChallengesActive() {
    const { publicKey } = useWallet();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);

    useEffect(() => {
        // Load challenges
        setLoading(true);
        setTimeout(() => {
            setChallenges(MOCK_CHALLENGES);
            setLoading(false);
        }, 500);
    }, [publicKey]);

    const formatTimeLeft = (expiresAt: number) => {
        const diff = expiresAt - Date.now();
        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h left`;
        }
        return `${hours}h ${minutes}m left`;
    };

    const getProgress = (challenge: Challenge) => {
        return Math.min(100, (challenge.requirement.current / challenge.requirement.target) * 100);
    };

    const isCompleted = (challenge: Challenge) => {
        return challenge.requirement.current >= challenge.requirement.target;
    };

    const handleClaim = async (challengeId: string) => {
        setClaiming(challengeId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setChallenges(prev =>
            prev.map(c =>
                c.id === challengeId ? { ...c, claimedAt: Date.now() } : c
            )
        );
        setClaiming(null);
    };

    const filteredChallenges = challenges.filter(c =>
        filter === 'all' || c.type === filter
    );

    const stats = {
        completed: challenges.filter(c => isCompleted(c)).length,
        total: challenges.length,
        claimed: challenges.filter(c => c.claimedAt).length,
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded-lg w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-700/50 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        ⚔️ Active Challenges
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                            {stats.completed}/{stats.total} Complete
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Complete challenges to earn rewards</p>
                </div>

                {/* Filter buttons */}
                <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1">
                    {(['all', 'daily', 'weekly', 'special'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${filter === type
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            {type === 'all' ? '🎮 All' : type === 'daily' ? '📅 Daily' : type === 'weekly' ? '📆 Weekly' : '⭐ Special'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/50 rounded-xl p-4 border border-purple-500/20 text-center">
                    <div className="text-3xl font-black text-purple-400">{stats.completed}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-green-950/50 rounded-xl p-4 border border-green-500/20 text-center">
                    <div className="text-3xl font-black text-green-400">{stats.claimed}</div>
                    <div className="text-xs text-gray-400">Claimed</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/50 rounded-xl p-4 border border-yellow-500/20 text-center">
                    <div className="text-3xl font-black text-yellow-400">
                        {challenges.reduce((sum, c) => sum + (isCompleted(c) ? c.reward.amount : 0), 0)}
                    </div>
                    <div className="text-xs text-gray-400">XP Earned</div>
                </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
                {filteredChallenges.map((challenge) => {
                    const colors = DIFFICULTY_COLORS[challenge.difficulty];
                    const completed = isCompleted(challenge);
                    const claimed = !!challenge.claimedAt;
                    const progress = getProgress(challenge);

                    return (
                        <div
                            key={challenge.id}
                            className={`relative overflow-hidden rounded-xl border ${colors.border} ${claimed ? 'opacity-60' : ''
                                }`}
                        >
                            {/* Background gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`}></div>

                            {/* Content */}
                            <div className="relative p-4">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="text-4xl flex-shrink-0">{challenge.icon}</div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.text} bg-gray-900/50 capitalize`}>
                                                {challenge.difficulty}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900/50 text-gray-400 capitalize">
                                                {challenge.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

                                        {/* Progress bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">
                                                    {challenge.requirement.current} / {challenge.requirement.target}
                                                </span>
                                                <span className={colors.text}>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${completed
                                                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                                                            : `bg-gradient-to-r ${colors.bg.replace('from-', 'from-').replace('/30', '').replace('/50', '')}`
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm font-bold ${colors.text}`}>
                                                    {challenge.reward.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ⏰ {formatTimeLeft(challenge.expiresAt)}
                                                </span>
                                            </div>

                                            {/* Claim button */}
                                            {completed && !claimed && (
                                                <button
                                                    onClick={() => handleClaim(challenge.id)}
                                                    disabled={claiming === challenge.id}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {claiming === challenge.id ? (
                                                        <>
                                                            <span className="animate-spin">⏳</span> Claiming...
                                                        </>
                                                    ) : (
                                                        <>
                                                            🎁 Claim Reward
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {claimed && (
                                                <span className="text-green-400 font-bold flex items-center gap-1">
                                                    ✅ Claimed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Completed overlay */}
                            {completed && !claimed && (
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                                        🎉 COMPLETE!
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredChallenges.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎮</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Challenges Available</h3>
                    <p className="text-gray-400">Check back later for new challenges!</p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
                <p className="text-xs text-gray-500">
                    Daily challenges reset at 00:00 UTC • Weekly challenges reset on Mondays
                </p>
            </div>
        </div>
    );
}

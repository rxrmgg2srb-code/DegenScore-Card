import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FIFACardProps {
    rank: number;
    walletAddress: string;
    displayName?: string;
    profileImage?: string;
    degenScore: number;
    tier: string;
    stats: {
        winRate: number;
        totalVolume: number;
        profitLoss: number;
        totalTrades: number;
        avgHoldTime: number;
        level: number;
    };
    badges: Array<{
        name: string;
        icon: string;
        rarity: string;
    }>;
    twitter?: string;
    telegram?: string;
}

export default function FIFACard({
    rank,
    walletAddress,
    displayName,
    profileImage,
    degenScore,
    tier,
    stats,
    badges,
    twitter,
    telegram,
}: FIFACardProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Determinar color según ranking
    const getCardGradient = () => {
        if (rank <= 10) return 'from-yellow-400 via-yellow-500 to-yellow-600'; // ORO
        if (rank <= 50) return 'from-gray-300 via-gray-400 to-gray-500'; // PLATA
        return 'from-orange-600 via-orange-700 to-orange-800'; // BRONCE
    };

    const getCardBg = () => {
        if (rank <= 10) return 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20';
        if (rank <= 50) return 'bg-gradient-to-br from-gray-400/20 to-gray-600/20';
        return 'bg-gradient-to-br from-orange-500/20 to-amber-700/20';
    };

    const getTierEmoji = () => {
        if (tier.includes('Whale')) return '🐋';
        if (tier.includes('Shark')) return '🦈';
        if (tier.includes('Dolphin')) return '🐬';
        if (tier.includes('Fish')) return '🐟';
        return '🦐';
    };

    return (
        <>
            <motion.div
                className="relative cursor-pointer"
                onHoverStart={() => setShowDetails(true)}
                onHoverEnd={() => setShowDetails(false)}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                {/* FIFA Card Container */}
                <div className={`
                    relative w-64 h-96 rounded-2xl overflow-hidden
                    ${getCardBg()}
                    border-4 border-gradient-to-r ${getCardGradient()}
                    shadow-2xl
                `}>
                    {/* Radiant Background Effect */}
                    <div className={`
                        absolute inset-0 opacity-30
                        bg-gradient-to-br ${getCardGradient()}
                    `}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col p-4">
                        {/* Header: Rating + Tier */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="text-center">
                                <div className="text-5xl font-black text-white drop-shadow-lg">
                                    {degenScore}
                                </div>
                                <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
                                    Rating
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl">{getTierEmoji()}</div>
                                <div className="text-xs font-bold text-white/80 uppercase">
                                    {tier}
                                </div>
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div className="flex-1 flex items-center justify-center mb-3">
                            <div className="relative w-40 h-40">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 rounded-full" />
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={displayName || walletAddress}
                                        className="w-full h-full object-cover rounded-full border-4 border-white/30"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/30">
                                        <span className="text-6xl">👤</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name + Wallet */}
                        <div className="text-center mb-3">
                            <div className="text-xl font-black text-white drop-shadow-md uppercase tracking-wide">
                                {displayName || walletAddress.slice(0, 8)}
                            </div>
                            <div className="text-xs text-white/60 font-mono">
                                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center justify-center gap-3 mb-3">
                            {twitter && (
                                <a
                                    href={`https://twitter.com/${twitter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}

                            {/* Solana Logo (center) */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">SOL</span>
                            </div>

                            {telegram && (
                                <a
                                    href={`https://t.me/${telegram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-blue-500/30 hover:bg-blue-500/50 flex items-center justify-center transition-all hover:scale-110"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.02-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.11.78.89z" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {/* Stats (FIFA style) */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <StatPill label="WIN" value={stats.winRate.toFixed(0)} />
                            <StatPill label="VOL" value={abbreviateNumber(stats.totalVolume)} />
                            <StatPill label="P&L" value={abbreviateNumber(stats.profitLoss)} />
                            <StatPill label="TRD" value={abbreviateNumber(stats.totalTrades)} />
                            <StatPill label="HOD" value={`${Math.round(stats.avgHoldTime)}h`} />
                            <StatPill label="LVL" value={stats.level.toString()} />
                        </div>

                        {/* Rank Badge */}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border-2 border-white/30">
                            <span className="text-white font-black text-sm">#{rank}</span>
                        </div>

                        {/* Badges Preview */}
                        {badges.length > 0 && (
                            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1">
                                {badges.slice(0, 3).map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className="text-2xl drop-shadow-lg"
                                        title={badge.name}
                                    >
                                        {badge.icon}
                                    </div>
                                ))}
                                {badges.length > 3 && (
                                    <div className="text-white/60 text-xs self-center">
                                        +{badges.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Glow Effect on Hover */}
                <motion.div
                    className={`
                        absolute inset-0 -z-10 rounded-2xl blur-2xl
                        bg-gradient-to-r ${getCardGradient()}
                    `}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showDetails ? 0.6 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            {/* Detailed Stats Modal */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDetails(false)}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-2xl w-full mx-4 border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/20"
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-4xl font-black text-white mb-2">
                                    {displayName || walletAddress.slice(0, 12) + '...'}
                                </h2>
                                <div className="text-cyan-400 text-lg font-mono">
                                    Rank #{rank} • {tier} {getTierEmoji()}
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <DetailStat label="DegenScore" value={degenScore.toString()} />
                                <DetailStat label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
                                <DetailStat label="Total Volume" value={`${stats.totalVolume.toFixed(2)} SOL`} />
                                <DetailStat label="Profit/Loss" value={`${stats.profitLoss.toFixed(2)} SOL`} />
                                <DetailStat label="Total Trades" value={stats.totalTrades.toString()} />
                                <DetailStat label="Avg Hold Time" value={`${stats.avgHoldTime.toFixed(1)}h`} />
                            </div>

                            {/* All Badges */}
                            <div className="mb-6">
                                <h3 className="text-white font-bold text-xl mb-3">🏆 Achievements</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {badges.map((badge, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700 hover:border-cyan-500 transition-all"
                                        >
                                            <div className="text-3xl mb-1">{badge.icon}</div>
                                            <div className="text-white text-xs font-bold">{badge.name}</div>
                                            <div className={`text-xs mt-1 ${getRarityColor(badge.rarity)}`}>
                                                {badge.rarity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3 justify-center">
                                {twitter && (
                                    <a
                                        href={`https://twitter.com/${twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        Follow on X
                                    </a>
                                )}
                                {telegram && (
                                    <a
                                        href={`https://t.me/${telegram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.02-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.11.78.89z" />
                                        </svg>
                                        Join Telegram
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Helper Components
function StatPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
            <div className="text-white/60 text-[10px] font-bold uppercase">{label}</div>
            <div className="text-white text-sm font-black">{value}</div>
        </div>
    );
}

function DetailStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">{label}</div>
            <div className="text-white text-2xl font-bold">{value}</div>
        </div>
    );
}

function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
        COMMON: 'text-gray-400',
        RARE: 'text-blue-400',
        EPIC: 'text-purple-400',
        LEGENDARY: 'text-yellow-400',
        MYTHIC: 'text-pink-400',
    };
    return colors[rarity] || 'text-gray-400';
}

function abbreviateNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
}

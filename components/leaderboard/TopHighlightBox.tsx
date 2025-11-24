import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from './types';
import { getTierConfig, formatNumber } from './utils';

interface TopHighlightBoxProps {
  entry: LeaderboardEntry;
  label: string;
}

export const TopHighlightBox = ({ entry, label }: TopHighlightBoxProps) => {
  const tier = getTierConfig(entry.degenScore);

  return (
    <Link href={`/profile/${entry.walletAddress}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="relative rounded-3xl border-[3px] border-yellow-400/60 overflow-hidden cursor-pointer group"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-purple-900/20"></div>

        {/* Shine effect */}
        <div className="absolute inset-0 shine-effect opacity-30 group-hover:opacity-50 transition-opacity"></div>

        {/* Crown icon background */}
        <div className="absolute -top-4 -right-4 text-7xl opacity-10 group-hover:opacity-20 transition-opacity">
          👑
        </div>

        {/* Content */}
        <div className="relative p-8 bg-gray-900/90 backdrop-blur-md">
          {/* Label */}
          <div className="text-center mb-6">
            <p className="text-2xl font-black text-yellow-400 drop-shadow-lg">{label}</p>
          </div>

          {/* Main content grid */}
          <div className="flex gap-6">
            {/* Left: Profile */}
            <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.05 }}>
              {entry.profileImage ? (
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400/60 overflow-hidden bg-gray-800 shadow-2xl ring-4 ring-black/20 relative">
                  <Image
                    src={entry.profileImage}
                    alt={entry.displayName || 'Profile'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400/60 bg-gray-800 flex items-center justify-center shadow-2xl ring-4 ring-black/20">
                  <span className="text-4xl">👤</span>
                </div>
              )}
              <div className="text-center mt-4">
                {entry.displayName && (
                  <p className="text-white font-bold text-sm">{entry.displayName}</p>
                )}
                <p className="text-xs text-cyan-400 font-mono bg-cyan-950/30 px-2 py-1 rounded-full border border-cyan-500/20 inline-block mt-1">
                  {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-6)}
                </p>
              </div>
            </motion.div>

            {/* Right: Stats */}
            <div className="flex-1 space-y-4">
              {/* Score */}
              <motion.div
                whileHover={{ x: 5 }}
                className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20"
              >
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Degen Score</p>
                <p
                  className={`text-3xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}
                >
                  {entry.degenScore}
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20"
                >
                  <p className="text-xs text-gray-500 uppercase font-bold">Volume</p>
                  <p className="text-lg font-bold text-blue-300">
                    {formatNumber(entry.totalVolume)}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-green-500/5 rounded-lg p-3 border border-green-500/20"
                >
                  <p className="text-xs text-gray-500 uppercase font-bold">Win Rate</p>
                  <p className="text-lg font-bold text-green-300">{entry.winRate.toFixed(0)}%</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/20"
                >
                  <p className="text-xs text-gray-500 uppercase font-bold">Trades</p>
                  <p className="text-lg font-bold text-purple-300">
                    {formatNumber(entry.totalTrades, 0)}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg p-3 border ${entry.profitLoss >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                >
                  <p className="text-xs text-gray-500 uppercase font-bold">P&L</p>
                  <p
                    className={`text-lg font-bold ${entry.profitLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}
                  >
                    {entry.profitLoss >= 0 ? '+' : ''}
                    {formatNumber(entry.profitLoss)}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Badges section */}
          {entry.calculatedBadges && entry.calculatedBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 pt-6 border-t border-gray-700/50"
            >
              <p className="text-xs text-gray-500 uppercase font-bold mb-3">Achievements</p>
              <div className="flex gap-2 flex-wrap">
                {entry.calculatedBadges.slice(0, 8).map((badge, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    title={badge.name}
                    className="text-2xl cursor-help hover:z-10"
                  >
                    {badge.icon}
                  </motion.div>
                ))}
                {entry.calculatedBadges.length > 8 && (
                  <div className="flex items-center text-xs text-gray-500 font-bold">
                    +{entry.calculatedBadges.length - 8} more
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Crown decoration */}
          <div className="absolute top-4 right-4 text-4xl animate-bounce">👑</div>
        </div>
      </motion.div>
    </Link>
  );
};

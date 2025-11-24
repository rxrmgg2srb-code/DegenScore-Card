import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { LeaderboardEntry, TimePeriod, PaginationInfo } from './types';
import { LeaderboardCard } from './LeaderboardCard';
import { TopHighlightBox } from './TopHighlightBox';
import { RankChangeIndicator } from './RankChangeIndicator';

interface PublicLeaderboardProps {
  initialPeriod?: TimePeriod;
}

export const PublicLeaderboard = ({ initialPeriod = 'all' }: PublicLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [topToday, setTopToday] = useState<LeaderboardEntry | null>(null);
  const [topAllTime, setTopAllTime] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [sortBy, setSortBy] = useState<string>('degenScore');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [previousRanks, setPreviousRanks] = useState<{ [key: string]: number }>({});

  const periods: TimePeriod[] = ['today', 'weekly', 'monthly', 'all'];

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        period,
        page: page.toString(),
        limit: '50',
      });

      const response = await fetch(`/api/leaderboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Track rank changes
        const newRanks: { [key: string]: number } = {};
        data.leaderboard.forEach((entry: LeaderboardEntry, idx: number) => {
          newRanks[entry.id] = idx + 1;
        });
        setPreviousRanks(previousRanks);

        setLeaderboard(data.leaderboard);
        setPagination(data.pagination);

        if (data.topToday) {
          setTopToday(data.topToday);
        }
        if (data.topAllTime) {
          setTopAllTime(data.topAllTime);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [period, sortBy, page, previousRanks]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  const getRankChange = (entryId: string, currentRank: number) => {
    const previousRank = previousRanks[entryId];
    if (!previousRank) {
      return 0;
    }
    return previousRank - currentRank;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120 as any,
        damping: 14 as any,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
            🏆 Public Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top Solana traders ranked by DegenScore</p>
        </motion.div>

        {/* Top 1 Highlight Boxes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`top-${period}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            {topToday && (
              <motion.div variants={itemVariants}>
                <TopHighlightBox entry={topToday} label="🔥 Top 1 Today" />
              </motion.div>
            )}
            {topAllTime && (
              <motion.div variants={itemVariants}>
                <TopHighlightBox entry={topAllTime} label="⏰ Top 1 All Time" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Filters and Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
          className="mb-8 space-y-6"
        >
          {/* Period Tabs */}
          <div className="flex flex-wrap gap-3 justify-center">
            {periods.map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePeriodChange(p)}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-3 justify-center">
            {['degenScore', 'totalVolume', 'winRate', 'likes'].map((sort) => (
              <motion.button
                key={sort}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSortChange(sort)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === sort
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {sort === 'degenScore' && '📊 Score'}
                {sort === 'totalVolume' && '💰 Volume'}
                {sort === 'winRate' && '📈 Win Rate'}
                {sort === 'likes' && '❤️ Likes'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard List */}
        {loading ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-gray-400 mt-4">Loading leaderboard...</p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${page}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {leaderboard.map((entry, idx) => {
                  const currentRank = (page - 1) * 50 + idx + 1;
                  const rankChange = getRankChange(entry.id, currentRank);

                  return (
                    <motion.div key={entry.id} variants={itemVariants} className="relative">
                      <div className="relative">
                        <LeaderboardCard
                          entry={entry}
                          index={currentRank - 1}
                          handleLike={async () => {}} // Implement like if needed
                          userLikes={{}}
                        />
                        {rankChange !== 0 && (
                          <div className="absolute -top-4 -right-4">
                            <RankChangeIndicator change={rankChange} />
                          </div>
                        )}
                      </div>
                      <Link href={`/profile/${entry.walletAddress}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="absolute inset-0 rounded-3xl cursor-pointer"
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  ← Previous
                </motion.button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Next →
                </motion.button>
              </motion.div>
            )}

            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8 text-gray-500 text-sm"
            >
              Showing {leaderboard.length} degens • Page {page} of {pagination?.totalPages || 1}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

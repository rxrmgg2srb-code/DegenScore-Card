import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  walletAddress: string;
  degenScore: number;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  isMinted: boolean;
  level: number;
  badges: Array<{ name: string; icon: string; rarity: string }>;
}

type SortBy = 'degenScore' | 'totalVolume' | 'winRate' | 'profitLoss';
type FilterBy = 'all' | 'minted' | 'unminted';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('degenScore');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, filterBy, page]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?sortBy=${sortBy}&filterBy=${filterBy}&page=${page}&limit=50`
      );
      const data = await response.json();
      setEntries(data.entries);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatSOL = (amount: number) => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`;
    return amount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                🏆 Degen Leaderboard
              </h1>
              <p className="text-gray-400 mt-2">Top traders ranked by on-chain performance</p>
            </div>
            <Link href="/">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg">
                🎴 Generate Your Card
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Sort By */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-medium">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: 'degenScore', label: '🎯 Score' },
                  { value: 'totalVolume', label: '💰 Volume' },
                  { value: 'winRate', label: '📈 Win Rate' },
                  { value: 'profitLoss', label: '💵 P&L' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortBy)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      sortBy === option.value
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter By */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-medium">Filter:</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'minted', label: '✨ Minted' },
                  { value: 'unminted', label: 'Unminted' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterBy(option.value as FilterBy)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterBy === option.value
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wallet</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Level</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Score</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Volume</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Win Rate</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">P&L</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Trades</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Badges</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {entries.map((entry, index) => {
                    const rank = (page - 1) * 50 + index + 1;
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/profile/${entry.walletAddress}`}
                      >
                        <td className="px-6 py-4">
                          <span className={`text-2xl font-bold ${getRankColor(rank)}`}>
                            {getRankIcon(rank)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white">
                              {entry.walletAddress.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-mono text-gray-300">{formatAddress(entry.walletAddress)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                            ⭐ {entry.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-2xl font-bold ${
                            entry.degenScore >= 80 ? 'text-green-400' :
                            entry.degenScore >= 60 ? 'text-cyan-400' :
                            entry.degenScore >= 40 ? 'text-yellow-400' :
                            'text-orange-400'
                          }`}>
                            {entry.degenScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-300 font-semibold">{formatSOL(entry.totalVolume)} SOL</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-semibold ${
                            entry.winRate >= 70 ? 'text-green-400' :
                            entry.winRate >= 50 ? 'text-cyan-400' :
                            'text-orange-400'
                          }`}>
                            {entry.winRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${
                            entry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {entry.profitLoss >= 0 ? '+' : ''}{formatSOL(entry.profitLoss)} SOL
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-400">{entry.totalTrades}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1">
                            {entry.badges.slice(0, 3).map((badge, i) => (
                              <span key={i} className="text-lg" title={badge.name}>
                                {badge.icon}
                              </span>
                            ))}
                            {entry.badges.length > 3 && (
                              <span className="text-xs text-gray-500">+{entry.badges.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {entry.isMinted ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                              ✨ Minted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">
                              Unminted
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-between border-t border-gray-700">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all"
                >
                  ← Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

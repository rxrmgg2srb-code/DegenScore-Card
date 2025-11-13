import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  walletAddress: string;
  degenScore: number;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  level: number;
  xp: number;
  badges: any[];
  mintedAt: string;
}

interface Stats {
  totalCards: number;
  avgScore: number;
  topScore: number;
  totalVolume: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'degenScore' | 'totalVolume' | 'winRate'>('degenScore');
  const [searchWallet, setSearchWallet] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankForWallet = (wallet: string) => {
    const index = leaderboard.findIndex(
      entry => entry.walletAddress.toLowerCase() === wallet.toLowerCase()
    );
    return index !== -1 ? index + 1 : null;
  };

  const getTierBadge = (score: number) => {
    if (score >= 90) return { name: 'LEGENDARY', color: 'from-yellow-400 to-orange-500', emoji: '👑' };
    if (score >= 80) return { name: 'MASTER', color: 'from-purple-400 to-pink-500', emoji: '💎' };
    if (score >= 70) return { name: 'DIAMOND', color: 'from-blue-400 to-cyan-500', emoji: '💠' };
    if (score >= 60) return { name: 'PLATINUM', color: 'from-gray-300 to-gray-400', emoji: '⚡' };
    if (score >= 50) return { name: 'GOLD', color: 'from-yellow-300 to-yellow-500', emoji: '🌟' };
    return { name: 'DEGEN', color: 'from-green-400 to-emerald-500', emoji: '🎮' };
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const filteredLeaderboard = searchWallet
    ? leaderboard.filter(entry =>
        entry.walletAddress.toLowerCase().includes(searchWallet.toLowerCase())
      )
    : leaderboard;

  return (
    <>
      <Head>
        <title>Leaderboard | DegenScore</title>
        <meta name="description" content="Top Solana traders ranked by DegenScore" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                ← Back Home
              </button>
            </Link>
            <h1 className="text-4xl font-bold text-white">🏆 Leaderboard</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Global Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
                <div className="text-gray-400 text-sm mb-1">Total Degens</div>
                <div className="text-3xl font-bold text-white">{stats.totalCards.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <div className="text-gray-400 text-sm mb-1">Average Score</div>
                <div className="text-3xl font-bold text-purple-400">{stats.avgScore.toFixed(0)}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
                <div className="text-gray-400 text-sm mb-1">Top Score</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.topScore}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                <div className="text-gray-400 text-sm mb-1">Total Volume</div>
                <div className="text-3xl font-bold text-green-400">{formatNumber(stats.totalVolume)} SOL</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Sort By */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('degenScore')}
                className={`px-4 py-2 rounded-lg transition ${
                  sortBy === 'degenScore'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🏆 Score
              </button>
              <button
                onClick={() => setSortBy('totalVolume')}
                className={`px-4 py-2 rounded-lg transition ${
                  sortBy === 'totalVolume'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                💰 Volume
              </button>
              <button
                onClick={() => setSortBy('winRate')}
                className={`px-4 py-2 rounded-lg transition ${
                  sortBy === 'winRate'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🎯 Win Rate
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search wallet address..."
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="text-gray-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Trades
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        P&L
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredLeaderboard.map((entry, index) => {
                      const tier = getTierBadge(entry.degenScore);
                      const isTop3 = index < 3;

                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-gray-700/30 transition ${
                            isTop3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                              <span className={`font-bold ${isTop3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-white">
                              {entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tier.color} text-white inline-flex items-center gap-1`}
                            >
                              {tier.emoji} {tier.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-2xl font-bold text-cyan-400">{entry.degenScore}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-white">{entry.totalTrades.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-white">{formatNumber(entry.totalVolume)} SOL</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={entry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {entry.profitLoss >= 0 ? '+' : ''}
                              {formatNumber(entry.profitLoss)} SOL
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-white">{entry.winRate.toFixed(1)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-purple-400 font-bold">Lv.{entry.level}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredLeaderboard.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No results found
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Showing top {filteredLeaderboard.length} degens • Updated in real-time
          </div>
        </div>
      </div>
    </>
  );
}

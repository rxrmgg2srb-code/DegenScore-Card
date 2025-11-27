import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LanguageSelector } from './LanguageSelector';
import FIFACard, { FIFACardProps } from './FIFACard';
import { LeaderboardEntry, Stats, ViewMode, SortBy } from './leaderboard/types';
import { LeaderboardCard } from './leaderboard/LeaderboardCard';
import { LeaderboardTable } from './leaderboard/LeaderboardTable';
import { LeaderboardStats } from './leaderboard/LeaderboardStats';
import { LeaderboardFilters } from './leaderboard/LeaderboardFilters';

// Dynamic imports - NO ejecutar en servidor, solo en cliente
const RankingsWidget = dynamic(() => import('./RankingsWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-2xl h-96"></div>
});

const ChallengeWinnersWidget = dynamic(() => import('./ChallengeWinnersWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded-2xl h-96"></div>
});

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('all');
  const [searchWallet, setSearchWallet] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // CRITICAL: Only fetch on client-side, NOT during build/SSG
    if (typeof window !== 'undefined') {
      fetchLeaderboard();
    }
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=100`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  const handleLike = async (cardId: string) => {
    const hasLiked = userLikes[cardId];

    setUserLikes(prev => ({ ...prev, [cardId]: !hasLiked }));
    setLeaderboard(prev =>
      prev.map(entry => {
        if (entry.id === cardId) {
          const newLikes = (entry.likes || 0) + (hasLiked ? -1 : 1);
          return { ...entry, likes: newLikes };
        }
        return entry;
      })
    );

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, increment: !hasLiked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();

      setLeaderboard(prev =>
        prev.map(entry =>
          entry.id === cardId
            ? { ...entry, likes: data.likes }
            : entry
        )
      );
    } catch (error) {
      console.error('Error updating like:', error);
      setUserLikes(prev => ({ ...prev, [cardId]: hasLiked } as { [key: string]: boolean }));
      setLeaderboard(prev =>
        prev.map(entry =>
          entry.id === cardId
            ? { ...entry, likes: (entry.likes || 0) + (hasLiked ? 1 : -1) }
            : entry
        )
      );
    }
  };

  const filteredLeaderboard = searchWallet
    ? leaderboard.filter(entry =>
      entry.walletAddress.toLowerCase().includes(searchWallet.toLowerCase()) ||
      (entry.displayName && entry.displayName.toLowerCase().includes(searchWallet.toLowerCase()))
    )
    : leaderboard;

  return (
    <>
      <Head>
        <title>Leaderboard | DegenScore</title>
        <meta name="description" content="Top Solana traders ranked by DegenScore" />
      </Head>

      <style jsx global>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shine-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 3s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header con selector de idiomas */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition">
                ← Back Home
              </button>
            </Link>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              🏆 Leaderboard
            </h1>
            <div className="w-32"></div>
          </div>

          <LeaderboardStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LeaderboardFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchWallet={searchWallet}
                setSearchWallet={setSearchWallet}
              />
              {/* Sorting Buttons */}
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  className={`px-4 py-2 rounded ${sortBy === 'likes' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-200'}`}
                  onClick={() => setSortBy('likes')}
                >
                  Likes
                </button>
                <button
                  className={`px-4 py-2 rounded ${sortBy === 'newest' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-200'}`}
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </button>
                <button
                  className={`px-4 py-2 rounded ${sortBy === 'oldest' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-200'}`}
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest
                </button>
                <button
                  className={`px-4 py-2 rounded ${sortBy === 'all' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-200'}`}
                  onClick={() => setSortBy('all' as SortBy)}
                >
                  All
                </button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                  <p className="text-gray-400 mt-4">Loading leaderboard...</p>
                </div>
              ) : (
                <>
                  {filteredLeaderboard.length > 0 ? (
                    <>
                      {viewMode === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filteredLeaderboard.map((entry, index) => (
                            // Render new FIFA style card
                            <FIFACard
                              key={entry.id}
                              rank={entry.rank ?? index + 1}
                              walletAddress={entry.walletAddress}
                              displayName={entry.displayName}
                              profileImage={(entry as any).profileImage || undefined}
                              degenScore={entry.degenScore ?? 0}
                              tier={(entry as any).tier ?? 'Bronze'}
                              stats={(entry as any).stats ?? {
                                winRate: 0,
                                totalVolume: 0,
                                profitLoss: 0,
                                totalTrades: 0,
                                avgHoldTime: 0,
                                level: 0,
                              }}
                              badges={entry.badges ?? []}
                              twitter={(entry as any).twitter}
                              telegram={(entry as any).telegram}
                            />
                          ))}
                        </div>
                      )}

                      {viewMode === 'table' && (
                        <LeaderboardTable
                          filteredLeaderboard={filteredLeaderboard}
                          handleLike={handleLike}
                          userLikes={userLikes}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">No results found</div>
                  )}
                </>
              )}

              <div className="mt-8 text-center text-gray-500 text-sm">
                Showing top {filteredLeaderboard.length} degens • Updated in real-time
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Awards Classification Sidebar */}
                <div className="bg-gray-800 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">Awards</h3>
                  <ul className="list-disc list-inside text-gray-200 space-y-1">
                    <li>Gold: Top 1</li>
                    <li>Silver: Top 2‑5</li>
                    <li>Bronze: Top 6‑10</li>
                  </ul>
                </div>
                <RankingsWidget />
                <ChallengeWinnersWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component only - no static props needed
// This will be loaded dynamically from pages/leaderboard.tsx
export default Leaderboard;
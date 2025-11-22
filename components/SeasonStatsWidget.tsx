import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface TopLikedCard {
  id: string;
  walletAddress: string;
  displayName?: string;
  degenScore: number;
  likes: number;
  profileImage?: string;
}

interface TopReferrer {
  wallet: string;
  displayName?: string;
  referralCount: number;
  profileImage?: string;
}

interface Achievement {
  name: string;
  description: string;
  emoji: string;
  unlockedBy: number;
}

interface SeasonStats {
  topLiked: TopLikedCard[];
  topReferrers: TopReferrer[];
  recentAchievements: Achievement[];
  seasonStart: string;
  totalCards: number;
  totalLikes: number;
}

export default function SeasonStatsWidget() {
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'liked' | 'referrals' | 'achievements'>('liked');

  useEffect(() => {
    fetchSeasonStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSeasonStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchSeasonStats = async () => {
    try {
      const response = await fetch('/api/season-stats');
      const data = await response.json();

      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      logger.error('Error fetching season stats', error instanceof Error ? error : undefined, {
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl sticky top-4">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          🏆 Season Stats
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {stats.totalCards.toLocaleString()} cards • {stats.totalLikes.toLocaleString()} likes
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'liked'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ❤️ Most Liked
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'referrals'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
          }`}
        >
          👥 Referrals
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'achievements'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🎖️ Achievements
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-2">
        {activeTab === 'liked' && (
          <>
            {stats.topLiked.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                No cards with likes yet
              </div>
            ) : (
              stats.topLiked.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-gray-900/50 rounded-xl p-3 border border-gray-600/50 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-gray-500 w-6">
                      #{index + 1}
                    </div>

                    {card.profileImage ? (
                      <img
                        src={card.profileImage}
                        alt={card.displayName || 'Profile'}
                        className="w-10 h-10 rounded-full border-2 border-red-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-red-500/50 bg-gray-800 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {card.displayName && (
                        <div className="text-white font-semibold text-sm truncate">
                          {card.displayName}
                        </div>
                      )}
                      <div className="text-xs font-mono text-gray-400">
                        Score: {card.degenScore}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-lg">
                      <span className="text-red-400">❤️</span>
                      <span className="text-red-400 font-bold text-sm">
                        {card.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'referrals' && (
          <>
            {stats.topReferrers.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                No referrals yet
              </div>
            ) : (
              stats.topReferrers.map((referrer, index) => (
                <div
                  key={referrer.wallet}
                  className="bg-gray-900/50 rounded-xl p-3 border border-gray-600/50 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-gray-500 w-6">
                      #{index + 1}
                    </div>

                    {referrer.profileImage ? (
                      <img
                        src={referrer.profileImage}
                        alt={referrer.displayName || 'Profile'}
                        className="w-10 h-10 rounded-full border-2 border-cyan-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 bg-gray-800 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {referrer.displayName ? (
                        <div className="text-white font-semibold text-sm truncate">
                          {referrer.displayName}
                        </div>
                      ) : (
                        <div className="text-gray-400 font-mono text-xs">
                          {referrer.wallet.slice(0, 6)}...{referrer.wallet.slice(-4)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-1 rounded-lg">
                      <span className="text-cyan-400">👥</span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {referrer.referralCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'achievements' && (
          <>
            {stats.recentAchievements.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                No achievements unlocked yet
              </div>
            ) : (
              stats.recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-xl p-3 border border-gray-600/50 hover:border-yellow-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {achievement.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {achievement.description}
                      </div>
                    </div>

                    <div className="bg-yellow-500/20 px-2 py-1 rounded-lg">
                      <span className="text-yellow-400 font-bold text-xs">
                        {achievement.unlockedBy}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Season started {new Date(stats.seasonStart).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

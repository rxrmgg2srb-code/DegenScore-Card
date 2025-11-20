import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RankingsWidget from '../components/RankingsWidget';
import { BadgesDisplay } from '../components/BadgesDisplay';
import { LanguageSelector } from '../components/LanguageSelector';

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
  bestTrade: number;
  worstTrade: number;
  badges: any[];
  mintedAt: string;
  displayName?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  profileImage?: string | null;
  isPaid?: boolean;
  likes: number;
  badgePoints?: number;
  referralCount?: number;
  calculatedBadges?: any[]; // Badges desbloqueados con su info completa
}

interface Stats {
  totalCards: number;
  avgScore: number;
  topScore: number;
  totalVolume: number;
}

type ViewMode = 'table' | 'cards';
type SortBy = 'likes' | 'referralCount' | 'badgePoints';

const getTierConfig = (score: number) => {
  if (score >= 90) {
    return {
      name: 'LEGENDARY',
      emoji: '👑',
      gradient: 'from-yellow-500 via-orange-400 to-yellow-300',
      border: 'border-yellow-400',
      glow: 'shadow-[0_0_40px_rgba(251,191,36,0.8)] shadow-yellow-500/80',
      bgPattern: 'bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-yellow-800/30',
      textColor: 'text-yellow-300',
      badgeGradient: 'from-yellow-500 via-orange-400 to-yellow-500',
      shine: true,
    };
  }
  if (score >= 80) {
    return {
      name: 'MASTER',
      emoji: '💎',
      gradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
      border: 'border-fuchsia-400',
      glow: 'shadow-[0_0_35px_rgba(217,70,239,0.7)] shadow-fuchsia-500/70',
      bgPattern: 'bg-gradient-to-br from-fuchsia-900/30 via-purple-900/20 to-pink-900/30',
      textColor: 'text-fuchsia-300',
      badgeGradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
      shine: true,
    };
  }
  if (score >= 70) {
    return {
      name: 'DIAMOND',
      emoji: '💠',
      gradient: 'from-cyan-500 via-blue-500 to-cyan-400',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_30px_rgba(34,211,238,0.6)] shadow-cyan-500/60',
      bgPattern: 'bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-cyan-800/30',
      textColor: 'text-cyan-300',
      badgeGradient: 'from-cyan-500 via-blue-400 to-cyan-500',
      shine: true,
    };
  }
  if (score >= 60) {
    return {
      name: 'PLATINUM',
      emoji: '⚡',
      gradient: 'from-slate-400 via-gray-300 to-slate-400',
      border: 'border-slate-400',
      glow: 'shadow-[0_0_25px_rgba(148,163,184,0.5)] shadow-slate-400/50',
      bgPattern: 'bg-gradient-to-br from-slate-800/30 via-gray-800/20 to-slate-800/30',
      textColor: 'text-slate-300',
      badgeGradient: 'from-slate-400 via-gray-300 to-slate-400',
      shine: false,
    };
  }
  if (score >= 50) {
    return {
      name: 'GOLD',
      emoji: '🌟',
      gradient: 'from-amber-500 via-yellow-500 to-amber-400',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)] shadow-amber-500/40',
      bgPattern: 'bg-gradient-to-br from-amber-900/25 via-yellow-900/15 to-amber-900/25',
      textColor: 'text-amber-400',
      badgeGradient: 'from-amber-500 via-yellow-400 to-amber-500',
      shine: false,
    };
  }
  return {
    name: 'DEGEN',
    emoji: '🎮',
    gradient: 'from-emerald-500 via-green-500 to-emerald-400',
    border: 'border-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-emerald-500/30',
    bgPattern: 'bg-gradient-to-br from-emerald-900/20 via-green-900/15 to-emerald-900/20',
    textColor: 'text-emerald-400',
    badgeGradient: 'from-emerald-500 via-green-500 to-emerald-500',
    shine: false,
  };
};

const getLevelPhrase = (level: number): string => {
  if (level >= 50) return "🔥 Absolute Gigachad";
  if (level >= 40) return "💪 Degen Overlord";
  if (level >= 30) return "🚀 Moon Mission Commander";
  if (level >= 20) return "💎 Diamond Handed Legend";
  if (level >= 15) return "⚡ Certified Degen";
  if (level >= 10) return "🎯 Getting There";
  if (level >= 5) return "🐣 Baby Degen";
  return "😅 Just Started";
};

const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  index: number;
  handleLike: (cardId: string) => Promise<void>;
  userLikes: { [key: string]: boolean };
}

const LeaderboardCard = ({ entry, index, handleLike, userLikes }: LeaderboardCardProps) => {
  const tier = getTierConfig(entry.degenScore);
  const isTop3 = index < 3;
  const levelPhrase = getLevelPhrase(entry.level);
  
  const getFOMOPhrase = (score: number): string => {
    if (score >= 95) return "🔥 GOD MODE - They Bow to You";
    if (score >= 90) return "👑 APEX PREDATOR - Pure Domination";
    if (score >= 85) return "💎 GENERATIONAL WEALTH - GG EZ";
    if (score >= 80) return "⚡ MAIN CHARACTER - Eating Good";
    if (score >= 75) return "🚀 MOON MISSION - Keep Stacking";
    if (score >= 70) return "🔥 KILLING IT - Above Average Chad";
    if (score >= 65) return "💪 SOLID - You'll Make It Anon";
    if (score >= 60) return "📈 MID CURVE - Touch Grass King";
    if (score >= 55) return "🎯 SLIGHTLY MID - Do Better";
    if (score >= 50) return "😬 NGMI VIBES - Yikes";
    if (score >= 40) return "📉 EXIT LIQUIDITY - That's You";
    if (score >= 30) return "💀 ABSOLUTELY COOKED - RIP";
    if (score >= 20) return "🤡 CIRCUS CLOWN - Everyone's Laughing";
    if (score >= 10) return "⚰️ DELETE APP - Uninstall Now";
    return "🪦 QUIT FOREVER - It's Over Bro";
  };

  const fomoPhrase = getFOMOPhrase(entry.degenScore);

  return (
    <div className="flex flex-col">
      <div
        className={`relative rounded-3xl border-[6px] ${tier.border} ${tier.glow} hover:scale-[1.03] transition-all duration-500 overflow-hidden group`}
        style={{ aspectRatio: '2/3' }}
      >
        <div className={`absolute inset-0 ${tier.bgPattern}`}></div>

        {tier.shine && (
          <div className="absolute inset-0 shine-effect opacity-40 group-hover:opacity-60 transition-opacity"></div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-15 group-hover:opacity-20 transition-opacity`}></div>

        <div className="relative h-full flex flex-col p-6 bg-gray-900/90 backdrop-blur-md justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className={`text-3xl font-black ${tier.textColor} drop-shadow-lg`}>
              #{index + 1}
            </div>
            {isTop3 && (
              <div className="text-3xl drop-shadow-lg">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 mb-3">
            {entry.profileImage ? (
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/60 overflow-hidden bg-gray-800 shadow-xl">
                <img
                  src={entry.profileImage}
                  alt={entry.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/60 bg-gray-800 flex items-center justify-center shadow-xl">
                <span className="text-3xl">👤</span>
              </div>
            )}

            {entry.displayName && (
              <div className="text-white font-bold text-base text-center leading-tight">
                {entry.displayName}
              </div>
            )}

            <div className="text-xs text-gray-300 font-mono bg-black/40 px-3 py-1 rounded-full">
              {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-6)}
            </div>

            <div className="flex gap-2 text-xs flex-wrap justify-center min-h-[28px]">
              {entry.twitter && (
                <a
                  href={`https://twitter.com/${entry.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition bg-black/30 px-2 py-1 rounded"
                >
                  🐦 @{entry.twitter.slice(0, 10)}
                </a>
              )}
              {entry.telegram && (
                <a
                  href={`https://t.me/${entry.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition bg-black/30 px-2 py-1 rounded"
                >
                  ✈️ @{entry.telegram}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mb-3">
            <div className={`text-7xl font-black bg-gradient-to-br ${tier.gradient} bg-clip-text text-transparent drop-shadow-2xl mb-1`}>
              {entry.degenScore}
            </div>
            <div className="text-gray-300 text-xs uppercase tracking-wider font-bold mb-2">
              DEGEN SCORE
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/30 backdrop-blur-sm">
              <div className="text-yellow-300 font-bold text-[11px] text-center leading-tight">
                {fomoPhrase}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <div className={`px-5 py-2 rounded-full bg-gradient-to-r ${tier.badgeGradient} shadow-xl`}>
              <span className="text-white font-black text-xs flex items-center gap-2">
                {tier.emoji} {tier.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-black/50 rounded-xl p-2.5 border border-gray-600/50 shadow-lg backdrop-blur-sm">
              <div className="text-[9px] text-gray-400 uppercase mb-1 font-semibold">Trades</div>
              <div className="text-white font-bold text-sm">{formatNumber(entry.totalTrades, 0)}</div>
            </div>
            <div className="bg-black/50 rounded-xl p-2.5 border border-gray-600/50 shadow-lg backdrop-blur-sm">
              <div className="text-[9px] text-gray-400 uppercase mb-1 font-semibold">Win Rate</div>
              <div className="text-white font-bold text-sm">{entry.winRate.toFixed(0)}%</div>
            </div>
            <div className="bg-black/50 rounded-xl p-2.5 border border-gray-600/50 shadow-lg backdrop-blur-sm">
              <div className="text-[9px] text-gray-400 uppercase mb-1 font-semibold">Volume</div>
              <div className="text-white font-bold text-sm">{formatNumber(entry.totalVolume)} SOL</div>
            </div>
            <div className="bg-black/50 rounded-xl p-2.5 border border-gray-600/50 shadow-lg backdrop-blur-sm">
              <div className="text-[9px] text-gray-400 uppercase mb-1 font-semibold">P&L</div>
              <div className={`font-bold text-sm ${entry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {entry.profitLoss >= 0 ? '+' : ''}{formatNumber(entry.profitLoss)}
              </div>
            </div>
          </div>

          {/* Métricas de Categorías de Premios */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            <div className="bg-red-900/20 rounded-lg p-2 border border-red-500/30">
              <div className="text-[9px] text-red-300 uppercase mb-0.5 font-semibold text-center">❤️ Likes</div>
              <div className="text-white font-bold text-sm text-center">{entry.likes || 0}</div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
              <div className="text-[9px] text-blue-300 uppercase mb-0.5 font-semibold text-center">👥 Refs</div>
              <div className="text-white font-bold text-sm text-center">{entry.referralCount || 0}</div>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-2 border border-yellow-500/30">
              <div className="text-[9px] text-yellow-300 uppercase mb-0.5 font-semibold text-center">⭐ Pts</div>
              <div className="text-white font-bold text-sm text-center">{entry.badgePoints || 0}</div>
            </div>
          </div>

          {/* Badges desbloqueados con tooltips */}
          {entry.calculatedBadges && entry.calculatedBadges.length > 0 && (
            <div className="mb-3 bg-black/30 rounded-lg p-2.5 border border-yellow-500/20">
              <div className="text-[9px] text-yellow-300 uppercase mb-1.5 font-semibold text-center">
                🏆 Logros Desbloqueados ({entry.calculatedBadges.length})
              </div>
              <BadgesDisplay
                badges={entry.calculatedBadges}
                totalPoints={entry.badgePoints || 0}
                showPoints={false}
                maxDisplay={8}
              />
            </div>
          )}

          <div className="text-center space-y-1">
            <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${tier.gradient} opacity-90 shadow-lg`}>
              <span className="text-white font-bold text-xs">LVL {entry.level}</span>
            </div>
            <div className="text-[10px] text-gray-200 italic font-medium">
              {levelPhrase}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleLike(entry.id)}
        className={`mt-4 px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-3 font-bold text-base shadow-lg ${
          userLikes[entry.id]
            ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white scale-105'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
        }`}
      >
        <span className="text-2xl">{userLikes[entry.id] ? '❤️' : '🤍'}</span>
        <span>{entry.likes || 0}</span>
      </button>
    </div>
  );
};

interface LeaderboardTableProps {
  filteredLeaderboard: LeaderboardEntry[];
  handleLike: (cardId: string) => Promise<void>;
  userLikes: { [key: string]: boolean };
}

const LeaderboardTable = ({ filteredLeaderboard, handleLike, userLikes }: LeaderboardTableProps) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tier</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Score</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Trades</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Volume</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">P&L</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Win Rate</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Level</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Likes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredLeaderboard.map((entry, index) => {
              const tier = getTierConfig(entry.degenScore);
              const isTop3 = index < 3;
              const levelPhrase = getLevelPhrase(entry.level);

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
                    <div className="flex items-center gap-3">
                      {entry.profileImage ? (
                        <img
                          src={entry.profileImage}
                          alt={entry.displayName || 'Profile'}
                          className="w-10 h-10 rounded-full border-2 border-cyan-500/50 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 bg-gray-800 flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                      )}
                      <div>
                        {entry.displayName && (
                          <div className="text-white font-semibold text-sm">
                            {entry.displayName}
                          </div>
                        )}
                        <div className="text-xs font-mono text-gray-400">
                          {entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)}
                        </div>
                        <div className="flex gap-2 mt-0.5 text-[10px] min-h-[16px]">
                          {entry.twitter && (
                            <a
                              href={`https://twitter.com/${entry.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              🐦 @{entry.twitter.slice(0, 8)}
                            </a>
                          )}
                          {entry.telegram && (
                            <a
                              href={`https://t.me/${entry.telegram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              ✈️ @{entry.telegram}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tier.badgeGradient} text-white inline-flex items-center gap-1`}
                    >
                      {tier.emoji} {tier.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-xl font-bold ${tier.textColor}`}>{entry.degenScore}</div>
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
                    <div className="text-[10px] text-gray-400 italic">{levelPhrase}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleLike(entry.id)}
                      className={`px-3 py-1 rounded-lg transition-all inline-flex items-center gap-1 ${
                        userLikes[entry.id]
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <span>{userLikes[entry.id] ? '❤️' : '🤍'}</span>
                      <span className="font-bold text-sm">{entry.likes || 0}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('likes');
  const [searchWallet, setSearchWallet] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchLeaderboard();
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

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('likes')}
                    className={`px-4 py-2 rounded-lg transition ${
                      sortBy === 'likes' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    ❤️ Likes
                  </button>
                  <button
                    onClick={() => setSortBy('referralCount')}
                    className={`px-4 py-2 rounded-lg transition ${
                      sortBy === 'referralCount' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    👥 Referidos
                  </button>
                  <button
                    onClick={() => setSortBy('badgePoints')}
                    className={`px-4 py-2 rounded-lg transition ${
                      sortBy === 'badgePoints' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    ⭐ Logros
                  </button>
                </div>

                <div className="flex gap-2 md:border-l md:border-gray-700 md:pl-4">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-lg transition ${
                      viewMode === 'cards' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    🎴 Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-lg transition ${
                      viewMode === 'table' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    📊 Table
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search wallet/name..."
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredLeaderboard.map((entry, index) => (
                            <LeaderboardCard
                              key={entry.id}
                              entry={entry}
                              index={index}
                              handleLike={handleLike}
                              userLikes={userLikes}
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
              <RankingsWidget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Force Server-Side Rendering (no static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}
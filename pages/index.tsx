import React, { useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

const DegenCardLeaderboard = () => {
  const [leaderboardData] = useState([
    {
      rank: 1,
      score: 98,
      tier: 'Legend',
      username: '@CryptoGod_01',
      wallet: '@bit2.2097690869@',
      trading: 95,
      diamondH: 97,
      totalPNL: 97,
      rugs: '78.20M',
      rugsTrend: 'down',
      badges: ['🚀', '💰', '😎', '🔥'],
      bgGradient: 'linear-gradient(135deg, #1a0a0f 0%, #3d1a2e 20%, #6b2d4a 40%, #a94f3d 60%, #d4813f 80%, #f0b945 100%)',
      borderGlow: '#fbbf24',
      secondaryGlow: '#f59e0b',
      icon: '🌈',
      pattern: 'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)'
    },
    {
      rank: 2,
      score: 96,
      tier: 'Icon',
      username: '@SolanaWhaleHunter',
      wallet: '@bit@.2@592@@2@6996',
      trading: 95,
      diamondH: 94,
      totalPNL: 94,
      rugs: '+$6.30M',
      rugsTrend: 'up',
      badges: ['🚀', '💎', '😈', '😈'],
      bgGradient: 'linear-gradient(135deg, #0f0516 0%, #1e0b2e 20%, #3d1a5f 40%, #5d2a8f 60%, #7e3bbf 80%, #a855f7 100%)',
      borderGlow: '#a855f7',
      secondaryGlow: '#7e22ce',
      icon: '🐋',
      pattern: 'radial-gradient(circle at 30% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(126, 34, 206, 0.15) 0%, transparent 50%)'
    },
    {
      rank: 3,
      score: 94,
      tier: 'Diamond',
      username: '@Diamond_HODL',
      wallet: '@bit2.2@6@7@@5357@',
      trading: 98,
      diamondH: 92,
      totalPNL: 93,
      rugs: '+$20M',
      rugsTrend: 'up',
      badges: ['🚀', '💎', '🛡️', '🛡️'],
      bgGradient: 'linear-gradient(135deg, #051923 0%, #0a2f3f 20%, #0f4a5f 40%, #14657f 60%, #19809f 80%, #06b6d4 100%)',
      borderGlow: '#06b6d4',
      secondaryGlow: '#0891b2',
      icon: '💎',
      pattern: 'radial-gradient(circle at 25% 30%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(8, 145, 178, 0.15) 0%, transparent 50%)'
    }
  ]);

  const StatBar = ({ value, color }: { value: number; color: string }) => (
    <div className="relative w-full bg-black/60 rounded-full h-1.5 overflow-hidden backdrop-blur-sm border border-white/5">
      <div 
        className="relative h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}ee 50%, ${color}ff 100%)`,
          boxShadow: `0 0 10px ${color}80, inset 0 1px 0 rgba(255,255,255,0.3)`
        }}
      />
    </div>
  );

  const FifaCard = ({ card }: { card: any }) => (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${card.borderGlow}40 0%, transparent 70%)`
        }}
      />
      
      <div 
        className="relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]"
        style={{
          background: card.bgGradient,
          border: `2px solid ${card.borderGlow}`,
          boxShadow: `0 0 30px ${card.borderGlow}60, 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`
        }}
      >
        <div 
          className="absolute inset-0 opacity-40"
          style={{ background: card.pattern }}
        />

        <div className="absolute -top-3 -left-3 z-20">
          <div 
            className="relative w-11 h-11 rounded-full flex items-center justify-center font-black text-white shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              border: '3px solid #fff',
              boxShadow: '0 0 20px #fbbf2480, 0 4px 10px rgba(0,0,0,0.5)'
            }}
          >
            <span className="text-sm drop-shadow-lg">#{card.rank}</span>
          </div>
        </div>

        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-300 text-xl">⭐</span>
              <span 
                className="text-white font-black text-2xl tracking-tight"
                style={{ textShadow: `0 0 10px ${card.borderGlow}80, 0 2px 4px rgba(0,0,0,0.8)` }}
              >
                {card.score}
              </span>
            </div>
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
                border: `1px solid ${card.borderGlow}40`,
                boxShadow: `0 0 15px ${card.borderGlow}30`
              }}
            >
              <span className="text-sm">{card.tier === 'Legend' ? '👑' : card.tier === 'Icon' ? '💜' : '💎'}</span>
              <span className="text-white font-bold text-sm">{card.tier}</span>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div 
              className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
                border: `3px solid ${card.borderGlow}`,
                boxShadow: `0 0 30px ${card.borderGlow}`
              }}
            >
              <span>{card.icon}</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-white font-black text-lg mb-1">{card.username}</h3>
            <p className="text-gray-300 text-xs">{card.wallet}</p>
          </div>

          <div className="space-y-2.5 mb-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-200 font-semibold">📈 Trading</span>
                <span className="text-white font-black">{card.trading}</span>
              </div>
              <StatBar value={card.trading} color="#10b981" />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-200 font-semibold">💎 Diamond H</span>
                <span className="text-white font-black">{card.diamondH}</span>
              </div>
              <StatBar value={card.diamondH} color="#06b6d4" />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-200 font-semibold">Total P&L:</span>
                <span className="text-white font-black">{card.totalPNL}</span>
              </div>
              <StatBar value={card.totalPNL} color="#a855f7" />
            </div>
          </div>

          <div className="text-center mb-3 py-2 px-3 rounded-lg bg-black/20">
            <p className="text-gray-200 text-xs">
              Rugs Survived: <span className={card.rugsTrend === 'up' ? 'text-green-400 font-black' : 'text-red-400 font-black'}>{card.rugs}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 text-xl">
            {card.badges.map((badge: string, i: number) => (
              <span key={i}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Trophy className="w-14 h-14 text-yellow-500" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
            DegenCard Leaderboard Global
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-400" />
        </div>
        <p className="text-gray-300 text-xl mb-8">
          NFT Holders Only! • The most elite Solana traders
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leaderboardData.map((card, index) => (
          <FifaCard key={index} card={card} />
        ))}
      </div>
    </div>
  );
};

export default DegenCardLeaderboard;

import { useState, useEffect } from 'react';

interface MilestoneData {
  totalPremiumCards: number;
  milestoneTarget: number;
  progress: number;
  percentage: number;
  isCompleted: boolean;
  currentLeader: {
    walletAddress: string;
    displayName: string | null;
    likesCount: number;
    degenScore: number;
  } | null;
  prizeAmount: number;
}

export default function WeeklyChallengeBanner() {
  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestone();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMilestone, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMilestone = async () => {
    try {
      const response = await fetch('/api/milestone-challenge');
      if (response.ok) {
        const data = await response.json();
        setMilestoneData(data);
      }
    } catch (error) {
      console.error('Error fetching milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !milestoneData) {
    return null;
  }

  const { totalPremiumCards, milestoneTarget, percentage, currentLeader, prizeAmount, isCompleted } = milestoneData;

  const cardsRemaining = milestoneTarget - totalPremiumCards;
  const isUrgent = cardsRemaining > 0 && cardsRemaining <= 10;
  const isCritical = cardsRemaining > 0 && cardsRemaining <= 5;

  return (
    <div className="mb-6 sm:mb-8 relative px-2 sm:px-0">
      <div className={`bg-gradient-to-r ${isCritical ? 'from-red-500/30 via-orange-500/30 to-yellow-500/30 border-red-500/70' : isUrgent ? 'from-orange-500/25 via-yellow-500/25 to-red-500/25 border-orange-500/60' : 'from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-500/50'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_40px_rgba(251,191,36,0.3)] relative overflow-hidden`}>
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/10 to-red-500/5 ${isCritical ? 'animate-pulse' : ''}`}></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl animate-bounce">❤️</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
                  Most Loved Card Challenge
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  {isCompleted ? 'Milestone reached! Winner decided' : `Get the most likes to win when we reach ${milestoneTarget} premium cards`}
                </p>
                {!isCompleted && cardsRemaining > 0 && (
                  <p className={`text-xs sm:text-sm font-bold mt-1 ${isCritical ? 'text-red-400 animate-pulse' : isUrgent ? 'text-orange-400' : 'text-yellow-400'}`}>
                    ⏰ Only {cardsRemaining} {cardsRemaining === 1 ? 'card' : 'cards'} left!
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-yellow-400 font-bold text-xs sm:text-sm mb-1">PRIZE</div>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                {prizeAmount} SOL
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-xs sm:text-sm font-medium">
                Progress: {totalPremiumCards} / {milestoneTarget} cards
              </span>
              <span className="text-yellow-400 text-xs sm:text-sm font-bold">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-3 sm:h-4 border border-yellow-500/30 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {currentLeader && (
            <div className="bg-black/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-yellow-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-gray-400 text-xs mb-1">🔥 Current Leader</div>
                  <div className="text-white font-bold text-base sm:text-lg">
                    {currentLeader.displayName || 'Anonymous Degen'}
                  </div>
                  <div className="text-gray-500 text-xs font-mono">
                    {currentLeader.walletAddress.slice(0, 6)}...{currentLeader.walletAddress.slice(-4)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-yellow-400 font-black text-xl sm:text-2xl">
                    ❤️ {currentLeader.likesCount} likes
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Score: {currentLeader.degenScore}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-center">Premium users only • Updated every 5 minutes • {isCompleted ? 'Winner takes 1 SOL' : 'Winner announced at 100 cards'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

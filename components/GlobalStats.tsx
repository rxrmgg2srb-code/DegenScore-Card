import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { logger } from '@/lib/logger';

interface GlobalStatsProps {
  className?: string;
}

export function GlobalStats({ className = '' }: GlobalStatsProps) {
  const [stats, setStats] = useState({
    totalCards: 0,
    cardsToday: 0,
    totalPremiumCards: 0,
    totalVolume: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch REAL stats from API - NO FAKE DATA EVER
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success && data.stats) {
          // Use ONLY real data from database
          // If stats are 0, that's OK - we show 0 (better than lying)
          setStats({
            totalCards: data.stats.totalCards || 0,
            cardsToday: data.stats.cardsToday || 0,
            totalPremiumCards: data.stats.totalPremiumCards || 0,
            totalVolume: data.stats.totalVolume || 0,
          });
        }
      } catch (error) {
        logger.error('Error fetching stats', error instanceof Error ? error : undefined, {
          error: String(error),
        });
        // If error, show 0 (honest, not fake)
        setStats({
          totalCards: 0,
          cardsToday: 0,
          totalPremiumCards: 0,
          totalVolume: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 60 seconds with real data
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* Total Cards */}
      <div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <div className="relative">
          <div className="text-purple-400 text-sm font-medium mb-1">📊 Total Cards</div>
          <div className="text-3xl font-bold text-white">
            <CountUp end={stats.totalCards} duration={2} separator="," />
          </div>
          <div className="text-xs text-gray-400 mt-1">all time</div>
        </div>
      </div>

      {/* Cards Today */}
      <div className="group relative bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <div className="relative">
          <div className="text-orange-400 text-sm font-medium mb-1">⚡ Today</div>
          <div className="text-3xl font-bold text-white">
            <CountUp end={stats.cardsToday} duration={1.5} />
          </div>
          <div className="text-xs text-gray-400 mt-1">cards created</div>
        </div>
      </div>

      {/* Premium Cards */}
      <div className="group relative bg-gradient-to-br from-yellow-500/10 to-amber-500/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <div className="relative">
          <div className="text-yellow-400 text-sm font-medium mb-1">💎 Premium</div>
          <div className="text-3xl font-bold text-white">
            <CountUp end={stats.totalPremiumCards} duration={2} separator="," />
          </div>
          <div className="text-xs text-gray-400 mt-1">paid cards</div>
        </div>
      </div>

      {/* Volume Tracked */}
      <div className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/50 transition-all hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <div className="relative">
          <div className="text-cyan-400 text-sm font-medium mb-1">💰 Volume</div>
          <div className="text-3xl font-bold text-white">
            <CountUp
              end={stats.totalVolume}
              duration={2}
              separator=","
              decimals={stats.totalVolume < 1 ? 2 : 0}
              suffix=" SOL"
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">total revenue</div>
        </div>
      </div>
    </div>
  );
}

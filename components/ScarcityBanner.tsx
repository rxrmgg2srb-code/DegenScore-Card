import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScarcityData {
  spotsRemaining: number;
  currentPrice: number;
  nextPrice: number;
  usersUntilPriceIncrease: number;
  showScarcityBanner: boolean;
}

export const ScarcityBanner = () => {
  const [data, setData] = useState<ScarcityData | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchScarcityData();
    const interval = setInterval(fetchScarcityData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchScarcityData = async () => {
    try {
      const res = await fetch('/api/spots-remaining');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch scarcity data:', error);
    }
  };

  if (!data || !data.showScarcityBanner || !isVisible) {
    return null;
  }

  const urgencyLevel =
    data.spotsRemaining < 20 ? 'critical' :
    data.spotsRemaining < 50 ? 'high' :
    'medium';

  const bgColor =
    urgencyLevel === 'critical' ? 'bg-red-600' :
    urgencyLevel === 'high' ? 'bg-orange-600' :
    'bg-yellow-600';

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={`${bgColor} text-white sticky top-0 z-50 shadow-lg`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">⚠️</span>
            <div>
              <p className="font-bold text-sm md:text-base">
                {urgencyLevel === 'critical' && '🔥 ALMOST SOLD OUT! '}
                Only {data.spotsRemaining} Premium Slots Remaining
              </p>
              <p className="text-xs md:text-sm opacity-90">
                {data.usersUntilPriceIncrease > 0 ? (
                  <>
                    Price increases from {data.currentPrice} SOL → {data.nextPrice} SOL in {data.usersUntilPriceIncrease} users
                  </>
                ) : (
                  <>Current price: {data.currentPrice} SOL</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Scroll to upgrade section or open modal
                const upgradeBtn = document.querySelector('[data-upgrade-button]');
                if (upgradeBtn) {
                  upgradeBtn.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
            >
              Secure My Spot →
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close banner"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, (500 - data.spotsRemaining) / 5)}%` }}
            className="bg-white h-full rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

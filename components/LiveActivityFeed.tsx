import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  type: 'card_created' | 'premium_upgrade' | 'high_score';
  walletAddress: string;
  displayName: string | null;
  degenScore: number;
  timestamp: Date;
  icon: string;
  message: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch real activities from API
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/live-activity');
        if (response.ok) {
          const data = await response.json();
          if (data.activities && data.activities.length > 0) {
            setActivities(data.activities);
          }
        }
      } catch (error) {
        console.error('Error fetching live activities:', error);
      }
    };

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Rotate through activities
    if (activities.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(activities.length, 5));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activities.length]);

  const currentActivity = activities[currentIndex];

  if (!currentActivity) return null;

  const getActivityColor = (activity: Activity) => {
    if (activity.degenScore >= 90) return 'text-purple-400';
    if (activity.degenScore >= 80) return 'text-orange-400';
    if (activity.type === 'premium_upgrade') return 'text-pink-400';
    return 'text-cyan-400';
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/95 backdrop-blur-md rounded-lg px-4 py-3 border border-gray-700/50 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentActivity.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5 text-sm">
                <span className={`${getActivityColor(currentActivity)} font-medium truncate`}>
                  {currentActivity.message}
                </span>
                <span className="font-mono text-gray-500 text-xs truncate">
                  {currentActivity.walletAddress.slice(0, 6)}...{currentActivity.walletAddress.slice(-4)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-cyan-400 font-bold text-sm">
                {currentActivity.degenScore}/100
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Activity count indicator */}
      <div className="mt-2 text-center">
        <div className="inline-flex gap-1">
          {activities.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all ${
                i === currentIndex ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

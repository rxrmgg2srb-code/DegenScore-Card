import { useState, useEffect } from 'react';

/**
 * FOMO Bar - Creates urgency and social proof
 * Shows limited spots, live activity, and countdown
 */
export function FOMOBar() {
    const [spotsRemaining, setSpotsRemaining] = useState(23);
    const [analyzedToday, setAnalyzedToday] = useState(147);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Calculate time until midnight UTC (reset)
        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 1,
                0, 0, 0, 0
            ));
            const diff = tomorrow.getTime() - now.getTime();

            setTimeLeft({
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        // Simulate live activity
        const activityInterval = setInterval(() => {
            setAnalyzedToday(prev => prev + Math.floor(Math.random() * 3));
            // Occasionally decrease spots to create urgency
            if (Math.random() > 0.7 && spotsRemaining > 5) {
                setSpotsRemaining(prev => Math.max(5, prev - 1));
            }
        }, 8000);

        return () => {
            clearInterval(interval);
            clearInterval(activityInterval);
        };
    }, [spotsRemaining]);

    if (!mounted) return null;

    return (
        <div className="w-full bg-gradient-to-r from-purple-900/80 via-black/80 to-purple-900/80 backdrop-blur-sm border-b border-purple-500/30">
            <div className="max-w-6xl mx-auto px-4 py-2">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm">

                    {/* Spots Remaining - SCARCITY */}
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-gray-300">
                            Only <span className="text-red-400 font-bold">{spotsRemaining}</span> premium spots left today
                        </span>
                    </div>

                    {/* Divider */}
                    <span className="hidden sm:block text-gray-600">|</span>

                    {/* Live Activity - SOCIAL PROOF */}
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">🔥</span>
                        <span className="text-gray-300">
                            <span className="text-green-400 font-bold">{analyzedToday}</span> degens analyzed today
                        </span>
                    </div>

                    {/* Divider */}
                    <span className="hidden sm:block text-gray-600">|</span>

                    {/* Countdown - URGENCY */}
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⏰</span>
                        <span className="text-gray-300">
                            Resets in{' '}
                            <span className="text-yellow-400 font-mono font-bold">
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Live Activity Indicator - Shows real-time activity
 */
export function LiveActivityPulse() {
    const [recentWallets, setRecentWallets] = useState([
        { wallet: '7xKp...3mNq', score: 847, time: '2m ago' },
        { wallet: '9dQr...5vXw', score: 623, time: '5m ago' },
        { wallet: '3kLm...8pYz', score: 912, time: '8m ago' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate new analysis
            const newWallet = {
                wallet: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
                score: Math.floor(Math.random() * 500) + 400,
                time: 'just now',
            };

            setRecentWallets(prev => [newWallet, ...prev.slice(0, 2)]);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-white">Live Activity</span>
            </div>

            <div className="space-y-2">
                {recentWallets.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between text-xs py-1 ${index === 0 ? 'animate-pulse' : ''
                            }`}
                    >
                        <span className="text-gray-400 font-mono">{item.wallet}</span>
                        <span className={`font-bold ${item.score >= 800 ? 'text-yellow-400' :
                            item.score >= 600 ? 'text-purple-400' :
                                'text-blue-400'
                            }`}>
                            {item.score} pts
                        </span>
                        <span className="text-gray-500">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Urgency Banner - For special promotions
 */
export function UrgencyBanner({ message }: { message: string }) {
    return (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 px-4 text-center animate-pulse">
            <span className="font-bold">🔥 {message}</span>
        </div>
    );
}

export default FOMOBar;

import { useState, useEffect } from 'react';

interface HotTrade {
  id: string;
  degen: string;
  degenScore: number;
  type: 'buy' | 'sell';
  solAmount: string;
  tokenSymbol: string;
  timeAgo: string;
}

interface HotFeedData {
  tier: string;
  delay: string;
  trades: HotTrade[];
  upgradeAvailable: boolean;
}

export default function HotFeedWidget({ walletAddress }: { walletAddress?: string }) {
  const [feedData, setFeedData] = useState<HotFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    fetchHotFeed();
    const interval = setInterval(fetchHotFeed, 30000); // Refresh cada 30s
    return () => clearInterval(interval);
  }, [walletAddress]);

  const fetchHotFeed = async () => {
    try {
      const url = walletAddress 
        ? `/api/hot-feed?walletAddress=${walletAddress}`
        : '/api/hot-feed';
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFeedData(data);
      }
    } catch (error) {
      console.error('Error fetching hot feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!feedData) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            🔥 Hot Wallet Feed
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {feedData.tier} • {feedData.delay} delay
          </p>
        </div>
        
        {feedData.upgradeAvailable && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            ⚡ Upgrade
          </button>
        )}
      </div>

      {/* TRADES LIST */}
      <div className="space-y-3">
        {feedData.trades.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No recent trades from top degens
          </div>
        ) : (
          feedData.trades.map(trade => (
            <div
              key={trade.id}
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/50 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">{trade.degen}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      trade.degenScore >= 80 ? 'bg-yellow-500/20 text-yellow-300' :
                      trade.degenScore >= 60 ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {trade.degenScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${
                      trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.type === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-white font-mono">
                      {trade.solAmount} SOL
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-cyan-400">{trade.tokenSymbol}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {trade.timeAgo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <UpgradeModalHotFeed 
          onClose={() => setShowUpgrade(false)}
          currentTier={feedData.tier}
        />
      )}
    </div>
  );
}

function UpgradeModalHotFeed({ onClose, currentTier }: { onClose: () => void; currentTier: string }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full p-8 border-2 border-orange-500">
        <h2 className="text-3xl font-bold text-white mb-6">⚡ Upgrade Hot Feed Access</h2>
        
        <div className="grid gap-4 mb-6">
          {/* FREE TIER */}
          <div className={`p-4 rounded-xl border-2 ${
            currentTier === 'FREE' ? 'border-gray-500 bg-gray-700/50' : 'border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-300">FREE</h3>
              <span className="text-2xl font-black text-gray-300">$0</span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 24h delayed trades</li>
              <li>• Top 5 trades only</li>
              <li>• Hidden amounts</li>
            </ul>
          </div>

          {/* BASIC TIER */}
          <div className={`p-4 rounded-xl border-2 ${
            currentTier === 'BASIC' ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-cyan-400">BASIC</h3>
              <span className="text-2xl font-black text-cyan-400">0.1 SOL</span>
            </div>
            <ul className="text-sm text-white space-y-1">
              <li>• 6h delayed trades</li>
              <li>• Top 10 trades</li>
              <li>• Full amounts visible</li>
            </ul>
          </div>

          {/* PRO TIER */}
          <div className={`p-4 rounded-xl border-2 ${
            currentTier === 'PRO' ? 'border-orange-500 bg-orange-500/10' : 'border-orange-600'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-orange-400">PRO</h3>
              <span className="text-2xl font-black text-orange-400">0.5 SOL/month</span>
            </div>
            <ul className="text-sm text-white space-y-1">
              <li>• Real-time trades</li>
              <li>• Top 20 trades</li>
              <li>• Full token addresses</li>
              <li>• Telegram alerts</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

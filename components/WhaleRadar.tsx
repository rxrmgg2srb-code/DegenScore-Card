import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { generateSessionToken } from '../lib/walletAuth';
import toast from 'react-hot-toast';
import { logger } from '../lib/logger';

interface WhaleWallet {
  id: string;
  walletAddress: string;
  nickname: string | null;
  totalVolume: number;
  winRate: number;
  avgPositionSize: number;
  followersCount: number;
  totalProfit: number;
  topTokens: string[];
  lastActive: string;
  followedAt?: string;
  notificationsEnabled?: boolean;
}

interface WhaleAlert {
  id: string;
  alertType: string;
  tokenSymbol: string;
  action: 'buy' | 'sell';
  amountSOL: number;
  timestamp: string;
  whaleWallet: {
    walletAddress: string;
    nickname: string | null;
  };
}

export default function WhaleRadar() {
  const { publicKey, signMessage } = useWallet();
  const [activeTab, setActiveTab] = useState<'top' | 'following' | 'alerts'>('top');
  const [topWhales, setTopWhales] = useState<WhaleWallet[]>([]);
  const [followedWhales, setFollowedWhales] = useState<WhaleWallet[]>([]);
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey && signMessage) {
      generateToken();
    } else {
      // Fetch top whales without auth
      fetchTopWhales();
    }
  }, [publicKey, signMessage]);

  useEffect(() => {
    if (sessionToken) {
      fetchFollowedWhales();
      fetchAlerts();
    }
  }, [sessionToken]);

  const generateToken = async () => {
    if (!publicKey || !signMessage) return;

    try {
      const token = await generateSessionToken(publicKey, signMessage);
      setSessionToken(token);
    } catch (error) {
      logger.error('Failed to generate session token:', error);
    }
  };

  const fetchTopWhales = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/whales/top?limit=20');

      if (!response.ok) {
        throw new Error('Failed to fetch whales');
      }

      const data = await response.json();
      setTopWhales(data.whales || []);
    } catch (error: any) {
      logger.error('Error fetching top whales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedWhales = async () => {
    if (!sessionToken) return;

    try {
      const response = await fetch('/api/whales/follow', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch followed whales');
      }

      const data = await response.json();
      setFollowedWhales(data.whales || []);
    } catch (error: any) {
      logger.error('Error fetching followed whales:', error);
    }
  };

  const fetchAlerts = async () => {
    if (!sessionToken) return;

    try {
      const response = await fetch('/api/whales/alerts', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error: any) {
      logger.error('Error fetching alerts:', error);
    }
  };

  const handleFollow = async (whaleWalletId: string) => {
    if (!sessionToken) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const response = await fetch('/api/whales/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ whaleWalletId }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow whale');
      }

      toast.success('🐋 Whale followed! You\'ll get alerts for their trades');
      fetchFollowedWhales();
      fetchTopWhales();
    } catch (error: any) {
      logger.error('Error following whale:', error);
      toast.error('Failed to follow whale');
    }
  };

  const handleUnfollow = async (whaleWalletId: string) => {
    if (!sessionToken) return;

    try {
      const response = await fetch('/api/whales/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ whaleWalletId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow whale');
      }

      toast.success('Whale unfollowed');
      fetchFollowedWhales();
      fetchTopWhales();
    } catch (error: any) {
      logger.error('Error unfollowing whale:', error);
      toast.error('Failed to unfollow whale');
    }
  };

  const isFollowing = (whaleId: string) => {
    return followedWhales.some(w => w.id === whaleId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getAlertTypeEmoji = (type: string) => {
    switch (type) {
      case 'large_buy': return '💰';
      case 'large_sell': return '💸';
      case 'new_position': return '🎯';
      case 'position_close': return '🔒';
      case 'whale_detected': return '🐋';
      default: return '📊';
    }
  };

  const WhaleCard = ({ whale }: { whale: WhaleWallet }) => {
    const following = isFollowing(whale.id);

    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🐋</span>
              <h4 className="font-bold text-white">
                {whale.nickname || formatAddress(whale.walletAddress)}
              </h4>
            </div>
            <p className="text-xs text-gray-500">{formatAddress(whale.walletAddress)}</p>
          </div>
          <button
            onClick={() => following ? handleUnfollow(whale.id) : handleFollow(whale.id)}
            disabled={!sessionToken}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              following
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${!sessionToken ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {following ? 'Following' : '+ Follow'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Volume</div>
            <div className="text-sm font-bold text-green-400">
              ${whale.totalVolume.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Win Rate</div>
            <div className="text-sm font-bold text-blue-400">
              {whale.winRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Avg Position</div>
            <div className="text-sm font-bold text-purple-400">
              ${whale.avgPositionSize.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Profit</div>
            <div className={`text-sm font-bold ${whale.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${whale.totalProfit.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{whale.followersCount} followers</span>
          </div>
          <div>Active {formatTime(whale.lastActive)}</div>
        </div>

        {whale.topTokens && whale.topTokens.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Top tokens:</div>
            <div className="flex flex-wrap gap-1">
              {whale.topTokens.slice(0, 3).map((token, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && topWhales.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-blue-500/30 animate-pulse">
        <div className="h-96 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🐋</span>
            <span>Whale Tracking Radar</span>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Follow top traders and get real-time alerts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('top')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'top'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🏆 Top Whales
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'following'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          💙 Following ({followedWhales.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'alerts'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔔 Alerts ({alerts.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Top Whales Tab */}
        {activeTab === 'top' && (
          <>
            {topWhales.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🐋</div>
                <p className="text-lg">No whales detected yet</p>
                <p className="text-sm mt-2">
                  Whales are traders with high volume and win rate
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topWhales.map(whale => (
                  <WhaleCard key={whale.id} whale={whale} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <>
            {!publicKey ? (
              <div className="text-center bg-blue-900/20 border border-blue-500/30 rounded-lg p-8">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-gray-400">Connect your wallet to follow whales</p>
              </div>
            ) : followedWhales.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">👀</div>
                <p className="text-lg">Not following any whales yet</p>
                <p className="text-sm mt-2">
                  Go to Top Whales tab to find traders to follow
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followedWhales.map(whale => (
                  <WhaleCard key={whale.id} whale={whale} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
            {!publicKey ? (
              <div className="text-center bg-blue-900/20 border border-blue-500/30 rounded-lg p-8">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-gray-400">Connect your wallet to see alerts</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🔕</div>
                <p className="text-lg">No alerts yet</p>
                <p className="text-sm mt-2">
                  Follow whales to get notified of their trades
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`bg-gray-900/50 rounded-lg p-4 border transition ${
                      alert.action === 'buy'
                        ? 'border-green-500/30 bg-green-900/10'
                        : 'border-red-500/30 bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getAlertTypeEmoji(alert.alertType)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">
                              {alert.whaleWallet.nickname || formatAddress(alert.whaleWallet.walletAddress)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {alert.action === 'buy' ? 'bought' : 'sold'}
                            </span>
                            <span className="font-bold text-blue-400">
                              {alert.tokenSymbol}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {alert.amountSOL.toFixed(2)} SOL • {formatTime(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          alert.action === 'buy'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {alert.action.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Footer */}
      {!publicKey && (
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          Connect your wallet to follow whales and get real-time alerts
        </div>
      )}
    </div>
  );
}

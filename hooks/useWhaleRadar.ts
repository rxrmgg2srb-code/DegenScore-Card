import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { generateSessionToken } from '@/lib/walletAuth';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

export interface WhaleWallet {
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

export interface WhaleAlert {
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

/**
 * Custom hook for whale wallet tracking and alerts
 *
 * Enables users to discover, follow, and get notified about top traders:
 * - Top whales leaderboard (volume, win rate, profit)
 * - Follow/unfollow whale wallets
 * - Real-time trade alerts
 * - Notification management
 * - Wallet-authenticated sessions
 *
 * @returns {Object} Whale radar state and methods
 * @returns {'top' | 'following' | 'alerts'} activeTab - Current view tab
 * @returns {Function} setActiveTab - Switch between tabs
 * @returns {WhaleWallet[]} topWhales - Top traders list
 * @returns {WhaleWallet[]} followedWhales - User's followed whales
 * @returns {WhaleAlert[]} alerts - Recent whale trade alerts
 * @returns {boolean} loading - Data loading state
 * @returns {Function} handleFollow - Follow/unfollow whale
 * @returns {Function} toggleNotifications - Enable/disable alerts
 *
 * @example
 * const {
 *   activeTab,
 *   topWhales,
 *   followedWhales,
 *   handleFollow,
 *   loading
 * } = useWhaleRadar();
 *
 * // Follow a whale
 * await handleFollow(whaleAddress);
 */
export function useWhaleRadar() {
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
            const token = generateSessionToken(publicKey.toString());
            setSessionToken(token);
        } catch (error: any) {
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

    return {
        activeTab,
        setActiveTab,
        topWhales,
        followedWhales,
        alerts,
        loading,
        sessionToken,
        handleFollow,
        handleUnfollow,
        isFollowing,
    };
}

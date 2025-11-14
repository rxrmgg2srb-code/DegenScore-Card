import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitch from '../components/LanguageSwitch';

interface CardData {
  walletAddress: string;
  degenScore: number;
  tier: string;
  totalTrades: number;
  winRate: number;
  totalVolume: number;
  biggestWin: number;
  isPaid: boolean;
  displayName?: string;
}

export default function Compare() {
  const { t } = useLanguage();
  const [wallet1, setWallet1] = useState('');
  const [wallet2, setWallet2] = useState('');
  const [card1, setCard1] = useState<CardData | null>(null);
  const [card2, setCard2] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!wallet1 || !wallet2) {
      setError('Please enter both wallet addresses');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch both cards
      const [response1, response2] = await Promise.all([
        fetch(`/api/analyze?walletAddress=${wallet1}`),
        fetch(`/api/analyze?walletAddress=${wallet2}`)
      ]);

      if (!response1.ok || !response2.ok) {
        throw new Error('Failed to fetch card data');
      }

      const data1 = await response1.json();
      const data2 = await response2.json();

      setCard1(data1);
      setCard2(data2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare cards');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      'Plankton': '#94a3b8',
      'Fish': '#60a5fa',
      'Dolphin': '#34d399',
      'Shark': '#fbbf24',
      'Whale': '#f472b6'
    };
    return colors[tier] || '#94a3b8';
  };

  const StatComparison = ({ label, value1, value2, format = (v: any) => v }: any) => {
    const winner = value1 > value2 ? 1 : value1 < value2 ? 2 : 0;

    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-700">
        <div className={`text-right ${winner === 1 ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
          {format(value1)}
        </div>
        <div className="text-center text-gray-300 font-medium">
          {label}
        </div>
        <div className={`text-left ${winner === 2 ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
          {format(value2)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text-gold">
              {t('compareTitle')}
            </h1>
            <p className="text-gray-400 mt-2">{t('compareDescription')}</p>
          </div>
          <div className="flex gap-3">
            <LanguageSwitch />
            <Link href="/">
              <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition">
                ← {t('title')}
              </button>
            </Link>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('enterWallet1')}
              </label>
              <input
                type="text"
                value={wallet1}
                onChange={(e) => setWallet1(e.target.value)}
                placeholder="Wallet Address 1"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('enterWallet2')}
              </label>
              <input
                type="text"
                value={wallet2}
                onChange={(e) => setWallet2(e.target.value)}
                placeholder="Wallet Address 2"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : t('compare')}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {card1 && card2 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            {/* Headers */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: getTierColor(card1.tier) }}>
                  {card1.tier}
                </div>
                <div className="text-sm text-gray-400 break-all">
                  {card1.displayName || `${card1.walletAddress.slice(0, 4)}...${card1.walletAddress.slice(-4)}`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">VS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: getTierColor(card2.tier) }}>
                  {card2.tier}
                </div>
                <div className="text-sm text-gray-400 break-all">
                  {card2.displayName || `${card2.walletAddress.slice(0, 4)}...${card2.walletAddress.slice(-4)}`}
                </div>
              </div>
            </div>

            {/* Stats Comparison */}
            <div className="mt-6">
              <StatComparison
                label="DegenScore"
                value1={card1.degenScore}
                value2={card2.degenScore}
              />
              <StatComparison
                label="Total Trades"
                value1={card1.totalTrades}
                value2={card2.totalTrades}
              />
              <StatComparison
                label="Win Rate"
                value1={card1.winRate}
                value2={card2.winRate}
                format={(v: number) => `${v.toFixed(1)}%`}
              />
              <StatComparison
                label="Total Volume"
                value1={card1.totalVolume}
                value2={card2.totalVolume}
                format={(v: number) => `${v.toFixed(2)} SOL`}
              />
              <StatComparison
                label="Biggest Win"
                value1={card1.biggestWin}
                value2={card2.biggestWin}
                format={(v: number) => `${v.toFixed(2)} SOL`}
              />
            </div>

            {/* Winner */}
            <div className="mt-8 text-center">
              <div className="text-xl font-bold text-gray-300 mb-2">Winner</div>
              <div className="text-3xl font-bold gradient-text-gold">
                {card1.degenScore > card2.degenScore
                  ? card1.displayName || `${card1.walletAddress.slice(0, 8)}...`
                  : card2.degenScore > card1.degenScore
                  ? card2.displayName || `${card2.walletAddress.slice(0, 8)}...`
                  : 'Tie!'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

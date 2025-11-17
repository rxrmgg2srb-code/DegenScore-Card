import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ComparisonSkeleton } from '../components/LoadingSkeletons';
import toast from 'react-hot-toast';

interface CardData {
  walletAddress: string;
  displayName: string | null;
  degenScore: number;
  tier: string;
  isPaid: boolean;
  createdAt: string;
}

export default function ComparePage() {
  const [wallet1, setWallet1] = useState('');
  const [wallet2, setWallet2] = useState('');
  const [card1, setCard1] = useState<CardData | null>(null);
  const [card2, setCard2] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTier = (score: number) => {
    if (score >= 86) return { name: 'Whale', emoji: '🐋', color: 'text-pink-400' };
    if (score >= 71) return { name: 'Shark', emoji: '🦈', color: 'text-yellow-400' };
    if (score >= 51) return { name: 'Dolphin', emoji: '🐬', color: 'text-green-400' };
    if (score >= 31) return { name: 'Fish', emoji: '🐟', color: 'text-blue-400' };
    return { name: 'Plankton', emoji: '🦐', color: 'text-gray-400' };
  };

  const fetchCard = async (wallet: string): Promise<CardData | null> => {
    try {
      const response = await fetch(`/api/card?wallet=${wallet}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.card || null;
    } catch (error) {
      return null;
    }
  };

  const handleCompare = async () => {
    if (!wallet1 || !wallet2) {
      toast.error('Please enter both wallet addresses');
      return;
    }

    if (wallet1 === wallet2) {
      toast.error('Please enter different wallet addresses');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [data1, data2] = await Promise.all([
        fetchCard(wallet1),
        fetchCard(wallet2),
      ]);

      if (!data1 && !data2) {
        setError('Both wallet addresses not found');
      } else if (!data1) {
        setError('First wallet address not found');
      } else if (!data2) {
        setError('Second wallet address not found');
      } else {
        setCard1(data1);
        setCard2(data2);
      }
    } catch (err) {
      setError('Failed to fetch cards');
      toast.error('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const getScoreDifference = () => {
    if (!card1 || !card2) return null;
    return card1.degenScore - card2.degenScore;
  };

  const getWinner = (): 1 | 2 | null => {
    const diff = getScoreDifference();
    if (diff === null || diff === 0) return null;
    return diff > 0 ? 1 : 2;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="neon-streak"></div>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <Link href="/">
            <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text-gold mb-2">
            ⚔️ Compare Cards
          </h1>
          <p className="text-gray-300 text-lg">
            Compare two DegenScore cards side by side
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  First Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet1}
                  onChange={(e) => setWallet1(e.target.value)}
                  placeholder="Enter wallet address..."
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Second Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet2}
                  onChange={(e) => setWallet2(e.target.value)}
                  placeholder="Enter wallet address..."
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? 'Loading...' : 'Compare Cards ⚔️'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {loading && <ComparisonSkeleton />}

          {!loading && card1 && card2 && (
            <AnimatePresence>
              <div className="space-y-6">
                {/* Winner Banner */}
                {getWinner() && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-2xl p-6 text-center"
                  >
                    <div className="text-5xl mb-3">👑</div>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                      Winner: {getWinner() === 1 ? (card1.displayName || 'Player 1') : (card2.displayName || 'Player 2')}
                    </h2>
                    <p className="text-gray-300">
                      {Math.abs(getScoreDifference() || 0)} points difference
                    </p>
                  </motion.div>
                )}

                {/* Comparison Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Card 1 */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl border-2 p-6 ${
                      getWinner() === 1 ? 'border-yellow-500' : 'border-gray-700'
                    }`}
                  >
                    <CardComparison card={card1} isWinner={getWinner() === 1} />
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl border-2 p-6 ${
                      getWinner() === 2 ? 'border-yellow-500' : 'border-gray-700'
                    }`}
                  >
                    <CardComparison card={card2} isWinner={getWinner() === 2} />
                  </motion.div>
                </div>

                {/* Stats Comparison */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    📊 Detailed Comparison
                  </h3>
                  <div className="space-y-4">
                    <ComparisonRow
                      label="DegenScore"
                      value1={card1.degenScore}
                      value2={card2.degenScore}
                      higher="better"
                    />
                    <ComparisonRow
                      label="Tier"
                      value1={getTier(card1.degenScore).name}
                      value2={getTier(card2.degenScore).name}
                    />
                    <ComparisonRow
                      label="Premium Status"
                      value1={card1.isPaid ? 'Premium 💎' : 'Free'}
                      value2={card2.isPaid ? 'Premium 💎' : 'Free'}
                    />
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function CardComparison({ card, isWinner }: { card: CardData; isWinner: boolean }) {
  const tier = getTier(card.degenScore);

  return (
    <div className="space-y-4">
      {/* Winner Badge */}
      {isWinner && (
        <div className="flex justify-center">
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-full px-4 py-2">
            <span className="text-yellow-400 font-bold">👑 Winner</span>
          </div>
        </div>
      )}

      {/* Display Name */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-1">
          {card.displayName || 'Anon Degen'}
        </h3>
        <p className="text-gray-400 font-mono text-sm">
          {card.walletAddress.slice(0, 6)}...{card.walletAddress.slice(-4)}
        </p>
      </div>

      {/* Score */}
      <div className="text-center bg-gray-900/50 rounded-xl p-6">
        <div className="text-gray-400 text-sm mb-2">DegenScore</div>
        <div className={`text-6xl font-bold ${tier.color}`}>
          {card.degenScore}
        </div>
        <div className="text-gray-500 text-sm mt-2">/ 100</div>
      </div>

      {/* Tier */}
      <div className="text-center bg-gray-900/50 rounded-xl p-4">
        <div className={`text-4xl mb-2`}>{tier.emoji}</div>
        <div className={`text-xl font-bold ${tier.color}`}>{tier.name}</div>
      </div>

      {/* Premium Badge */}
      {card.isPaid && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500 rounded-lg px-4 py-2">
            <span>💎</span>
            <span className="text-purple-400 font-bold">Premium</span>
          </div>
        </div>
      )}

      {/* View Card Link */}
      <Link href={`/card/${card.walletAddress}`}>
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition">
          View Full Card →
        </button>
      </Link>
    </div>
  );
}

function ComparisonRow({
  label,
  value1,
  value2,
  higher,
}: {
  label: string;
  value1: any;
  value2: any;
  higher?: 'better' | 'worse';
}) {
  const isNumber = typeof value1 === 'number' && typeof value2 === 'number';
  const winner = isNumber
    ? value1 > value2
      ? 1
      : value1 < value2
      ? 2
      : null
    : null;

  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div
        className={`text-center p-3 rounded-lg ${
          winner === 1 && higher === 'better'
            ? 'bg-green-500/20 border border-green-500'
            : 'bg-gray-700/50'
        }`}
      >
        <div className="text-white font-bold">{value1}</div>
      </div>

      <div className="text-center text-gray-400 font-medium">{label}</div>

      <div
        className={`text-center p-3 rounded-lg ${
          winner === 2 && higher === 'better'
            ? 'bg-green-500/20 border border-green-500'
            : 'bg-gray-700/50'
        }`}
      >
        <div className="text-white font-bold">{value2}</div>
      </div>
    </div>
  );
}

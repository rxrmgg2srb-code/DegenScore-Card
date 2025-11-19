import DegenCard from '../components/DegenCard';
import { NavigationButtons } from '../components/NavigationButtons';
import Link from 'next/link';

/**
 * Landing Page - Conversion Optimized
 * Focus: Drive card generation + premium upgrades
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Logo/Title */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text-gold">
              DegenScore
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your Solana Trading Card</p>
          </div>

          {/* Navigation Buttons */}
          <NavigationButtons />
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Transform Your Wallet Into a{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Legendary Trading Card
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Analyze your Solana trading history in seconds. Get your real stats, tier ranking, and share your flex on Twitter.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Real On-Chain Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Powered by Helius</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Free Forever</span>
            </div>
          </div>
        </div>

        {/* Card Generator */}
        <DegenCard />

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Real Analytics</h3>
            <p className="text-gray-400 text-sm">
              Track P&L, win rate, volume, and all your trading stats from actual blockchain data
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Tier Rankings</h3>
            <p className="text-gray-400 text-sm">
              Bronze to Legendary. Climb the ranks and compete on the global leaderboard
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-bold text-white mb-2">Share & Flex</h3>
            <p className="text-gray-400 text-sm">
              Download your card and flex your trading prowess on Twitter, Telegram, or Discord
            </p>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/50 rounded-xl p-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Want the Premium Experience?
            </h3>
            <p className="text-gray-300 mb-6">
              Upgrade to remove watermarks, get HD quality, custom profile, and exclusive referral rewards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/leaderboard">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition shadow-lg hover:shadow-purple-500/50">
                  View Leaderboard
                </button>
              </Link>
              <span className="text-gray-400 text-sm">
                Premium: <span className="text-white font-bold">1 SOL</span> (~$140)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pb-8 text-center text-gray-400 text-sm relative z-10">
        <p>Powered by Helius RPC × Solana</p>
        <p className="mt-2">Built for degens, by degens 🚀</p>
      </div>
    </div>
  );
}

// Force Server-Side Rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

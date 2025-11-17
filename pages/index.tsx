import DegenCard from '../components/DegenCard';
import Link from 'next/link';
import dynamic from 'next/dynamic';

/**
 * TESTING VERSION - Adding components one by one
 * Test 1: GlobalStats
 */

// GlobalStats - TEST 1
const GlobalStats = dynamic(() => import('../components/GlobalStats').then(mod => ({ default: mod.GlobalStats })).catch(() => {
  console.error('❌ Failed to load GlobalStats');
  return { default: () => <div className="h-32 bg-red-500/20 rounded-lg p-4 text-red-400 text-center">GlobalStats failed to load</div> };
}), {
  loading: () => <div className="h-32 bg-gray-800/30 animate-pulse rounded-lg" />,
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Logo/Title */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text-gold">
              DegenScore
            </h1>
            <p className="text-gray-400 text-sm mt-1">Track your trading mastery</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
            <Link href="/leaderboard">
              <button className="btn-premium px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-purple-500/50">
                🏆 Leaderboard
              </button>
            </Link>
          </div>
        </div>

        {/* TEST 1: GlobalStats */}
        <GlobalStats className="mb-8" />
      </div>

      {/* Card Generator ONLY */}
      <div className="container mx-auto px-4 pb-8">
        <DegenCard />
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Powered by Helius RPC × Solana</p>
        <p className="mt-2">🧪 TEST 1: GlobalStats active</p>
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

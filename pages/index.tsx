import DegenCard from '../components/DegenCard';
import Link from 'next/link';

/**
 * ULTRA MINIMAL VERSION - Solo lo esencial
 * Sin componentes dinámicos que puedan causar problemas
 */
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
            <Link href="/super-token-scorer">
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg font-bold transition hover:scale-105 shadow-lg hover:shadow-yellow-500/50">
                🚀 Super Scorer
              </button>
            </Link>
            <Link href="/token-scanner">
              <button className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition">
                🔒 Token Scanner
              </button>
            </Link>
            <Link href="/compare">
              <button className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                ⚔️ Compare
              </button>
            </Link>
            <Link href="/documentation">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
                📚 Docs
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="btn-premium px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-purple-500/50">
                🏆 Leaderboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Card Generator ONLY */}
      <div className="container mx-auto px-4 pb-8">
        <DegenCard />
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Powered by Helius RPC × Solana</p>
        <p className="mt-2">✅ Stable version - All fixes applied</p>
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

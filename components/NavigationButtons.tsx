import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Reusable navigation component for all pages
 * Shows all main application buttons consistently across the app
 * ALL TEXT IN ENGLISH
 */
export function NavigationButtons() {
  const router = useRouter();

  // Helper to determine if we're on a route
  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Link href="/">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/') ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
        >
          🏠 Home
        </button>
      </Link>

      <Link href="/compare">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/compare')
            ? 'bg-blue-600 text-white'
            : 'bg-blue-700 hover:bg-blue-600 text-white'
            }`}
        >
          ⚔️ Compare
        </button>
      </Link>

      <Link href="/challenges">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/challenges')
            ? 'bg-orange-600 text-white'
            : 'bg-orange-700 hover:bg-orange-600 text-white'
            }`}
        >
          🎯 Challenges
        </button>
      </Link>

      <Link href="/documentation">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/documentation')
            ? 'bg-gray-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
        >
          📚 Docs
        </button>
      </Link>

      <Link href="/whale-radar">
        <button
          className={`px-6 py-3 rounded-lg font-bold transition hover:scale-105 shadow-lg ${isActive('/whale-radar')
            ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-blue-500/50'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-blue-500/50'
            }`}
        >
          🐋 Whale Radar
        </button>
      </Link>

      <Link href="/leaderboard">
        <button
          className={`px-6 py-3 rounded-lg font-bold transition hover:scale-105 shadow-lg ${isActive('/leaderboard')
            ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-purple-500/50'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/50'
            }`}
        >
          🏆 Leaderboard
        </button>
      </Link>
    </div>
  );
}

export default NavigationButtons;

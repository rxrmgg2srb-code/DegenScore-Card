import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Componente de navegación reutilizable para todas las páginas
 * Muestra todos los botones principales de la aplicación
 */
export function NavigationButtons() {
  const router = useRouter();

  // Helper para determinar si estamos en una ruta
  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Link href="/">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isActive('/')
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          🏠 Home
        </button>
      </Link>

      {/* Temporalmente oculto - no usar de momento
      <Link href="/super-token-scorer">
        <button
          className={`px-4 py-2 rounded-lg font-bold transition hover:scale-105 shadow-lg ${
            isActive('/super-token-scorer')
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50'
              : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white hover:shadow-yellow-500/50'
          }`}
        >
          🚀 Super Scorer
        </button>
      </Link>

      <Link href="/token-scanner">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isActive('/token-scanner')
              ? 'bg-green-600 text-white'
              : 'bg-green-700 hover:bg-green-600 text-white'
          }`}
        >
          🔒 Token Scanner
        </button>
      </Link>
      */}

      <Link href="/compare">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isActive('/compare')
              ? 'bg-blue-600 text-white'
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}
        >
          ⚔️ Compare
        </button>
      </Link>

      <Link href="/documentation">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isActive('/documentation')
              ? 'bg-gray-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          📚 Docs
        </button>
      </Link>

      <Link href="/leaderboard">
        <button
          className={`px-6 py-3 rounded-lg font-bold transition hover:scale-105 shadow-lg ${
            isActive('/leaderboard')
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

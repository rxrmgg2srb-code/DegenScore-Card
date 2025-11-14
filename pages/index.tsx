import DegenCard from '../components/DegenCard';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header con botón de leaderboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <Link href="/leaderboard">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-purple-500/50">
              🏆 View Leaderboard
            </button>
          </Link>
        </div>
      </div>

      {/* Componente principal */}
      <DegenCard />
    </div>
  );
}

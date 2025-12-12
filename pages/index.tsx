import DegenCard from '../components/DegenCard';
import Header from '../components/Header';

/**
 * ULTRA MINIMAL VERSION - Only essentials
 * Uses consistent Header with all navigation buttons
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Consistent Header with Navigation */}
      <Header />

      {/* Card Generator */}
      <div className="container mx-auto px-4 py-8">
        <DegenCard />
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm pb-8">
        <p>Powered by Helius RPC × Solana</p>
        <p className="mt-2">✅ Stable version - All fixes applied</p>
      </div>
    </div>
  );
}

// Force SSR to prevent build timeout
export async function getServerSideProps() {
  return {
    props: {},
  };
}

import DegenCard from '../components/DegenCard';
import { NavigationButtons } from '../components/NavigationButtons';
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
          <NavigationButtons />
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

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { NavigationButtons } from './NavigationButtons';

// 🔒 Admin wallet with spy mode access
const ADMIN_WALLET = 'B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1';

interface HeaderProps {
  connected?: boolean;
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({ connected = false, username = '' }) => {
  const { publicKey } = useWallet();

  // Check if connected wallet is admin
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET;

  return (
    <header className="bg-black/50 backdrop-blur-lg sticky top-0 z-40 border-b border-purple-500/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DegenScore
              </div>
            </Link>
            <span className="text-gray-400 text-sm hidden sm:block">Track your trading mastery</span>
          </div>

          {/* Navigation - ALL BUTTONS */}
          <div className="hidden md:block">
            <NavigationButtons />
          </div>

          {/* Right side: Admin link + Wallet */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/spy-mode"
                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-semibold animate-pulse"
              >
                🕵️ Spy Mode
              </Link>
            )}
            {connected ? (
              <div className="text-white font-medium">{username}</div>
            ) : (
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex flex-wrap items-center gap-2 mt-4 justify-center">
          <Link
            href="/"
            className="text-sm px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            🏠 Home
          </Link>
          <Link
            href="/compare"
            className="text-sm px-3 py-1 rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition"
          >
            ⚔️ Compare
          </Link>
          <Link
            href="/challenges"
            className="text-sm px-3 py-1 rounded-lg bg-orange-700 text-white hover:bg-orange-600 transition"
          >
            🎯 Challenges
          </Link>
          <Link
            href="/whale-radar"
            className="text-sm px-3 py-1 rounded-lg bg-cyan-700 text-white hover:bg-cyan-600 transition font-semibold"
          >
            🐋 Whales
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm px-3 py-1 rounded-lg bg-purple-700 text-white hover:bg-purple-600 transition font-semibold"
          >
            🏆 Leaderboard
          </Link>
          <Link
            href="/documentation"
            className="text-sm px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            📚 Docs
          </Link>
          {isAdmin && (
            <Link
              href="/spy-mode"
              className="text-sm px-3 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition font-semibold"
            >
              🕵️ Spy
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

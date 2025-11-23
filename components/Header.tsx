import { useTranslation } from 'react-i18next';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LanguageSelector } from './LanguageSelector';
import Link from 'next/link';

interface HeaderProps {
  connected?: boolean;
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({ connected = false, username = '' }) => {
  const { t } = useTranslation();
  return (
    <header className="bg-black/50 backdrop-blur-lg sticky top-0 z-40 border-b border-purple-500/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DegenScore
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              {t('nav.leaderboard')}
            </Link>
            <Link href="/token-scanner" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              🔒 Token Scanner
            </Link>
            <Link href="/super-token-scorer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              🚀 Super Scorer
            </Link>
            <Link href="/documentation" className="text-gray-300 hover:text-white transition-colors">
              {t('nav.documentation')}
            </Link>
          </nav>

          {/* Right side: Language selector + Wallet */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {connected ? (
              <div className="text-white font-medium">{username}</div>
            ) : (
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto">
          <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap">
            {t('nav.home')}
          </Link>
          <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap">
            {t('nav.leaderboard')}
          </Link>
          <Link href="/token-scanner" className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap">
            🔒 Scanner
          </Link>
          <Link href="/super-token-scorer" className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap">
            🚀 Super
          </Link>
          <Link href="/documentation" className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap">
            {t('nav.documentation')}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

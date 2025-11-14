import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LanguageSelector } from './LanguageSelector';
import Link from 'next/link';

export const Header = () => {
  const { t } = useTranslation();
  const { connected } = useWallet();

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
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              {t('nav.leaderboard')}
            </Link>
            <Link
              href="/documentation"
              className="text-gray-300 hover:text-white transition-colors"
            >
              {t('nav.documentation')}
            </Link>
          </nav>

          {/* Right side: Language selector + Wallet */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Wallet Button */}
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-4">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {t('nav.leaderboard')}
          </Link>
          <Link
            href="/documentation"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            {t('nav.documentation')}
          </Link>
        </nav>
      </div>
    </header>
  );
};

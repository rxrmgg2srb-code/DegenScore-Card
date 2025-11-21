import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';
import { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletError } from '@solana/wallet-adapter-base';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { WalletConnectionHandler } from '../components/WalletConnectionHandler';
import { UmamiAnalytics } from '../components/UmamiAnalytics';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

export default function App({ Component, pageProps }: AppProps) {
  // Configure RPC endpoint
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    []
  );

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Enhanced error handling for wallet
  const onError = (error: WalletError) => {
    console.error('🔴 Wallet error:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Log additional context
    if (typeof window !== 'undefined') {
      console.log('Window.solana:', window.solana);
      console.log('Is Phantom installed?', window.solana?.isPhantom);
    }
  };

  // Initialize i18n on client side
  useEffect(() => {
    // i18n is already initialized in lib/i18n.ts
    // This just ensures it's loaded before rendering
    console.log('🔌 RPC Endpoint:', endpoint);
  }, [endpoint]);

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={false} onError={onError}>
            <WalletModalProvider>
              <WalletConnectionHandler />
              <UmamiAnalytics />
              <Component {...pageProps} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';
import { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ErrorBoundary } from '../components/ErrorBoundary';
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

  // Initialize i18n on client side
  useEffect(() => {
    // i18n is already initialized in lib/i18n.ts
    // This just ensures it's loaded before rendering
  }, []);

  // Handle wallet connection errors
  const onError = useMemo(
    () => (error: any) => {
      console.error('Wallet error:', error);

      // Silently handle common wallet connection errors that are safe to ignore
      const ignorableErrors = [
        'disconnected port',
        'WalletConnectionError',
        'Unexpected error',
        'User rejected',
        'wallet is not available'
      ];

      const shouldIgnore = ignorableErrors.some(msg =>
        error?.message?.includes(msg) || error?.toString()?.includes(msg)
      );

      if (shouldIgnore) {
        console.warn('Wallet connection issue (safe to ignore):', error?.message || error);
        return;
      }

      // Only show critical errors to user
      console.error('Critical wallet error:', error);
    },
    []
  );

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider
            wallets={wallets}
            autoConnect={true}
            onError={onError}
          >
            <WalletModalProvider>
              <Component {...pageProps} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

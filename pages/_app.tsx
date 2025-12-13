import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// Phantom y Solflare se auto-detectan como Standard Wallets (no necesitan adapters)
import { ErrorBoundary } from '../components/ErrorBoundary';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import Analytics from '../components/Analytics';

import WalletTracker from '../components/WalletTracker';
import MetaHead from '../components/MetaHead';

export default function App({ Component, pageProps }: AppProps) {
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(false);

  // Configure RPC endpoint
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    []
  );

  // Configure supported wallets - dejamos vacío para usar Standard Wallet auto-detection
  const wallets = useMemo(() => [], []);

  // Safe auto-connect: only enable after checking if wallet is available
  useEffect(() => {
    // Check if there was a previously connected wallet
    const wasConnected = typeof window !== 'undefined' &&
      localStorage.getItem('walletName');

    if (wasConnected) {
      // Give wallet extension time to load, then enable auto-connect
      const timer = setTimeout(() => {
        setAutoConnectEnabled(true);
      }, 500);

      // Timeout: if still "connecting" after 3 seconds, disable auto-connect
      const fallbackTimer = setTimeout(() => {
        setAutoConnectEnabled(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
    // No cleanup needed if not connected
    return undefined;
  }, []);

  // Handle wallet connection errors
  const onError = useCallback((error: any) => {
    // Log detallado para debugging
    console.error('Wallet error:', error);

    // Silently handle common wallet connection errors that are safe to ignore
    const ignorableErrors = [
      'disconnected port',
      'WalletConnectionError',
      'Unexpected error',
      'User rejected',
      'wallet is not available',
      'WalletNotReadyError',
      'WalletNotSelectedError',
      'WalletTimeoutError',
      'failed to connect',
    ];

    const shouldIgnore = ignorableErrors.some(
      (msg) =>
        error?.message?.toLowerCase()?.includes(msg.toLowerCase()) ||
        error?.toString()?.toLowerCase()?.includes(msg.toLowerCase()) ||
        error?.name?.includes(msg)
    );

    if (shouldIgnore) {
      console.warn('Wallet connection issue (safe to ignore):', error?.message || error);
      // Disable auto-connect on error to prevent infinite loops
      setAutoConnectEnabled(false);
      return;
    }

    // Only show critical errors to user
    console.error('Critical wallet error:', error);
  }, []);

  return (
    <ErrorBoundary>
      <MetaHead />
      <Analytics />
      <I18nextProvider i18n={i18n}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider
            wallets={wallets}
            autoConnect={autoConnectEnabled}
            onError={onError}
          >
            <WalletModalProvider>
              <WalletTracker />
              <Component {...pageProps} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

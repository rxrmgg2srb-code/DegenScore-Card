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
  // Configure RPC endpoint con validación robusta
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

    // Validar que la URL sea válida (no vacía y que empiece con http)
    if (rpcUrl && rpcUrl.trim() && (rpcUrl.startsWith('http://') || rpcUrl.startsWith('https://'))) {
      console.log('✅ Using configured RPC:', rpcUrl);
      return rpcUrl;
    }

    // Fallback a RPC público alternativo (más confiable que api.mainnet-beta.solana.com)
    // Ankr tiene mejores rate limits y no bloquea con 403
    const fallbackUrl = 'https://rpc.ankr.com/solana';
    console.warn('⚠️ NEXT_PUBLIC_HELIUS_RPC_URL not configured, using Ankr fallback:', fallbackUrl);
    return fallbackUrl;
  }, []);

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

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={false}>
            <WalletModalProvider>
              <Component {...pageProps} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
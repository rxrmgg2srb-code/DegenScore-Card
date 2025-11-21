import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app';
import { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// 🛑 IMPORTACIÓN MANUAL ELIMINADA:
// Ya no necesitamos importar PhantomWalletAdapter o SolflareWalletAdapter,
// ya que el paquete @solana/wallet-adapter-wallets los detecta automáticamente.
// import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'; 
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
  // Dejamos la lista vacía o solo con wallets que NO son detectadas
  // automáticamente (ej. Ledger, Torus). Phantom y Solflare funcionarán
  // porque se detectan automáticamente. Esto elimina el conflicto.
  const wallets = useMemo(
    () => [
      // Se eliminó: new PhantomWalletAdapter(),
      // Se eliminó: new SolflareWalletAdapter(),
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
      // Silently handle disconnected port errors from Phantom
      if (error?.message?.includes('disconnected port')) {
        console.warn('Phantom wallet port disconnected - this is usually safe to ignore');
        return;
      }
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

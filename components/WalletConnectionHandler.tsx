import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Component to handle wallet connection states and provide debugging info
 */
export function WalletConnectionHandler() {
  const { wallet, connecting, connected, publicKey } = useWallet();

  useEffect(() => {
    // Log wallet detection
    if (typeof window !== 'undefined') {
      console.log('🔍 Wallet Detection:');
      console.log('  - window.solana exists:', !!window.solana);
      console.log('  - Is Phantom:', window.solana?.isPhantom);
      console.log('  - Current wallet:', wallet?.adapter.name);
      console.log('  - Connecting:', connecting);
      console.log('  - Connected:', connected);
      console.log('  - PublicKey:', publicKey?.toString());
    }
  }, [wallet, connecting, connected, publicKey]);

  useEffect(() => {
    // Check if Phantom is installed
    if (typeof window !== 'undefined' && !window.solana) {
      console.warn('⚠️ Phantom wallet not detected. Please install from https://phantom.app/');
    }
  }, []);

  // This component doesn't render anything
  return null;
}

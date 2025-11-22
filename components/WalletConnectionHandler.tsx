import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { logger } from '@/lib/logger';

/**
 * Component to handle wallet connection states and provide debugging info
 * Prevents multiple simultaneous connection requests
 */
export function WalletConnectionHandler() {
  const { wallet, connecting, connected, publicKey } = useWallet();
  const connectingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple connection attempts
    if (connecting && !connectingRef.current) {
      connectingRef.current = true;
      logger.debug('Connection attempt started');
    } else if (!connecting && connectingRef.current) {
      connectingRef.current = false;
      if (connected) {
        logger.debug('Connection successful');
      } else {
        logger.debug('Connection failed or cancelled');
      }
    }
  }, [connecting, connected]);

  useEffect(() => {
    // Log wallet detection
    if (typeof window !== 'undefined') {
      logger.debug('Wallet Detection', {
        hasSolana: !!window.solana,
        isPhantom: window.solana?.isPhantom,
        walletName: wallet?.adapter.name,
        connecting,
        connected,
        publicKey: publicKey?.toString(),
      });

      // Warn if multiple connection attempts detected
      if (connecting && connectingRef.current) {
        logger.warn('Multiple connection attempts detected', {
          message: 'This may cause "Connection declined" error. Close all tabs and try again.'
        });
      }
    }
  }, [wallet, connecting, connected, publicKey]);

  useEffect(() => {
    // Check if Phantom is installed
    if (typeof window !== 'undefined' && !window.solana) {
      logger.warn('Phantom wallet not detected', {
        message: 'Please install from https://phantom.app/'
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectingRef.current = false;
    };
  }, []);

  // This component doesn't render anything
  return null;
}

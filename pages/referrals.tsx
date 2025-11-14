import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import ReferralSystem from '../components/ReferralSystem';

export default function ReferralsPage() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toBase58());
    } else {
      setWalletAddress('');
    }
  }, [connected, publicKey]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="neon-streak"></div>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          {/* Back button */}
          <Link href="/">
            <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg font-medium transition flex items-center gap-2">
              ← Back to Home
            </button>
          </Link>

          {/* Wallet Button */}
          <div className="wallet-button">
            <WalletMultiButton />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text-gold mb-2">
            🎁 Referral Program
          </h1>
          <p className="text-gray-300 text-lg">
            Invite friends and earn rewards together
          </p>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          {!connected ? (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-12 text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 mb-6">
                Connect your wallet to access your referral program and start earning rewards
              </p>
              <WalletMultiButton />
            </div>
          ) : (
            <ReferralSystem walletAddress={walletAddress} />
          )}
        </div>
      </div>
    </div>
  );
}

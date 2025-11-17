import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { logger } from '@/lib/logger';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PAYMENT_CONFIG } from '../lib/config';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onSkip: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, onSkip }: UpgradeModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Real stats from database
  const [stats, setStats] = useState({
    upgradesCount: 0,
    founderPercentage: 0,
    loading: true
  });

  useEffect(() => {
    // Fetch real stats from database
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            upgradesCount: data.upgradesCount,
            founderPercentage: data.founderPercentage,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePromoCode = async () => {
    if (!publicKey) {
      setPromoError('Please connect your wallet first');
      return;
    }

    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const response = await fetch('/api/apply-promo-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          promoCode: promoCode.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply promo code');
      }

      console.log('✅ Promo code applied successfully!');
      setPromoSuccess(data.message);

      // Wait a bit to show success message, then trigger upgrade
      setTimeout(() => {
        onUpgrade();
      }, 1500);

    } catch (error: any) {
      console.error('Promo code error:', error);
      setPromoError(error.message || 'Invalid promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePayment = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const connection = new Connection(
        PAYMENT_CONFIG.SOLANA_NETWORK,
        'confirmed'
      );

      // Crear transacción de pago
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PAYMENT_CONFIG.TREASURY_WALLET),
          lamports: PAYMENT_CONFIG.MINT_PRICE_SOL * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Enviar transacción
      const signature = await sendTransaction(transaction, connection);

      console.log('Transaction sent:', signature);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Payment confirmed!');

      // Save payment to database
      const paymentResponse = await fetch('/api/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          amount: PAYMENT_CONFIG.MINT_PRICE_SOL,
        }),
      });

      console.log('📤 Payment response status:', paymentResponse.status);
      const paymentData = await paymentResponse.json();
      console.log('📤 Payment response data:', paymentData);

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to record payment');
      }

      // ✅ Pago exitoso
      onUpgrade();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 max-w-lg w-full p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-6 md:mb-8">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 md:mb-4">🎨</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Customize & Join Leaderboard
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Unlock premium features and appear on the leaderboard
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">✅</div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">Custom Profile Photo</div>
                <div className="text-gray-400 text-xs sm:text-sm">Add your photo to the card</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">✅</div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">Social Links</div>
                <div className="text-gray-400 text-xs sm:text-sm">Display Twitter & Telegram</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">🏆</div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">Leaderboard Access</div>
                <div className="text-gray-400 text-xs sm:text-sm">Compete with other degens</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">⬇️</div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">Premium Download</div>
                <div className="text-gray-400 text-xs sm:text-sm">High-res card with all features</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-center border border-purple-500/30">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">One-time payment</div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {PAYMENT_CONFIG.MINT_PRICE_SOL} SOL
          </div>
          <div className="text-gray-400 text-xs mt-1">≈ ${(PAYMENT_CONFIG.MINT_PRICE_SOL * 200).toFixed(2)} USD</div>
        </div>

        {/* Real-time Stats (only show if data loaded and > 0) */}
        {!stats.loading && (stats.upgradesCount > 0 || stats.founderPercentage > 0) && (
          <div className="mb-4 space-y-3">
            {/* Social Proof - Recent Upgrades */}
            {stats.upgradesCount > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 text-xs sm:text-sm font-semibold">
                      {stats.upgradesCount} {stats.upgradesCount === 1 ? 'user' : 'users'} upgraded today
                    </span>
                  </div>
                  <span className="text-green-400 text-xs">🔥 LIVE</span>
                </div>
              </div>
            )}

            {/* Scarcity Indicator */}
            {stats.founderPercentage > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-xs sm:text-sm font-semibold">Limited Founder Slots</span>
                  <span className="text-orange-400 text-xs font-bold">{stats.founderPercentage}% CLAIMED</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.founderPercentage}%` }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Value Props */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-4">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>Instant access • No recurring fees • Lifetime features</span>
        </div>

        {/* Promo Code Section */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-xl sm:text-2xl">🎟️</span>
            <h3 className="text-yellow-400 font-bold text-base sm:text-lg">Have a Promo Code?</h3>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              disabled={isApplyingPromo || !!promoSuccess}
            />
            <button
              onClick={handlePromoCode}
              disabled={isApplyingPromo || !promoCode.trim() || !!promoSuccess}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm sm:text-base font-bold rounded-lg transition-all disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isApplyingPromo ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {promoError && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
              {promoError}
            </div>
          )}

          {promoSuccess && (
            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/50 rounded text-green-400 text-sm flex items-center gap-2">
              <span>✅</span>
              <span>{promoSuccess}</span>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-2">
            Get 100% free upgrade with valid promo code
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-500">or pay with SOL</span>
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{paymentError}</p>
          </div>
        )}

        {!publicKey ? (
          <div className="mb-3 sm:mb-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center mb-3">
              Connect your wallet to continue
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-lg !font-bold !py-2 sm:!py-3 !px-4 sm:!px-6 !text-sm sm:!text-base" />
            </div>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm sm:text-base font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed mb-3 sm:mb-4"
          >
            {isPaying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              `💳 Pay ${PAYMENT_CONFIG.MINT_PRICE_SOL} SOL & Customize`
            )}
          </button>
        )}

        <button
          onClick={onSkip}
          className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm sm:text-base font-semibold rounded-lg transition"
        >
          ⬇️ Download Basic (Free)
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          Premium cards appear on the leaderboard and support development
        </p>
      </div>
    </div>
  );
}
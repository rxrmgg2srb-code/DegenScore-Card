import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onSkip: () => void;
}

const PAYMENT_AMOUNT = 0.1;
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || 'Pf9yHR1qmkY9geMLfMJs7JD4yXZURkiaxm5h7K61J7N';

export default function UpgradeModal({ isOpen, onClose, onUpgrade, onSkip }: UpgradeModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );

      // Crear transacción de pago
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: PAYMENT_AMOUNT * LAMPORTS_PER_SOL,
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

      // 🔥 LOGS AGREGADOS AQUÍ
      console.log('💰 Sending payment to API:', {
        walletAddress: publicKey.toString(),
        signature,
        amount: PAYMENT_AMOUNT,
      });

      // Guardar el pago en la base de datos
      const paymentResponse = await fetch('/api/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          amount: PAYMENT_AMOUNT,
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Customize & Join Leaderboard
          </h2>
          <p className="text-gray-400">
            Unlock premium features and appear on the leaderboard
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-white font-semibold">Custom Profile Photo</div>
                <div className="text-gray-400 text-sm">Add your photo to the card</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-white font-semibold">Social Links</div>
                <div className="text-gray-400 text-sm">Display Twitter & Telegram</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-white font-semibold">Leaderboard Access</div>
                <div className="text-gray-400 text-sm">Compete with other degens</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-2xl">⬇️</div>
              <div>
                <div className="text-white font-semibold">Premium Download</div>
                <div className="text-gray-400 text-sm">High-res card with all features</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6 text-center border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-1">One-time payment</div>
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {PAYMENT_AMOUNT} SOL
          </div>
          <div className="text-gray-400 text-xs mt-1">≈ ${(PAYMENT_AMOUNT * 150).toFixed(2)} USD</div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{paymentError}</p>
          </div>
        )}

        {!publicKey ? (
          <div className="mb-4">
            <p className="text-gray-400 text-sm text-center mb-3">
              Connect your wallet to continue
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-lg !font-bold !py-3 !px-6" />
            </div>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed mb-4"
          >
            {isPaying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              '💳 Pay 0.1 SOL & Customize'
            )}
          </button>
        )}

        <button
          onClick={onSkip}
          className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition"
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
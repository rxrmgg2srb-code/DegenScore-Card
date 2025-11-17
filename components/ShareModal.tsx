import { useState } from 'react';

interface ShareModalProps {
import { logger } from '@/lib/logger';
  isOpen: boolean;
  walletAddress: string;
  degenScore: number;
  onShared: () => void;
  onSkip?: () => void;
}

export default function ShareModal({ isOpen, onShared, onSkip, walletAddress, degenScore }: ShareModalProps) {
  const [hasShared, setHasShared] = useState(false);

  if (!isOpen) return null;

  const getTierEmoji = (score: number) => {
    if (score >= 90) return '👑';
    if (score >= 80) return '💎';
    if (score >= 70) return '💠';
    if (score >= 60) return '⚡';
    if (score >= 50) return '🌟';
    return '🎮';
  };

  const getTierName = (score: number) => {
    if (score >= 90) return 'LEGENDARY';
    if (score >= 80) return 'MASTER';
    if (score >= 70) return 'DIAMOND';
    if (score >= 60) return 'PLATINUM';
    if (score >= 50) return 'GOLD';
    return 'DEGEN';
  };

  const generateTweet = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://degenscore.com');
    const cardUrl = `${baseUrl}/card/${walletAddress}`;
    const tierEmoji = getTierEmoji(degenScore);
    const tierName = getTierName(degenScore);

    const tweetText = `${tierEmoji} Just got my DegenScore: ${degenScore}/100 (${tierName})!

Check out my card: ${cardUrl}

Get your own at ${baseUrl}

#DegenScore #Solana #SolanaTrading`;

    return encodeURIComponent(tweetText);
  };

  const handleShareOnTwitter = () => {
    const tweetText = generateTweet();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    // Open Twitter in new window
    window.open(twitterUrl, '_blank', 'width=550,height=420');

    // Mark as shared after a delay (give time to tweet)
    setTimeout(() => {
      setHasShared(true);
    }, 2000);
  };

  const handleContinue = () => {
    if (hasShared) {
      onShared();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onSkip ? onSkip : undefined}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-md w-full p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button only if skip is available */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce">🚀</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Share Your Score!
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Unlock your premium card by sharing on Twitter
          </p>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-cyan-400 font-bold mb-2 text-sm sm:text-base">Why share?</div>
          <ul className="text-gray-300 text-xs sm:text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Unlock instant download</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Help others discover their score</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Enter weekly contest (3 SOL prize!)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Flex your degen status 😎</span>
            </li>
          </ul>
        </div>

        {/* Preview of tweet */}
        <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700">
          <div className="text-gray-400 text-xs mb-2">Preview:</div>
          <div className="text-white text-sm">
            {getTierEmoji(degenScore)} Just got my DegenScore: <span className="font-bold text-cyan-400">{degenScore}/100</span> ({getTierName(degenScore)})!
            <br /><br />
            Check your Solana trading score at...
            <br /><br />
            <span className="text-cyan-400">#DegenScore #Solana #SolanaTrading</span>
          </div>
        </div>

        <button
          onClick={handleShareOnTwitter}
          disabled={hasShared}
          className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-green-600 disabled:to-green-700 text-white text-sm sm:text-base font-bold rounded-lg transition-all shadow-lg hover:shadow-xl mb-3 relative overflow-hidden group"
        >
          {hasShared ? (
            <span className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>Shared! Click Continue Below</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Share on Twitter / X</span>
            </span>
          )}
        </button>

        {hasShared && (
          <button
            onClick={handleContinue}
            className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm sm:text-base font-bold rounded-lg transition-all animate-pulse"
          >
            ✓ Continue to Download
          </button>
        )}

        {!hasShared && onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs sm:text-sm transition"
          >
            Skip for now
          </button>
        )}

        <p className="text-gray-600 text-xs text-center mt-4">
          💡 Sharing increases your chances to win the 1 SOL prize at 100 cards!
        </p>
      </div>
    </div>
  );
}

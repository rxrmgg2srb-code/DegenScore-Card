import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ProfileFormModal, { ProfileData } from './ProfileFormModal';
import UpgradeModal from './UpgradeModal';
import ShareModal from './ShareModal';
import { Celebration } from './Celebration';
import { AchievementPopup, achievements, Achievement } from './AchievementPopup';
import { logger } from '@/lib/logger';

export default function DegenCard() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [promoCodeApplied, setPromoCodeApplied] = useState<string | null>(null);
  const [isFreeDownload, setIsFreeDownload] = useState(false); // Track if user is downloading free version

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Premium features
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'card-generated' | 'premium-unlock' | 'achievement' | 'rank-up' | 'legendary'>('card-generated');
  const [celebrationScore, setCelebrationScore] = useState<number | undefined>(undefined);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisMessage, setAnalysisMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateCard = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const addressToUse = publicKey.toBase58();
    setWalletAddress(addressToUse);
    setLoading(true);
    setAnalyzing(true);
    setError(null);
    setCardImage(null);
    setAnalysisProgress(0);

    try {
      setAnalysisMessage('🔍 Analyzing wallet...');
      setAnalysisProgress(10);

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addressToUse }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze wallet');
      }

      const data = await analyzeResponse.json();
      logger.info('✅ Analysis complete:', data);
      setAnalysisData(data);

      setAnalysisMessage('📊 Analysis complete!');
      setAnalysisProgress(50);

      setAnalysisMessage('💾 Saving to database...');
      setAnalysisProgress(60);

      const saveResponse = await fetch('/api/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: addressToUse,
          analysisData: data
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save card data');
      }

      const saveData = await saveResponse.json();
      logger.info('✅ Card saved:', saveData);
      
      setAnalysisMessage('✅ Saved!');
      setAnalysisProgress(80);

      setAnalysisMessage('🎨 Generating card image...');
      setAnalysisProgress(90);

      const imageResponse = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addressToUse }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || 'Failed to generate card');
      }

      const blob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(blob);
      setCardImage(imageUrl);

      setAnalysisMessage('🎉 Complete!');
      setAnalysisProgress(100);

      setTimeout(() => {
        setAnalyzing(false);

        // Trigger celebration based on score
        const score = data.degenScore || 0;
        setCelebrationScore(score);

        if (score >= 90) {
          setCelebrationType('legendary');
          setCurrentAchievement(achievements.legendary);
        } else if (score >= 80) {
          setCelebrationType('card-generated');
          setCurrentAchievement(achievements.highScore);
        } else {
          setCelebrationType('card-generated');
        }

        setShowCelebration(true);

        // Show first card achievement
        setTimeout(() => {
          setCurrentAchievement(achievements.firstCard);
        }, 2000);

        // Show upgrade modal
        setTimeout(() => {
          setShowUpgradeModal(true);
        }, 1000);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      logger.error('Error generating card', err instanceof Error ? err : undefined, {
        error: String(err),
      });
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    setHasPaid(true);

    // Trigger premium unlock celebration
    setCelebrationType('premium-unlock');
    setShowCelebration(true);
    setCurrentAchievement(achievements.premiumUnlock);

    // Go directly to profile modal (paid users don't need to share on Twitter)
    setTimeout(() => {
      setShowProfileModal(true);
    }, 1500);
  };

  const handleShared = () => {
    setShowShareModal(false);

    // If free download, just download the basic card
    if (isFreeDownload) {
      downloadBasicCard();
      setIsFreeDownload(false);
      return;
    }

    // If promo code user, continue to profile modal
    if (hasPromoCode) {
      setTimeout(() => {
        setShowProfileModal(true);
      }, 500);
    }
  };

  const handleSkipShare = () => {
    setShowShareModal(false);

    // If free download, allow download even if they skip
    if (isFreeDownload) {
      downloadBasicCard();
      setIsFreeDownload(false);
      return;
    }

    // If promo code user, still let them continue
    if (hasPromoCode) {
      setTimeout(() => {
        setShowProfileModal(true);
      }, 500);
    }
  };

  const handleSkip = () => {
    setShowUpgradeModal(false);
    setIsFreeDownload(true); // Mark as free download

    // Show ShareModal for free downloads (they must share on Twitter)
    setTimeout(() => {
      setShowShareModal(true);
    }, 500);
  };

  const downloadBasicCard = () => {
    if (!cardImage) return;

    const link = document.createElement('a');
    link.href = cardImage;
    link.download = `degen-card-basic-${walletAddress.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProfileSubmit = async (profileData: ProfileData) => {
    try {
      logger.info('📝 Saving profile for:', { walletAddress });
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          ...profileData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      logger.info('✅ Profile saved');

      await new Promise(resolve => setTimeout(resolve, 1000));

      logger.info('🎨 Regenerating premium card...');
      const imageResponse = await fetch('/api/generate-card?nocache=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddress }),
      });

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        setCardImage(imageUrl);
        logger.info('✅ Premium card generated!');
      }

      setShowProfileModal(false);
      setHasPaid(true); // ✅ Marcar como pagado para mostrar el botón
      // ❌ ELIMINADO: downloadPremiumCard(); 
      
    } catch (error) {
      logger.error('Payment error', error instanceof Error ? error : undefined, {
        error: String(error),
      });
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadPremiumCard = () => {
    if (!cardImage) return;

    const link = document.createElement('a');
    link.href = cardImage;
    link.download = `degen-card-premium-${walletAddress.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              DegenScore Card Generator
            </h1>
            <p className="text-gray-300 text-lg">
              Generate your Solana trader card with real on-chain metrics
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 animate-float drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            DegenScore Card Generator
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl font-medium">
            Generate your Solana trader card with real on-chain metrics
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_60px_rgba(139,92,246,0.4)] border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-500">
          <div className="mb-8">
            {!connected ? (
              <div className="text-center space-y-6">
                <div className="text-8xl mb-6 animate-float">🔐</div>
                <h2 className="text-3xl font-black text-white mb-3 drop-shadow-lg">Connect Your Wallet</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                  Connect your Solana wallet to generate your DegenScore card with real on-chain metrics
                </p>
                <div className="flex justify-center">
                  <div className="transform hover:scale-110 transition-transform duration-300">
                    <WalletMultiButton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-base font-bold mb-2 flex items-center gap-2">
                        <span className="text-2xl">✅</span> Wallet Connected
                      </p>
                      <p className="text-white font-mono text-lg font-semibold">
                        {publicKey!.toBase58().slice(0, 8)}...{publicKey!.toBase58().slice(-8)}
                      </p>
                    </div>
                    <div className="transform hover:scale-105 transition-transform">
                      <WalletMultiButton />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {analyzing && (
                  <div className="space-y-6 bg-gray-900/50 p-8 rounded-2xl border border-cyan-500/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg text-gray-200 font-bold">{analysisMessage}</span>
                      <span className="text-xl text-cyan-300 font-black">{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        style={{ width: `${analysisProgress}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-3 mt-6">
                      <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce shadow-[0_0_15px_rgba(168,85,247,0.8)]" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={generateCard}
                  disabled={loading}
                  className="w-full py-6 px-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-xl rounded-2xl transition-all duration-300 shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(139,92,246,0.8)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  {loading ? (
                    <span className="flex items-center justify-center relative z-10">
                      <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Card...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <span className="text-3xl">🎴</span>
                      Generate My Card
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {cardImage && (
            <div className="mt-10">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 group-hover:opacity-50 blur-xl transition-opacity"></div>
                  <img
                    src={cardImage}
                    alt="Degen Card"
                    className="relative rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.8)] border-4 border-cyan-400 max-w-full h-auto animate-flip holographic transform group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>

              {hasPaid && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-4 border-green-400 rounded-2xl p-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                    <div className="text-7xl mb-4 animate-float">✅</div>
                    <p className="text-green-300 font-black text-2xl mb-3">
                      Premium Card Ready!
                    </p>
                    <p className="text-gray-200 text-base font-medium">
                      Your premium card has been generated with all your customizations
                    </p>
                  </div>

                  <button
                    onClick={downloadPremiumCard}
                    className="w-full py-6 px-8 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:shadow-[0_0_60px_rgba(34,197,94,0.8)] hover:scale-[1.02] flex items-center justify-center gap-4 text-xl group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="text-3xl relative z-10">💎</span>
                    <span className="relative z-10">Download Premium Card</span>
                  </button>

                  <button
                    onClick={() => window.location.href = '/leaderboard'}
                    className="w-full py-5 px-8 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] hover:scale-[1.02] flex items-center justify-center gap-3 text-lg group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="text-2xl relative z-10">🏆</span>
                    <span className="relative z-10">View Leaderboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Powered by Helius RPC × Solana</p>
          <p className="mt-2">💡 Connect your wallet to get started</p>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        onSkip={handleSkip}
        onPromoCodeApplied={(code) => {
          setHasPromoCode(true);
          setPromoCodeApplied(code);
          setShowUpgradeModal(false);

          // Show ShareModal for promo code users (they must share on Twitter)
          setTimeout(() => {
            setShowShareModal(true);
          }, 500);
        }}
      />

      <ShareModal
        isOpen={showShareModal}
        walletAddress={walletAddress}
        degenScore={analysisData?.degenScore || 0}
        onShared={handleShared}
        onSkip={handleSkipShare}
      />

      <ProfileFormModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        walletAddress={walletAddress}
        hasPromoCode={hasPromoCode}
        promoCodeApplied={promoCodeApplied || undefined}
      />

      {/* Premium Features */}
      {showCelebration && (
        <Celebration
          type={celebrationType}
          score={celebrationScore}
        />
      )}

      <AchievementPopup
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
    </div>
  );
}
import React from 'react';
import { useDegenCard } from '@/hooks/useDegenCard';
import CardHeader from './DegenCard/CardHeader';
import Footer from './DegenCard/Footer';
import ConnectWalletState from './DegenCard/ConnectWalletState';
import ConnectedState from './DegenCard/ConnectedState';
import CardDisplay from './DegenCard/CardDisplay';
import UpgradeModal from './UpgradeModal';
import ShareModal from './ShareModal';
import ProfileFormModal from './ProfileFormModal';
import { Celebration } from './Celebration';
import { AchievementPopup } from './AchievementPopup';

export default function DegenCard() {
  const {
    mounted,
    connected,
    publicKey,
    walletAddress,
    cardImage,
    loading,
    error,
    analyzing,
    analysisProgress,
    analysisMessage,
    analysisData,
    hasPaid,
    hasPromoCode,
    promoCodeApplied,
    showUpgradeModal,
    showShareModal,
    showProfileModal,
    showCelebration,
    celebrationType,
    celebrationScore,
    currentAchievement,
    generateCard,
    handleUpgrade,
    handleSkip,
    handleShared,
    handleSkipShare,
    handleProfileSubmit,
    downloadPremiumCard,
    setShowUpgradeModal,
    setShowShareModal,
    setShowProfileModal,
    setHasPromoCode,
    setPromoCodeApplied,
    setCurrentAchievement,
  } = useDegenCard();

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
        <CardHeader />

        <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_60px_rgba(139,92,246,0.4)] border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-500">
          <div className="mb-8">
            {!connected ? (
              <ConnectWalletState />
            ) : (
              <ConnectedState
                publicKey={publicKey}
                error={error}
                analyzing={analyzing}
                analysisMessage={analysisMessage}
                analysisProgress={analysisProgress}
                loading={loading}
                generateCard={generateCard}
              />
            )}
          </div>

          {cardImage && (
            <CardDisplay
              cardImage={cardImage}
              hasPaid={hasPaid}
              downloadPremiumCard={downloadPremiumCard}
            />
          )}
        </div>

        <Footer />
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
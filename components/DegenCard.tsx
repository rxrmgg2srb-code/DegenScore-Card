import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ProfileFormModal, { ProfileData } from './ProfileFormModal';
import UpgradeModal from './UpgradeModal';

export default function DegenCard() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
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

      const analysisData = await analyzeResponse.json();
      console.log('✅ Analysis complete:', analysisData);
      
      setAnalysisMessage('📊 Analysis complete!');
      setAnalysisProgress(50);

      setAnalysisMessage('💾 Saving to database...');
      setAnalysisProgress(60);

      const saveResponse = await fetch('/api/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: addressToUse,
          analysisData: analysisData
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save card data');
      }

      const saveData = await saveResponse.json();
      console.log('✅ Card saved:', saveData);
      
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
        setShowUpgradeModal(true);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating card:', err);
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    setHasPaid(true);
    setShowProfileModal(true);
  };

  const handleSkip = () => {
    setShowUpgradeModal(false);
    downloadBasicCard();
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
      console.log('📝 Saving profile for:', walletAddress);
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

      console.log('✅ Profile saved');

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎨 Regenerating premium card...');
      const imageResponse = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddress }),
      });

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        setCardImage(imageUrl);
        console.log('✅ Premium card generated!');
      }

      setShowProfileModal(false);
      setHasPaid(true); // ✅ Marcar como pagado para mostrar el botón
      // ❌ ELIMINADO: downloadPremiumCard(); 
      
    } catch (error) {
      console.error('Error:', error);
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
          <div className="mb-8">
            {!connected ? (
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-6">
                  Connect your Solana wallet to generate your DegenScore card
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-semibold mb-1">✅ Wallet Connected</p>
                      <p className="text-white font-mono text-sm">
                        {publicKey!.toBase58().slice(0, 8)}...{publicKey!.toBase58().slice(-8)}
                      </p>
                    </div>
                    <WalletMultiButton />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {analyzing && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300 font-semibold">{analysisMessage}</span>
                      <span className="text-sm text-cyan-400 font-bold">{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${analysisProgress}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={generateCard}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Card...
                    </span>
                  ) : (
                    '🎴 Generate My Card'
                  )}
                </button>
              </div>
            )}
          </div>

          {cardImage && (
            <div className="mt-8">
              <div className="flex justify-center mb-6">
                <img
                  src={cardImage}
                  alt="Degen Card"
                  className="rounded-xl shadow-2xl border-2 border-cyan-500 max-w-full h-auto"
                />
              </div>

              {hasPaid && (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-xl p-6">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-green-400 font-bold text-xl mb-2">
                      Premium Card Ready!
                    </p>
                    <p className="text-gray-300 text-sm">
                      Your premium card has been generated with all your customizations
                    </p>
                  </div>
                  
                  <button
                    onClick={downloadPremiumCard}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                  >
                    <span className="text-2xl">💎</span>
                    Download Premium Card
                  </button>

                  <button
                    onClick={() => window.location.href = '/leaderboard'}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    🏆 View Leaderboard
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
      />

      <ProfileFormModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        walletAddress={walletAddress}
      />
    </div>
  );
}
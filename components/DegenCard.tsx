import { useState } from 'react';
import ProfileFormModal, { ProfileData } from './ProfileFormModal';
import UpgradeModal from './UpgradeModal';

export default function DegenCard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los modales
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Estados para indicador de progreso
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');

  const generateCard = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setError(null);
    setCardImage(null);
    setAnalysisProgress(0);

    try {
      // PASO 1: Analizar la wallet
      setAnalysisMessage('🔍 Analyzing wallet...');
      setAnalysisProgress(10);

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze wallet');
      }

      const analysisData = await analyzeResponse.json();
      console.log('✅ Analysis complete:', analysisData);
      
      setAnalysisMessage('📊 Analysis complete!');
      setAnalysisProgress(50);

      // PASO 2: Guardar en la base de datos
      setAnalysisMessage('💾 Saving to database...');
      setAnalysisProgress(60);

      const saveResponse = await fetch('/api/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: walletAddress.trim(),
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

      // PASO 3: Generar la imagen
      setAnalysisMessage('🎨 Generating card image...');
      setAnalysisProgress(90);

      const imageResponse = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
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

      // Mostrar modal de upgrade después de generar
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
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          ...profileData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const imageResponse = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          profile: profileData,
        }),
      });

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        setCardImage(imageUrl);
      }

      setShowProfileModal(false);
      downloadPremiumCard();
      alert('✅ Premium card downloaded! You now appear on the leaderboard 🏆');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving profile');
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
          <div className="mb-6">
            <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-2">
              Solana Wallet Address
            </label>
            <input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address (e.g., B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1)"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* INDICADOR DE PROGRESO */}
          {analyzing && (
            <div className="mb-6 space-y-4">
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
              '🎴 Generate Card'
            )}
          </button>

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
                <div className="text-center">
                  <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-4">
                    <p className="text-green-400 font-semibold">
                      ✅ Premium card activated! You're now on the leaderboard 🏆
                    </p>
                  </div>
                  
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
          <p className="mt-2">Try with: B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1</p>
        </div>
      </div>

      {/* Modales */}
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
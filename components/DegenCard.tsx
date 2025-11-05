import { useState } from 'react';

export default function DegenCard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCard = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);
    setCardImage(null);

    try {
      // Primero guardar/actualizar en la base de datos
      const saveResponse = await fetch('/api/save-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save card data');
      }

      const saveData = await saveResponse.json();
      console.log('Card saved:', saveData);

      // Luego generar la imagen
      const imageResponse = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || 'Failed to generate card');
      }

      // Convertir la respuesta a blob y crear URL
      const blob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(blob);
      setCardImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating card:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = () => {
    if (!cardImage) return;

    const link = document.createElement('a');
    link.href = cardImage;
    link.download = `degen-card-${walletAddress.slice(0, 8)}.png`;
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
            <div className="mt-8 space-y-4">
              <div className="flex justify-center">
                <img
                  src={cardImage}
                  alt="Degen Card"
                  className="rounded-xl shadow-2xl border-2 border-cyan-500 max-w-full h-auto"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={downloadCard}
                  className="py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ⬇️ Download Card
                </button>

                <button
                  onClick={() => window.location.href = `/profile/${walletAddress}`}
                  className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  👤 View Profile
                </button>

                <button
                  onClick={() => window.location.href = '/leaderboard'}
                  className="py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🏆 Leaderboard
                </button>
              </div>

              <div className="text-center text-gray-400 text-sm">
                <p>Card generated from real on-chain data via Helius API</p>
                <p className="mt-1">Your progress has been saved and you're on the leaderboard!</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Powered by Helius RPC × Solana</p>
          <p className="mt-2">Try with: B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1</p>
        </div>
      </div>
    </div>
  );
}

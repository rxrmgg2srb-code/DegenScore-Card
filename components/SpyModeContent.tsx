import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Head from 'next/head';
import { Header } from '@/components/Header';
import FIFACard from '@/components/FIFACard';

// 🔒 Admin wallet con acceso exclusivo al modo espía
const ADMIN_WALLET = 'B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1';

interface WalletCardData {
  walletAddress: string;
  displayName?: string;
  profileImage?: string;
  degenScore: number;
  tier: string;
  stats: {
    winRate: number;
    totalVolume: number;
    profitLoss: number;
    totalTrades: number;
    avgHoldTime?: number;
    level: number;
  };
  badges: any[];
  twitter?: string;
  telegram?: string;
}

export function SpyModeContent() {
  const { publicKey, connected } = useWallet();
  const [targetWallet, setTargetWallet] = useState('');
  const [cardData, setCardData] = useState<WalletCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar si el usuario es el admin
  const isAdmin = connected && publicKey?.toBase58() === ADMIN_WALLET;

  const handleAnalyzeWallet = async () => {
    if (!targetWallet.trim()) {
      setError('Por favor ingresa una wallet address');
      return;
    }

    setLoading(true);
    setError('');
    setCardData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: targetWallet.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar la wallet');
      }

      if (data.success && data.metrics) {
        // Calcular tier basado en degenScore
        const getTier = (score: number) => {
          if (score >= 90) return 'Diamond';
          if (score >= 75) return 'Platinum';
          if (score >= 60) return 'Gold';
          if (score >= 45) return 'Silver';
          return 'Bronze';
        };

        setCardData({
          walletAddress: targetWallet.trim(),
          displayName: data.metrics.displayName || undefined,
          profileImage: data.metrics.profileImage || undefined,
          degenScore: data.metrics.degenScore || 0,
          tier: getTier(data.metrics.degenScore || 0),
          stats: {
            winRate: data.metrics.winRate || 0,
            totalVolume: data.metrics.totalVolume || 0,
            profitLoss: data.metrics.profitLoss || 0,
            totalTrades: data.metrics.totalTrades || 0,
            avgHoldTime: data.metrics.avgHoldTime,
            level: data.metrics.level || 1,
          },
          badges: data.metrics.badges || [],
          twitter: data.metrics.twitter,
          telegram: data.metrics.telegram,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al analizar la wallet');
      console.error('Error analyzing wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAnalyzeWallet();
    }
  };

  return (
    <>
      <Head>
        <title>🕵️ Spy Mode - DegenScore</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />

        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              🕵️ Modo Espía
            </h1>
            <p className="text-xl text-gray-300">
              Analiza cualquier wallet de forma privada
            </p>
          </div>

          {/* Verificación de acceso */}
          {!connected ? (
            <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-12 text-center border border-purple-500/20">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-3xl font-bold mb-4">Acceso Restringido</h2>
              <p className="text-gray-300 mb-8">
                Conecta tu wallet para acceder al modo espía
              </p>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600" />
            </div>
          ) : !isAdmin ? (
            <div className="max-w-2xl mx-auto bg-red-900/20 backdrop-blur-lg rounded-2xl p-12 text-center border border-red-500/50">
              <div className="text-6xl mb-6">⛔</div>
              <h2 className="text-3xl font-bold mb-4 text-red-400">
                Acceso Denegado
              </h2>
              <p className="text-gray-300 mb-4">
                Esta función está disponible solo para el administrador.
              </p>
              <p className="text-sm text-gray-500 font-mono">
                Tu wallet: {publicKey?.toBase58()}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Panel de búsqueda */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-green-400 font-semibold">
                    Modo Espía Activado
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🎯 Wallet Address del Influencer
                  </label>
                  <input
                    type="text"
                    value={targetWallet}
                    onChange={(e) => setTargetWallet(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyzeWallet}
                  disabled={loading || !targetWallet.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analizando wallet...</span>
                    </div>
                  ) : (
                    <span>🔍 Analizar Wallet</span>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  💡 Esta información es privada y solo tú puedes verla
                </p>
              </div>

              {/* Card generada */}
              {cardData && (
                <div className="animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-purple-400">
                      📊 Análisis Completo
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      Wallet: {cardData.walletAddress.slice(0, 8)}...
                      {cardData.walletAddress.slice(-8)}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <FIFACard
                      rank={0}
                      walletAddress={cardData.walletAddress}
                      displayName={cardData.displayName}
                      profileImage={cardData.profileImage}
                      degenScore={cardData.degenScore}
                      tier={cardData.tier}
                      stats={cardData.stats}
                      badges={cardData.badges}
                      twitter={cardData.twitter}
                      telegram={cardData.telegram}
                    />
                  </div>

                  <div className="mt-8 bg-gray-800/30 rounded-lg p-6 border border-purple-500/10">
                    <h4 className="text-lg font-bold mb-4 text-purple-400">
                      📈 Estadísticas Detalladas
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">DegenScore</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {cardData.degenScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Win Rate</p>
                        <p className="text-2xl font-bold text-green-400">
                          {cardData.stats.winRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Trades</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {cardData.stats.totalTrades}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Volume</p>
                        <p className="text-2xl font-bold text-purple-400">
                          ${(cardData.stats.totalVolume / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">P&L</p>
                        <p
                          className={`text-2xl font-bold ${cardData.stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          ${(cardData.stats.profitLoss / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Level</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {cardData.stats.level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}

/**
 * 🚀 SUPER TOKEN SCORER COMPONENT
 *
 * El componente de análisis de tokens MÁS COMPLETO de Web3
 * Muestra TODAS las métricas posibles con una UI impresionante
 */

import React, { useState } from 'react';
import { SuperTokenScore } from '@/lib/services/superTokenScorer';

export default function SuperTokenScorer() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<SuperTokenScore | null>(null);
  const [error, setError] = useState('');

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      setError('Por favor ingresa una dirección de token');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setProgress(0);
    setProgressMessage('Iniciando análisis...');

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + 5;
      });
    }, 500);

    try {
      const response = await fetch('/api/super-token-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: tokenAddress.trim(),
          forceRefresh: false,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el token');
      }

      const data = await response.json();
      setResult(data.data);
      setProgress(100);
      setProgressMessage('¡Análisis completado!');
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Error al analizar el token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
            🚀 SUPER TOKEN SCORER
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            El Sistema de Análisis de Tokens MÁS COMPLETO de Web3
          </p>
          <p className="text-md text-gray-400">
            Integra 15+ APIs · 50+ Métricas · Análisis en Tiempo Real
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/30">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Ingresa la dirección del token (Solana)"
              className="flex-1 px-6 py-4 bg-gray-900/50 border border-purple-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
              disabled={loading}
            />
            <button
              onClick={analyzeToken}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 text-lg"
            >
              {loading ? '🔍 Analizando...' : '🚀 Analizar Token'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="mt-6">
              <div className="mb-2 text-gray-300 font-semibold">{progressMessage}</div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Super Score Principal */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
              <div className="text-center">
                <div className="text-6xl md:text-8xl font-black mb-4">
                  <span className={getScoreColor(result.superScore)}>
                    {result.superScore}
                  </span>
                  <span className="text-3xl text-gray-400">/100</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {result.tokenSymbol} - {result.tokenName}
                </div>
                <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${getRiskBadge(result.globalRiskLevel)}`}>
                  {result.globalRiskLevel}
                </div>
                <div className="mt-6 text-gray-300 text-lg max-w-3xl mx-auto">
                  {result.recommendation}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Análisis completado en {result.analysisTimeMs}ms · {new Date(result.analyzedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreCard
                title="Seguridad Base"
                score={result.scoreBreakdown.baseSecurityScore}
                max={100}
                icon="🔒"
              />
              <ScoreCard
                title="Wallets Nuevas"
                score={result.scoreBreakdown.newWalletScore}
                max={50}
                icon="👶"
              />
              <ScoreCard
                title="Actividad Insiders"
                score={result.scoreBreakdown.insiderScore}
                max={50}
                icon="🕵️"
              />
              <ScoreCard
                title="Volumen Real"
                score={result.scoreBreakdown.volumeScore}
                max={40}
                icon="📊"
              />
              <ScoreCard
                title="Redes Sociales"
                score={result.scoreBreakdown.socialScore}
                max={30}
                icon="🌐"
              />
              <ScoreCard
                title="Detección de Bots"
                score={result.scoreBreakdown.botDetectionScore}
                max={60}
                icon="🤖"
              />
              <ScoreCard
                title="Smart Money"
                score={result.scoreBreakdown.smartMoneyScore}
                max={70}
                icon="💎"
              />
              <ScoreCard
                title="Equipo"
                score={result.scoreBreakdown.teamScore}
                max={40}
                icon="👥"
              />
              <ScoreCard
                title="Patrón de Precio"
                score={result.scoreBreakdown.pricePatternScore}
                max={50}
                icon="📈"
              />
              <ScoreCard
                title="Holders Históricos"
                score={result.scoreBreakdown.historicalHoldersScore}
                max={40}
                icon="📅"
              />
              <ScoreCard
                title="Liquidez"
                score={result.scoreBreakdown.liquidityDepthScore}
                max={50}
                icon="💧"
              />
              <ScoreCard
                title="Cross-Chain"
                score={result.scoreBreakdown.crossChainScore}
                max={30}
                icon="🌉"
              />
              <ScoreCard
                title="RugCheck"
                score={result.scoreBreakdown.rugCheckScore}
                max={100}
                icon="⛔"
              />
              <ScoreCard
                title="DexScreener"
                score={result.scoreBreakdown.dexScreenerScore}
                max={60}
                icon="📱"
              />
              <ScoreCard
                title="Birdeye"
                score={result.scoreBreakdown.birdeyeScore}
                max={50}
                icon="🦅"
              />
              <ScoreCard
                title="Jupiter"
                score={result.scoreBreakdown.jupiterScore}
                max={50}
                icon="🪐"
              />
            </div>

            {/* Red Flags */}
            {result.allRedFlags.length > 0 && (
              <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
                <h2 className="text-2xl font-bold text-red-300 mb-4 flex items-center gap-2">
                  🚨 Red Flags ({result.allRedFlags.length})
                </h2>
                <div className="space-y-3">
                  {result.allRedFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        flag.severity === 'CRITICAL'
                          ? 'bg-red-900/30 border-red-500'
                          : flag.severity === 'HIGH'
                          ? 'bg-orange-900/30 border-orange-500'
                          : flag.severity === 'MEDIUM'
                          ? 'bg-yellow-900/30 border-yellow-500'
                          : 'bg-blue-900/30 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1">
                            {getSeverityEmoji(flag.severity)} {flag.category}
                          </div>
                          <div className="text-gray-300">{flag.message}</div>
                        </div>
                        <div className="text-sm text-red-400 font-bold">
                          -{flag.score_impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Green Flags */}
            {result.greenFlags.length > 0 && (
              <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <h2 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-2">
                  ✅ Green Flags ({result.greenFlags.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.greenFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-green-900/30 border border-green-500 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1">{flag.category}</div>
                          <div className="text-gray-300 text-sm">{flag.message}</div>
                        </div>
                        <div className="text-sm text-green-400 font-bold">
                          +{flag.score_boost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Wallets Analysis */}
              <MetricCard title="Análisis de Wallets Nuevas" icon="👶">
                <MetricRow
                  label="Wallets < 10 días"
                  value={`${result.newWalletAnalysis.walletsUnder10Days} (${result.newWalletAnalysis.percentageNewWallets.toFixed(1)}%)`}
                />
                <MetricRow
                  label="Edad promedio"
                  value={`${result.newWalletAnalysis.avgWalletAge.toFixed(1)} días`}
                />
                <MetricRow
                  label="Wallets sospechosas"
                  value={result.newWalletAnalysis.suspiciousNewWallets}
                />
                <MetricRow
                  label="Nivel de riesgo"
                  value={result.newWalletAnalysis.riskLevel}
                  valueClass={getRiskColor(result.newWalletAnalysis.riskLevel)}
                />
              </MetricCard>

              {/* Insider Analysis */}
              <MetricCard title="Análisis de Insiders" icon="🕵️">
                <MetricRow
                  label="Wallets insiders"
                  value={result.insiderAnalysis.insiderWallets}
                />
                <MetricRow
                  label="Holdings insiders"
                  value={`${result.insiderAnalysis.insiderHoldings.toFixed(1)}%`}
                />
                <MetricRow
                  label="Early buyers"
                  value={result.insiderAnalysis.earlyBuyers}
                />
                <MetricRow
                  label="Profit taking"
                  value={result.insiderAnalysis.insiderProfitTaking ? '⚠️ SÍ' : '✅ NO'}
                  valueClass={result.insiderAnalysis.insiderProfitTaking ? 'text-red-400' : 'text-green-400'}
                />
              </MetricCard>

              {/* Volume Analysis */}
              <MetricCard title="Análisis de Volumen" icon="📊">
                <MetricRow
                  label="Volumen 24h"
                  value={`$${result.volumeAnalysis.volume24h.toLocaleString()}`}
                />
                <MetricRow
                  label="Volumen real"
                  value={`$${result.volumeAnalysis.realVolume.toLocaleString()}`}
                />
                <MetricRow
                  label="Volumen fake"
                  value={`${result.volumeAnalysis.fakeVolumePercent.toFixed(1)}%`}
                  valueClass={result.volumeAnalysis.fakeVolumePercent > 30 ? 'text-red-400' : 'text-green-400'}
                />
                <MetricRow
                  label="Tendencia"
                  value={result.volumeAnalysis.volumeTrend}
                />
              </MetricCard>

              {/* Social Analysis */}
              <MetricCard title="Redes Sociales" icon="🌐">
                <MetricRow
                  label="Twitter"
                  value={result.socialAnalysis.hasTwitter ? `✅ ${result.socialAnalysis.twitterFollowers.toLocaleString()} followers` : '❌ No'}
                />
                <MetricRow
                  label="Telegram"
                  value={result.socialAnalysis.hasTelegram ? `✅ ${result.socialAnalysis.telegramMembers.toLocaleString()} miembros` : '❌ No'}
                />
                <MetricRow
                  label="Website"
                  value={result.socialAnalysis.hasWebsite ? `✅ ${result.socialAnalysis.websiteSSL ? 'SSL' : 'Sin SSL'}` : '❌ No'}
                />
                <MetricRow
                  label="Discord"
                  value={result.socialAnalysis.hasDiscord ? `✅ ${result.socialAnalysis.discordMembers.toLocaleString()} miembros` : '❌ No'}
                />
              </MetricCard>

              {/* Bot Detection */}
              <MetricCard title="Detección de Bots" icon="🤖">
                <MetricRow
                  label="Total de bots"
                  value={result.botDetection.totalBots}
                />
                <MetricRow
                  label="Porcentaje bots"
                  value={`${result.botDetection.botPercent.toFixed(1)}%`}
                  valueClass={result.botDetection.botPercent > 40 ? 'text-red-400' : 'text-green-400'}
                />
                <MetricRow
                  label="MEV Bots"
                  value={result.botDetection.mevBots}
                />
                <MetricRow
                  label="Bundle Bots"
                  value={result.botDetection.bundleBots}
                />
                <MetricRow
                  label="Wash Trading Bots"
                  value={result.botDetection.washTradingBots}
                />
              </MetricCard>

              {/* Smart Money */}
              <MetricCard title="Smart Money" icon="💎">
                <MetricRow
                  label="Wallets detectadas"
                  value={result.smartMoneyAnalysis.smartMoneyWallets}
                />
                <MetricRow
                  label="Holdings"
                  value={`${result.smartMoneyAnalysis.smartMoneyHoldings.toFixed(1)}%`}
                />
                <MetricRow
                  label="Señal"
                  value={result.smartMoneyAnalysis.signal}
                  valueClass={getSignalColor(result.smartMoneyAnalysis.signal)}
                />
                <MetricRow
                  label="Profit promedio"
                  value={`${result.smartMoneyAnalysis.averageSmartMoneyProfit.toFixed(1)}%`}
                  valueClass={result.smartMoneyAnalysis.averageSmartMoneyProfit > 0 ? 'text-green-400' : 'text-red-400'}
                />
              </MetricCard>

              {/* Team Analysis */}
              <MetricCard title="Análisis del Equipo" icon="👥">
                <MetricRow
                  label="Tokens bloqueados"
                  value={result.teamAnalysis.teamTokensLocked ? '✅ SÍ' : '❌ NO'}
                  valueClass={result.teamAnalysis.teamTokensLocked ? 'text-green-400' : 'text-red-400'}
                />
                <MetricRow
                  label="Asignación team"
                  value={`${result.teamAnalysis.teamAllocation.toFixed(1)}%`}
                />
                <MetricRow
                  label="Vesting"
                  value={result.teamAnalysis.vestingSchedule ? `✅ ${result.teamAnalysis.vestingDuration} meses` : '❌ NO'}
                />
                <MetricRow
                  label="Team vendiendo"
                  value={result.teamAnalysis.teamSelling ? '⚠️ SÍ' : '✅ NO'}
                  valueClass={result.teamAnalysis.teamSelling ? 'text-red-400' : 'text-green-400'}
                />
              </MetricCard>

              {/* Price Pattern */}
              <MetricCard title="Patrón de Precio" icon="📈">
                <MetricRow
                  label="Patrón"
                  value={result.pricePattern.pattern}
                  valueClass={getPatternColor(result.pricePattern.pattern)}
                />
                <MetricRow
                  label="Volatilidad"
                  value={`${result.pricePattern.volatility.toFixed(1)}%`}
                />
                <MetricRow
                  label="Estabilidad"
                  value={`${result.pricePattern.priceStability.toFixed(1)}%`}
                />
                <MetricRow
                  label="Fuerza de tendencia"
                  value={`${result.pricePattern.trendStrength.toFixed(1)}%`}
                />
              </MetricCard>

              {/* Liquidity Depth */}
              <MetricCard title="Profundidad de Liquidez" icon="💧">
                <MetricRow
                  label="Salud"
                  value={result.liquidityDepth.liquidityHealth}
                  valueClass={getLiquidityColor(result.liquidityDepth.liquidityHealth)}
                />
                <MetricRow
                  label="Slippage 1 SOL"
                  value={`${result.liquidityDepth.slippage1SOL.toFixed(2)}%`}
                />
                <MetricRow
                  label="Slippage 10 SOL"
                  value={`${result.liquidityDepth.slippage10SOL.toFixed(2)}%`}
                />
                <MetricRow
                  label="Slippage 100 SOL"
                  value={`${result.liquidityDepth.slippage100SOL.toFixed(2)}%`}
                />
              </MetricCard>
            </div>

            {/* External APIs Data */}
            {(result.dexScreenerData || result.birdeyeData || result.rugCheckData) && (
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-4">📡 Datos de APIs Externas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.dexScreenerData && (
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="font-bold text-purple-400 mb-2">DexScreener</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Price: ${result.dexScreenerData.priceUSD.toFixed(8)}</div>
                        <div>Liquidity: ${result.dexScreenerData.liquidity.toLocaleString()}</div>
                        <div>Volume 24h: ${result.dexScreenerData.volume24h.toLocaleString()}</div>
                        <div>DEX: {result.dexScreenerData.dex}</div>
                      </div>
                    </div>
                  )}
                  {result.birdeyeData && (
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="font-bold text-blue-400 mb-2">Birdeye</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Price: ${result.birdeyeData.price.toFixed(8)}</div>
                        <div>Market Cap: ${result.birdeyeData.marketCap.toLocaleString()}</div>
                        <div>Holders: {result.birdeyeData.holder.toLocaleString()}</div>
                        <div>24h Trades: {result.birdeyeData.trade24h}</div>
                      </div>
                    </div>
                  )}
                  {result.rugCheckData && (
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="font-bold text-red-400 mb-2">RugCheck</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Score: {result.rugCheckData.score}/100</div>
                        <div>Rugged: {result.rugCheckData.rugged ? '⚠️ YES' : '✅ NO'}</div>
                        <div>Risks: {result.rugCheckData.risks.length}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components

function ScoreCard({ title, score, max, icon }: { title: string; score: number; max: number; icon: string }) {
  const percentage = (score / max) * 100;

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-300">{icon} {title}</div>
        <div className="text-lg font-bold text-white">
          {score}<span className="text-xs text-gray-500">/{max}</span>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percentage >= 80
              ? 'bg-green-500'
              : percentage >= 50
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-xl p-5 border border-purple-500/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MetricRow({ label, value, valueClass = 'text-white' }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className={`font-semibold text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

// Helper Functions

function getScoreColor(score: number): string {
  if (score >= 800) return 'text-green-400';
  if (score >= 650) return 'text-blue-400';
  if (score >= 500) return 'text-yellow-400';
  if (score >= 350) return 'text-orange-400';
  return 'text-red-400';
}

function getRiskBadge(risk: string): string {
  switch (risk) {
    case 'ULTRA_SAFE':
    case 'VERY_SAFE':
      return 'bg-green-500 text-white';
    case 'SAFE':
      return 'bg-blue-500 text-white';
    case 'MODERATE':
      return 'bg-yellow-500 text-black';
    case 'RISKY':
      return 'bg-orange-500 text-white';
    case 'VERY_RISKY':
    case 'EXTREME_DANGER':
      return 'bg-red-500 text-white';
    case 'SCAM':
      return 'bg-black text-red-500 border-2 border-red-500';
    default:
      return 'bg-gray-500 text-white';
  }
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'LOW':
      return 'text-green-400';
    case 'MEDIUM':
      return 'text-yellow-400';
    case 'HIGH':
      return 'text-orange-400';
    case 'CRITICAL':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return '🔴';
    case 'HIGH':
      return '🟠';
    case 'MEDIUM':
      return '🟡';
    case 'LOW':
      return '🔵';
    default:
      return 'ℹ️';
  }
}

function getSignalColor(signal: string): string {
  switch (signal) {
    case 'STRONG_BUY':
      return 'text-green-500 font-bold';
    case 'BUY':
      return 'text-green-400';
    case 'NEUTRAL':
      return 'text-gray-400';
    case 'SELL':
      return 'text-red-400';
    case 'STRONG_SELL':
      return 'text-red-500 font-bold';
    default:
      return 'text-gray-400';
  }
}

function getPatternColor(pattern: string): string {
  switch (pattern) {
    case 'ORGANIC_GROWTH':
      return 'text-green-400';
    case 'ACCUMULATION':
      return 'text-blue-400';
    case 'SIDEWAYS':
      return 'text-gray-400';
    case 'DISTRIBUTION':
      return 'text-yellow-400';
    case 'PUMP_AND_DUMP':
    case 'DEATH_SPIRAL':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function getLiquidityColor(health: string): string {
  switch (health) {
    case 'EXCELLENT':
      return 'text-green-500 font-bold';
    case 'GOOD':
      return 'text-green-400';
    case 'FAIR':
      return 'text-yellow-400';
    case 'POOR':
      return 'text-orange-400';
    case 'CRITICAL':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

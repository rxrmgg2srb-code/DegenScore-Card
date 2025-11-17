/**
 * 🔒 Token Security Scanner Component
 *
 * Advanced UI for analyzing Solana token security
 * Shows comprehensive security analysis with visual indicators
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface TokenSecurityReport {
  tokenAddress: string;
  securityScore: number;
  riskLevel: string;
  recommendation: string;
  tokenAuthorities: any;
  holderDistribution: any;
  liquidityAnalysis: any;
  tradingPatterns: any;
  metadata: any;
  marketMetrics: any;
  redFlags: any;
  analyzedAt: number;
}

export default function TokenSecurityScanner() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TokenSecurityReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      toast.error('Please enter a token address');
      return;
    }

    setLoading(true);
    setProgress(0);
    setReport(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    const messages = [
      'Validating token address...',
      'Fetching token metadata...',
      'Analyzing token authorities...',
      'Analyzing holder distribution...',
      'Analyzing liquidity...',
      'Detecting trading patterns...',
      'Analyzing market metrics...',
      'Calculating security score...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      // Safe to use ! because modulo ensures index is always within bounds
      setProgressMessage(messages[messageIndex % messages.length]!);
      messageIndex++;
    }, 1000);

    try {
      const response = await fetch('/api/analyze-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress: tokenAddress.trim() }),
      });

      clearInterval(progressInterval);
      clearInterval(messageInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data = await response.json();
      setProgress(100);
      setProgressMessage('Analysis complete!');
      setReport(data.report);

      if (data.cached) {
        toast.success('Analysis loaded from cache');
      } else {
        toast.success('Token analyzed successfully!');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      toast.error(error.message || 'Failed to analyze token');
      setProgress(0);
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTokenAddress(text.trim());
      toast.success('Address pasted!');
    } catch (error) {
      toast.error('Failed to paste from clipboard');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          🔒 Token Security Scanner
        </h1>
        <p className="text-gray-400 text-lg">
          Analyze Solana tokens for rug pulls, honeypots, and security risks
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Advanced on-chain analysis • Bundle detection • Liquidity analysis • Holder distribution
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 mb-6"
      >
        <label className="block text-gray-300 font-semibold mb-3">
          Token Address (Mint Address)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token mint address..."
            className="flex-1 bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                analyzeToken();
              }
            }}
          />
          <button
            onClick={handlePaste}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-white font-medium"
          >
            📋 Paste
          </button>
          <button
            onClick={analyzeToken}
            disabled={loading || !tokenAddress.trim()}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              loading || !tokenAddress.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50'
            }`}
          >
            {loading ? '🔍 Analyzing...' : '🔒 Analyze Security'}
          </button>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">{progressMessage}</span>
                  <span className="text-purple-400 font-bold">{progress}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SecurityReport report={report} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Security Report Component
// ============================================================================

function SecurityReport({ report }: { report: TokenSecurityReport }) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'ULTRA_SAFE':
        return 'from-green-500 to-emerald-500';
      case 'LOW_RISK':
        return 'from-blue-500 to-cyan-500';
      case 'MODERATE_RISK':
        return 'from-yellow-500 to-orange-500';
      case 'HIGH_RISK':
        return 'from-orange-500 to-red-500';
      case 'EXTREME_DANGER':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskEmoji = (riskLevel: string) => {
    switch (riskLevel) {
      case 'ULTRA_SAFE':
        return '✅';
      case 'LOW_RISK':
        return '🟢';
      case 'MODERATE_RISK':
        return '🟡';
      case 'HIGH_RISK':
        return '🔴';
      case 'EXTREME_DANGER':
        return '⛔';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-br ${getRiskColor(report.riskLevel)} p-1 rounded-2xl`}
      >
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{getRiskEmoji(report.riskLevel)}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Security Score: {report.securityScore}/100
            </h2>
            <div className="text-2xl font-semibold text-gray-300 mb-4">
              {report.riskLevel.replace('_', ' ')}
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">{report.recommendation}</p>
          </div>

          {/* Token Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">Token</div>
                <div className="text-white font-bold">{report.metadata.symbol}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Holders</div>
                <div className="text-white font-bold">
                  {report.holderDistribution.totalHolders.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Liquidity</div>
                <div className="text-white font-bold">
                  {report.liquidityAnalysis.totalLiquiditySOL.toFixed(1)} SOL
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Age</div>
                <div className="text-white font-bold">
                  {report.marketMetrics.ageInDays.toFixed(1)} days
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Red Flags */}
      {report.redFlags.flags.length > 0 && (
        <RedFlagsCard redFlags={report.redFlags} />
      )}

      {/* Detailed Analysis Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <AuthorityCard authorities={report.tokenAuthorities} />
        <HolderDistributionCard distribution={report.holderDistribution} />
        <LiquidityCard liquidity={report.liquidityAnalysis} />
        <TradingPatternsCard patterns={report.tradingPatterns} />
      </div>

      {/* Market Metrics */}
      <MarketMetricsCard metrics={report.marketMetrics} />
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function RedFlagsCard({ redFlags }: { redFlags: any }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'HIGH':
        return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'MEDIUM':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
        🚨 Security Warnings ({redFlags.flags.length})
      </h3>
      <div className="space-y-3">
        {redFlags.flags.map((flag: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border rounded-xl p-4 ${getSeverityColor(flag.severity)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold">{flag.severity}</span>
              <span className="text-xs opacity-75">{flag.category}</span>
            </div>
            <p className="text-sm">{flag.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AuthorityCard({ authorities }: { authorities: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">🔑 Token Authorities</h3>
      <div className="space-y-3">
        <ScoreBar label="Authority Score" score={authorities.score} max={25} />

        <InfoRow
          label="Mint Authority"
          value={authorities.hasMintAuthority ? '⚠️ Active' : '✅ Revoked'}
          danger={authorities.hasMintAuthority}
        />
        <InfoRow
          label="Freeze Authority"
          value={authorities.hasFreezeAuthority ? '⚠️ Active' : '✅ Revoked'}
          danger={authorities.hasFreezeAuthority}
        />
        <InfoRow
          label="Risk Level"
          value={authorities.riskLevel}
          danger={authorities.riskLevel === 'HIGH' || authorities.riskLevel === 'CRITICAL'}
        />
      </div>
    </div>
  );
}

function HolderDistributionCard({ distribution }: { distribution: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">👥 Holder Distribution</h3>
      <div className="space-y-3">
        <ScoreBar label="Distribution Score" score={distribution.score} max={20} />

        <InfoRow
          label="Total Holders"
          value={distribution.totalHolders.toLocaleString()}
        />
        <InfoRow
          label="Top 10 Holders"
          value={`${distribution.top10HoldersPercent.toFixed(1)}%`}
          danger={distribution.top10HoldersPercent > 60}
        />
        <InfoRow
          label="Creator Holdings"
          value={`${distribution.creatorPercent.toFixed(1)}%`}
          danger={distribution.creatorPercent > 30}
        />
        <InfoRow
          label="Concentration Risk"
          value={distribution.concentrationRisk}
          danger={distribution.concentrationRisk === 'HIGH' || distribution.concentrationRisk === 'CRITICAL'}
        />
        {distribution.bundleDetected && (
          <InfoRow
            label="Bundle Wallets"
            value={`⚠️ ${distribution.bundleWallets} detected`}
            danger={true}
          />
        )}
      </div>
    </div>
  );
}

function LiquidityCard({ liquidity }: { liquidity: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">💧 Liquidity Analysis</h3>
      <div className="space-y-3">
        <ScoreBar label="Liquidity Score" score={liquidity.score} max={20} />

        <InfoRow
          label="Total Liquidity"
          value={`${liquidity.totalLiquiditySOL.toFixed(2)} SOL ($${liquidity.liquidityUSD.toFixed(0)})`}
        />
        <InfoRow
          label="LP Burned"
          value={liquidity.lpBurned ? '✅ Yes' : '❌ No'}
          danger={!liquidity.lpBurned}
        />
        <InfoRow
          label="LP Locked"
          value={liquidity.lpLocked ? '✅ Yes' : '❌ No'}
          danger={!liquidity.lpLocked}
        />
        <InfoRow
          label="Risk Level"
          value={liquidity.riskLevel}
          danger={liquidity.riskLevel === 'HIGH' || liquidity.riskLevel === 'CRITICAL'}
        />
      </div>
    </div>
  );
}

function TradingPatternsCard({ patterns }: { patterns: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">📊 Trading Patterns</h3>
      <div className="space-y-3">
        <ScoreBar label="Trading Score" score={patterns.score} max={15} />

        <InfoRow
          label="Bundle Bots"
          value={patterns.bundleBots.toString()}
          danger={patterns.bundleBots > 10}
        />
        <InfoRow
          label="Snipers"
          value={patterns.snipers.toString()}
        />
        <InfoRow
          label="Wash Trading"
          value={patterns.washTrading ? '⚠️ Detected' : '✅ None'}
          danger={patterns.washTrading}
        />
        <InfoRow
          label="Honeypot"
          value={patterns.honeypotDetected ? '🚨 DETECTED' : '✅ Safe'}
          danger={patterns.honeypotDetected}
        />
        <InfoRow
          label="Can Sell"
          value={patterns.canSell ? '✅ Yes' : '⛔ NO'}
          danger={!patterns.canSell}
        />
      </div>
    </div>
  );
}

function MarketMetricsCard({ metrics }: { metrics: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">📈 Market Metrics</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <InfoRow label="Age" value={`${metrics.ageInDays.toFixed(1)} days`} />
        <InfoRow
          label="Pump & Dump"
          value={metrics.isPumpAndDump ? '⚠️ Detected' : '✅ No'}
          danger={metrics.isPumpAndDump}
        />
        <ScoreBar label="Market Score" score={metrics.score} max={10} />
      </div>
    </div>
  );
}

// Helper Components

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = (score / max) * 100;
  const color =
    percentage >= 80
      ? 'from-green-500 to-emerald-500'
      : percentage >= 60
      ? 'from-blue-500 to-cyan-500'
      : percentage >= 40
      ? 'from-yellow-500 to-orange-500'
      : 'from-red-500 to-pink-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">
          {score}/{max}
        </span>
      </div>
      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span
        className={`font-semibold ${
          danger ? 'text-red-400' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateAdvancedMetrics } from '../../lib/metrics-advanced';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔍 Analyzing wallet:', walletAddress);

    // Usar la función real de análisis
    const metrics = await calculateAdvancedMetrics(walletAddress);

    console.log('✅ Analysis complete');

    // Generar badges basados en métricas reales
    const badges = [];
    
    if (metrics.totalTrades > 100) {
      badges.push({ 
        name: String('Active Trader'), 
        description: String(`${metrics.totalTrades} trades executed`), 
        icon: String('📈'), 
        rarity: String('COMMON')
      });
    }
    
    if (metrics.totalTrades > 500) {
      badges.push({ 
        name: String('Volume King'), 
        description: String(`${metrics.totalTrades} trades`), 
        icon: String('👑'), 
        rarity: String('RARE')
      });
    }
    
    if (metrics.winRate > 60) {
      badges.push({ 
        name: String('Winning Streak'), 
        description: String(`${metrics.winRate.toFixed(1)}% win rate`), 
        icon: String('🔥'), 
        rarity: String('EPIC')
      });
    }

    if (metrics.totalVolume > 1000) {
      badges.push({ 
        name: String('Whale'), 
        description: String(`${metrics.totalVolume.toFixed(0)} SOL volume`), 
        icon: String('🐋'), 
        rarity: String('LEGENDARY')
      });
    }

    if (metrics.tradingDays > 30) {
      badges.push({ 
        name: String('Consistent Trader'), 
        description: String(`Active for ${metrics.tradingDays} days`), 
        icon: String('📅'), 
        rarity: String('RARE')
      });
    }

    if (metrics.moonshots > 5) {
      badges.push({ 
        name: String('Moonshot Hunter'), 
        description: String(`${metrics.moonshots} big wins`), 
        icon: String('🚀'), 
        rarity: String('EPIC')
      });
    }

    // Preparar respuesta con los datos reales
    const analysisData = {
      degenScore: Number(metrics.degenScore),
      totalTrades: Number(metrics.totalTrades),
      totalVolume: Number(metrics.totalVolume),
      profitLoss: Number(metrics.profitLoss),
      winRate: Number(metrics.winRate),
      bestTrade: Number(metrics.bestTrade),
      worstTrade: Number(metrics.worstTrade),
      avgTradeSize: Number(metrics.avgTradeSize),
      totalFees: Number(metrics.totalFees),
      tradingDays: Number(metrics.tradingDays),
      level: Math.floor(metrics.degenScore / 10) + 1,
      xp: metrics.degenScore * 10,
      rugsSurvived: Number(metrics.rugsSurvived),
      rugsCaught: Number(metrics.rugsCaught),
      totalRugValue: Number(metrics.totalRugValue),
      moonshots: Number(metrics.moonshots),
      avgHoldTime: Number(metrics.avgHoldTime),
      quickFlips: Number(metrics.quickFlips),
      diamondHands: Number(metrics.diamondHands),
      realizedPnL: Number(metrics.realizedPnL),
      unrealizedPnL: Number(metrics.unrealizedPnL),
      firstTradeDate: new Date(metrics.firstTradeDate * 1000).toISOString(),
      longestWinStreak: Number(metrics.longestWinStreak),
      longestLossStreak: Number(metrics.longestLossStreak),
      volatilityScore: Number(metrics.volatilityScore),
      badges,
    };

    res.status(200).json(analysisData);

  } catch (error: any) {
    console.error('❌ Error analyzing wallet:', error);
    res.status(500).json({ 
      error: 'Failed to analyze wallet', 
      details: error.message 
    });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateAdvancedMetrics } from '../../lib/metrics-advanced';
import { generateBadges } from '../../lib/badges-generator';
import { isValidSolanaAddress } from '../../lib/validation';
import { strictRateLimit } from '../../lib/rateLimit';
import { logger } from '../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply strict rate limiting (expensive operation)
  if (!strictRateLimit(req, res)) {
    return;
  }

  try {
    const { walletAddress } = req.body;

    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    logger.info('Analyzing wallet:', walletAddress);

    // 1. Usar la función real de análisis
    const metrics = await calculateAdvancedMetrics(walletAddress);

    logger.info('Analysis complete for wallet:', walletAddress);

    // 2. Generar badges usando la función encapsulada (MÁS LIMPIO)
    const badges = generateBadges(metrics); // <--- LÓGICA EXTRAÍDA AQUÍ
    
    // Preparar respuesta con los datos reales
    const analysisData = {
      // Uso de Number() es redundante si TypeScript está configurado correctamente
      // pero se mantiene si es necesario asegurar el tipo en la respuesta JSON.
      degenScore: metrics.degenScore,
      totalTrades: metrics.totalTrades,
      totalVolume: metrics.totalVolume,
      profitLoss: metrics.profitLoss,
      winRate: metrics.winRate,
      bestTrade: metrics.bestTrade,
      worstTrade: metrics.worstTrade,
      avgTradeSize: metrics.avgTradeSize,
      totalFees: metrics.totalFees,
      tradingDays: metrics.tradingDays,
      level: Math.floor(metrics.degenScore / 10) + 1,
      xp: metrics.degenScore * 10,
      rugsSurvived: metrics.rugsSurvived,
      rugsCaught: metrics.rugsCaught,
      totalRugValue: metrics.totalRugValue,
      moonshots: metrics.moonshots,
      avgHoldTime: metrics.avgHoldTime,
      quickFlips: metrics.quickFlips,
      diamondHands: metrics.diamondHands,
      realizedPnL: metrics.realizedPnL,
      unrealizedPnL: metrics.unrealizedPnL,
      firstTradeDate: new Date(metrics.firstTradeDate * 1000).toISOString(),
      longestWinStreak: metrics.longestWinStreak,
      longestLossStreak: metrics.longestLossStreak,
      volatilityScore: metrics.volatilityScore,
      badges, // <--- LISTA DE BADGES GENERADA
    };

    res.status(200).json(analysisData);

  } catch (error: any) {
    logger.error('Error analyzing wallet:', error);

    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to analyze wallet';

    res.status(500).json({
      error: errorMessage
    });
  }
}
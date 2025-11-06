import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isValidSolanaAddress } from '../../lib/helius';
import { calculateAdvancedMetrics } from '../../lib/metrics-advanced';
import { calculateUnlockedBadges, calculateLevel, calculateXP } from '../../lib/badges-advanced';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    console.log(`🔍 Analyzing wallet: ${walletAddress}`);

    // ============================================================================
    // NUEVO: Usar calculateAdvancedMetrics en lugar del sistema anterior
    // ============================================================================
    
    // Esto ahora:
    // 1. Obtiene TODAS las transacciones (no solo 100)
    // 2. Analiza cada posición por token
    // 3. Detecta rugs y salvadas
    // 4. Calcula moonshots
    // 5. Analiza estilo de trading
    // Y mucho más...
    
    const metrics = await calculateAdvancedMetrics(walletAddress);
    
    console.log(`✅ Analysis complete:`);
    console.log(`   - Total Trades: ${metrics.totalTrades}`);
    console.log(`   - Degen Score: ${metrics.degenScore}`);
    console.log(`   - Rugs Survived: ${metrics.rugsSurvived}`);
    console.log(`   - Rugs Caught: ${metrics.rugsCaught}`);
    console.log(`   - Moonshots: ${metrics.moonshots}`);
    console.log(`   - Win Streak: ${metrics.longestWinStreak}`);

    // Calcular badges y nivel con el nuevo sistema
    const unlockedBadges = calculateUnlockedBadges(metrics);
    const level = calculateLevel(metrics);
    const xp = calculateXP(metrics);

    console.log(`🏅 Unlocked ${unlockedBadges.length} badges`);
    console.log(`⭐ Level ${level} (${xp} XP)`);

    // ============================================================================
    // Guardar o actualizar en la base de datos
    // ============================================================================
    
    const card = await prisma.degenCard.upsert({
      where: { walletAddress },
      update: {
        // Métricas básicas
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
        level,
        xp,
        lastSeen: new Date(),
        
        // ========================================================================
        // NUEVO: Métricas avanzadas
        // ========================================================================
        rugsSurvived: metrics.rugsSurvived,
        rugsCaught: metrics.rugsCaught,
        totalRugValue: metrics.totalRugValue,
        moonshots: metrics.moonshots,
        quickFlips: metrics.quickFlips,
        diamondHands: metrics.diamondHands,
        avgHoldTime: metrics.avgHoldTime,
        longestWinStreak: metrics.longestWinStreak,
        longestLossStreak: metrics.longestLossStreak,
        volatilityScore: metrics.volatilityScore,
        realizedPnL: metrics.realizedPnL,
        unrealizedPnL: metrics.unrealizedPnL,
        firstTradeDate: new Date(metrics.firstTradeDate * 1000),
        
        // Actualizar badges
        badges: {
          deleteMany: {}, // Eliminar badges antiguos
          create: unlockedBadges.map(badge => ({
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity,
          })),
        },
      },
      create: {
        walletAddress,
        // Métricas básicas
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
        level,
        xp,
        
        // Métricas avanzadas
        rugsSurvived: metrics.rugsSurvived,
        rugsCaught: metrics.rugsCaught,
        totalRugValue: metrics.totalRugValue,
        moonshots: metrics.moonshots,
        quickFlips: metrics.quickFlips,
        diamondHands: metrics.diamondHands,
        avgHoldTime: metrics.avgHoldTime,
        longestWinStreak: metrics.longestWinStreak,
        longestLossStreak: metrics.longestLossStreak,
        volatilityScore: metrics.volatilityScore,
        realizedPnL: metrics.realizedPnL,
        unrealizedPnL: metrics.unrealizedPnL,
        firstTradeDate: new Date(metrics.firstTradeDate * 1000),
        
        badges: {
          create: unlockedBadges.map(badge => ({
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity,
          })),
        },
      },
      include: {
        badges: true,
      },
    });

    // Actualizar estadísticas globales
    await updateGlobalStats();

    // ============================================================================
    // Respuesta con todas las métricas
    // ============================================================================
    
    res.status(200).json({
      success: true,
      card,
      metrics,
      badges: unlockedBadges,
      level,
      xp,
      // Información adicional útil para el frontend
      analysis: {
        tradingStyle: getTradingStyle(metrics),
        riskProfile: getRiskProfile(metrics),
        highlights: getHighlights(metrics),
        recommendations: getRecommendations(metrics),
      },
    });
  } catch (error) {
    console.error('❌ Error saving card:', error);
    res.status(500).json({
      error: 'Failed to save card',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determina el estilo de trading basado en las métricas
 */
function getTradingStyle(metrics: any): string {
  if (metrics.quickFlips > 50 && metrics.avgHoldTime < 2) {
    return '⚡ Scalper';
  } else if (metrics.avgHoldTime < 24) {
    return '📊 Day Trader';
  } else if (metrics.diamondHands > 20) {
    return '💎 Diamond Hands';
  } else if (metrics.avgHoldTime > 48) {
    return '🤝 HODLer';
  } else {
    return '📈 Swing Trader';
  }
}

/**
 * Determina el perfil de riesgo
 */
function getRiskProfile(metrics: any): string {
  if (metrics.volatilityScore > 70) {
    return '🎰 High Risk / High Reward';
  } else if (metrics.volatilityScore > 40) {
    return '⚖️ Moderate Risk';
  } else {
    return '🛡️ Conservative';
  }
}

/**
 * Genera highlights basados en las métricas
 */
function getHighlights(metrics: any): string[] {
  const highlights: string[] = [];

  if (metrics.rugsSurvived > 5) {
    highlights.push(`🛡️ Survived ${metrics.rugsSurvived} rug pulls`);
  }
  
  if (metrics.moonshots > 3) {
    highlights.push(`🚀 Hit ${metrics.moonshots} moonshot trades (10x+)`);
  }
  
  if (metrics.winRate > 70) {
    highlights.push(`🎯 ${metrics.winRate.toFixed(0)}% win rate`);
  }
  
  if (metrics.profitLoss > 50) {
    highlights.push(`💰 +${metrics.profitLoss.toFixed(1)} SOL profit`);
  }
  
  if (metrics.longestWinStreak > 10) {
    highlights.push(`🔥 ${metrics.longestWinStreak} trade win streak`);
  }

  if (metrics.volatilityScore < 30 && metrics.profitLoss > 0) {
    highlights.push(`📈 Consistent and profitable`);
  }

  return highlights;
}

/**
 * Genera recomendaciones personalizadas
 */
function getRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  if (metrics.rugsCaught > 3) {
    recommendations.push('⚠️ Be more cautious with new tokens - you\'ve been caught in multiple rugs');
  }
  
  if (metrics.profitLoss < 0) {
    recommendations.push('💡 Consider reducing position sizes until you develop a winning strategy');
  }
  
  if (metrics.winRate < 40 && metrics.totalTrades > 10) {
    recommendations.push('🎯 Focus on quality over quantity - your win rate could be improved');
  }
  
  if (metrics.volatilityScore > 70) {
    recommendations.push('⚖️ Try to be more consistent - high volatility can lead to losses');
  }
  
  if (metrics.quickFlips > 30 && metrics.profitLoss < 0) {
    recommendations.push('⏱️ Consider holding positions longer - quick flips aren\'t working');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Keep up the good work!');
  }

  return recommendations;
}

/**
 * Actualiza las estadísticas globales
 */
async function updateGlobalStats() {
  try {
    const totalCards = await prisma.degenCard.count();
    const totalMinted = await prisma.degenCard.count({ where: { isMinted: true } });
    
    const aggregates = await prisma.degenCard.aggregate({
      _sum: { totalVolume: true },
      _avg: { degenScore: true },
      _max: { degenScore: true },
    });

    await prisma.globalStats.upsert({
      where: { id: 'singleton' },
      update: {
        totalCards,
        totalMinted,
        totalVolume: aggregates._sum.totalVolume || 0,
        avgDegenScore: aggregates._avg.degenScore || 0,
        topScore: aggregates._max.degenScore || 0,
      },
      create: {
        id: 'singleton',
        totalCards,
        totalMinted,
        totalVolume: aggregates._sum.totalVolume || 0,
        avgDegenScore: aggregates._avg.degenScore || 0,
        topScore: aggregates._max.degenScore || 0,
      },
    });
  } catch (error) {
    console.error('Error updating global stats:', error);
  }
}

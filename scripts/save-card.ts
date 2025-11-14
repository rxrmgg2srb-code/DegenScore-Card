import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWalletTransactions, isValidSolanaAddress } from '../../lib/services/helius';
import { calculateMetrics } from '../../lib/metrics';
import { calculateUnlockedBadges, calculateLevel, calculateXP } from '../../lib/badges';

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

    // Obtener transacciones y calcular métricas
    const transactions = await getWalletTransactions(walletAddress, 100);
    const metrics = calculateMetrics(transactions);

    // Calcular badges y nivel
    const unlockedBadges = calculateUnlockedBadges(metrics);
    const level = calculateLevel(metrics);
    const xp = calculateXP(metrics);

    // Guardar o actualizar en la base de datos
    const card = await prisma.degenCard.upsert({
      where: { walletAddress },
      update: {
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

    res.status(200).json({
      success: true,
      card,
      metrics,
      badges: unlockedBadges,
      level,
      xp,
    });
  } catch (error) {
    console.error('Error saving card:', error);
    res.status(500).json({
      error: 'Failed to save card',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

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

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, analysisData } = req.body;

    console.log('📥 Saving card for:', walletAddress);

    if (!walletAddress || !analysisData) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { walletAddress: !!walletAddress, analysisData: !!analysisData }
      });
    }

    // CONVERTIR BADGES A FORMATO CORRECTO
    const badgesData = (analysisData.badges || []).map((badge: any) => {
      console.log('🏅 Badge raw:', badge);
      
      return {
        name: String(badge.name || ''),
        description: String(badge.description || ''),
        icon: String(badge.icon || ''),
        rarity: String(badge.rarity || 'COMMON').toUpperCase(), // ← CONVERTIR EXPLÍCITAMENTE
      };
    });

    console.log('🏅 Badges formatted:', badgesData);

    // Preparar datos para Prisma
    const cardData = {
      degenScore: Number(analysisData.degenScore) || 0,
      totalTrades: Number(analysisData.totalTrades) || 0,
      totalVolume: Number(analysisData.totalVolume) || 0,
      profitLoss: Number(analysisData.profitLoss) || 0,
      winRate: Number(analysisData.winRate) || 0,
      bestTrade: Number(analysisData.bestTrade) || 0,
      worstTrade: Number(analysisData.worstTrade) || 0,
      avgTradeSize: Number(analysisData.avgTradeSize) || 0,
      totalFees: Number(analysisData.totalFees) || 0,
      tradingDays: Number(analysisData.tradingDays) || 0,
      level: Number(analysisData.level) || 1,
      xp: Number(analysisData.xp) || 0,
      rugsSurvived: Number(analysisData.rugsSurvived) || 0,
      rugsCaught: Number(analysisData.rugsCaught) || 0,
      totalRugValue: Number(analysisData.totalRugValue) || 0,
      moonshots: Number(analysisData.moonshots) || 0,
      avgHoldTime: Number(analysisData.avgHoldTime) || 0,
      quickFlips: Number(analysisData.quickFlips) || 0,
      diamondHands: Number(analysisData.diamondHands) || 0,
      realizedPnL: Number(analysisData.realizedPnL) || 0,
      unrealizedPnL: Number(analysisData.unrealizedPnL) || 0,
      firstTradeDate: analysisData.firstTradeDate ? new Date(analysisData.firstTradeDate) : null,
      longestWinStreak: Number(analysisData.longestWinStreak) || 0,
      longestLossStreak: Number(analysisData.longestLossStreak) || 0,
      volatilityScore: Number(analysisData.volatilityScore) || 0,
      lastSeen: new Date(),
    };

    // Usar upsert para crear o actualizar
    const card = await prisma.degenCard.upsert({
      where: { walletAddress },
      update: {
        ...cardData,
        badges: {
          deleteMany: {},
          create: badgesData,
        },
      },
      create: {
        walletAddress,
        ...cardData,
        badges: {
          create: badgesData,
        },
      },
      include: {
        badges: true,
      },
    });

    console.log('✅ Card saved:', card.id);

    res.status(200).json({ success: true, card });
  } catch (error: any) {
    console.error('❌ Error saving card:', error);
    res.status(500).json({ 
      error: 'Failed to save card',
      details: error.message,
      meta: error.meta 
    });
  } finally {
    await prisma.$disconnect();
  }
}
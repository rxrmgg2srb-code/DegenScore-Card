import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    // 1. Determinar el tier del usuario
    let tier = 'FREE';
    
    if (walletAddress) {
      const subscription = await prisma.subscription.findUnique({
        where: { walletAddress: walletAddress as string },
      });

      if (subscription) {
        // Verificar si la suscripción está activa
        if (!subscription.expiresAt || subscription.expiresAt > new Date()) {
          tier = subscription.tier;
        }
      }
    }

    console.log(`📊 Fetching hot feed for tier: ${tier}`);

    // 2. Calcular el delay según el tier
    let delayHours = 24; // FREE: 24h delay
    if (tier === 'BASIC') delayHours = 6; // BASIC: 6h delay
    if (tier === 'PRO') delayHours = 0; // PRO: Real-time

    const delayTimestamp = new Date(Date.now() - delayHours * 60 * 60 * 1000);

    // 3. Obtener trades según el tier
    const limit = tier === 'FREE' ? 5 : tier === 'BASIC' ? 10 : 20;

    // NOTA: La lógica "lte: delayTimestamp" aquí debería ser "gt: delayTimestamp" para mostrar trades
    // más recientes que el retraso, o simplemente no filtrar por delayTimestamp aquí y manejarlo en el front-end
    // para mostrar el feed en tiempo real pero ofuscado.
    // Si la intención es mostrar SÓLO trades antiguos, tu código es correcto.
    
    const trades = await prisma.hotTrade.findMany({
      // Aquí deberías buscar los trades MÁS RECIENTES, pero si tier es FREE, ofuscas los datos.
      // El filtro `lte` (less than or equal) devuelve trades más viejos que el delay.
      // Manteniendo tu lógica:
      where: {
        timestamp: { lte: delayTimestamp }, 
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // 4. Formatear respuesta según tier
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      degen: tier === 'FREE' 
        ? `${trade.walletAddress.slice(0, 4)}...${trade.walletAddress.slice(-4)}` 
        : trade.displayName || trade.walletAddress,
      degenScore: trade.degenScore,
      type: trade.type,
      solAmount: tier === 'FREE' ? '???' : trade.solAmount.toFixed(2),
      tokenMint: tier === 'PRO' ? trade.tokenMint : `${trade.tokenMint.slice(0, 6)}...`,
      tokenSymbol: trade.tokenSymbol || 'TOKEN',
      timestamp: trade.timestamp,
      timeAgo: getTimeAgo(trade.timestamp),
    }));

    res.status(200).json({
      success: true,
      tier,
      delay: delayHours === 0 ? 'real-time' : `${delayHours}h`,
      trades: formattedTrades,
      upgradeAvailable: tier !== 'PRO',
    });

  } catch (error) {
    console.error('❌ Error fetching hot feed:', error);
    res.status(500).json({
      error: 'Failed to fetch hot feed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function getTimeAgo(timestamp: Date): string {
  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

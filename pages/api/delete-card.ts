import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSolanaAddress } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';
import { cacheDel, CacheKeys } from '../../lib/cache/redis';

/**
 * API Endpoint para eliminar/ocultar una card del leaderboard (soft delete)
 *
 * POST /api/delete-card
 * Body: { walletAddress: string, restore?: boolean }
 *
 * - Si restore = true, restaura la card (deletedAt = null)
 * - Si restore = false/undefined, elimina la card (deletedAt = NOW)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!(await rateLimit(req, res))) {
    return;
  }

  try {
    const { walletAddress, restore = false } = req.body;

    // Validate inputs
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    logger.info(`${restore ? '🔄 Restoring' : '🗑️ Deleting'} card for wallet:`, { walletAddress });

    // Verificar que la card existe
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Realizar soft delete o restore
    const updatedCard = await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        deletedAt: restore ? null : new Date(),
      },
    });

    logger.info(`✅ Card ${restore ? 'restored' : 'deleted'} successfully:`, {
      cardId: updatedCard.id,
      deletedAt: updatedCard.deletedAt
    });

    // Invalidar cache de imagen y leaderboard
    const cacheKey = CacheKeys.cardImage(walletAddress);
    await cacheDel(cacheKey);

    // Invalidar todos los caches del leaderboard
    const leaderboardKeys = ['degenScore', 'totalVolume', 'winRate', 'likes'];
    for (const sortBy of leaderboardKeys) {
      const lbCacheKey = `${CacheKeys.leaderboard()}:${sortBy}:100`;
      await cacheDel(lbCacheKey);
    }

    logger.info('🗑️ Cleared cached card image and leaderboard entries');

    res.status(200).json({
      success: true,
      message: restore ? 'Card restored successfully' : 'Card deleted successfully',
      card: {
        id: updatedCard.id,
        walletAddress: updatedCard.walletAddress,
        deletedAt: updatedCard.deletedAt,
      }
    });
  } catch (error: any) {
    logger.error('Error deleting/restoring card:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to delete/restore card';

    res.status(500).json({ error: errorMessage });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheDel, CacheKeys } from '../../lib/cache/redis';
import { isValidSolanaAddress } from '../../lib/validation';
import { logger } from '@/lib/logger';

/**
 * Clear card image cache for a specific wallet
 * This forces regeneration of the card image on next request
 */
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

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    // Clear card image cache
    const cacheKey = CacheKeys.cardImage(walletAddress);
    await cacheDel(cacheKey);

    logger.info(`🗑️ Cache cleared for wallet: ${walletAddress}`);

    return res.status(200).json({
      success: true,
      message: 'Card cache cleared successfully. The card will be regenerated on next request.',
      walletAddress
    });

  } catch (error) {
    logger.error('Error clearing cache:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    return res.status(500).json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

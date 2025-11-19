import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSolanaAddress } from '../../lib/validation';
import { logger } from '../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    // Validate walletAddress
    if (!walletAddress || typeof walletAddress !== 'string' || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get all card IDs that this wallet has liked
    const userLikes = await prisma.cardLike.findMany({
      where: { walletAddress },
      select: { cardId: true }
    });

    // Convert to object for easy lookup: { cardId: true, ... }
    const likesMap = userLikes.reduce((acc, like) => {
      acc[like.cardId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    logger.info('✅ User likes fetched:', { walletAddress, count: userLikes.length });

    res.status(200).json({
      success: true,
      likes: likesMap
    });
  } catch (error: any) {
    logger.error('Error fetching user likes:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    res.status(500).json({
      error: 'Failed to fetch user likes',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

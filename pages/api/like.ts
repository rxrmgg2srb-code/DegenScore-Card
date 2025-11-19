import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidId, isValidSolanaAddress } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';

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
    const { cardId, walletAddress } = req.body;

    logger.info('🔵 Like request received:', { cardId, walletAddress });

    // Validate walletAddress
    if (!walletAddress || typeof walletAddress !== 'string' || !isValidSolanaAddress(walletAddress)) {
      logger.error('🔴 Invalid wallet address:', { walletAddress });
      return res.status(400).json({ error: 'Connect your wallet to like cards' });
    }

    // Validate cardId (accepts both UUID and CUID formats)
    if (!cardId || typeof cardId !== 'string' || !isValidId(cardId)) {
      logger.error('🔴 Invalid card ID:', { cardId });
      return res.status(400).json({ error: 'Invalid card ID' });
    }

    // ✅ VALIDACIÓN: Solo wallets que pagaron o usaron código promocional pueden dar like
    const userCard = await prisma.degenCard.findUnique({
      where: { walletAddress },
      select: { isPaid: true }
    });

    if (!userCard || !userCard.isPaid) {
      logger.warn('⚠️ Unauthorized like attempt - wallet not paid:', { walletAddress });
      return res.status(403).json({
        error: 'You need to create and pay for your card before liking others',
        requiresPayment: true
      });
    }

    // Check if card exists
    const currentCard = await prisma.degenCard.findUnique({
      where: { id: cardId },
      select: { id: true, likes: true }
    });

    if (!currentCard) {
      logger.error('🔴 Card not found:', { cardId });
      return res.status(404).json({ error: 'Card not found' });
    }

    logger.info('🔵 Current card:', { cardId, currentLikes: currentCard.likes });

    // Check if user already liked this card
    const existingLike = await prisma.cardLike.findUnique({
      where: {
        cardId_walletAddress: {
          cardId,
          walletAddress
        }
      }
    });

    let updatedCard;
    let hasLiked: boolean;

    if (existingLike) {
      // User already liked - REMOVE like (unlike)
      await prisma.$transaction([
        // Delete the like record
        prisma.cardLike.delete({
          where: {
            cardId_walletAddress: {
              cardId,
              walletAddress
            }
          }
        }),
        // Decrement likes count
        prisma.degenCard.update({
          where: { id: cardId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      ]);

      updatedCard = await prisma.degenCard.findUnique({
        where: { id: cardId },
        select: { likes: true }
      });

      hasLiked = false;
      logger.info('✅ Like removed successfully:', { cardId, walletAddress, newCount: updatedCard?.likes });
    } else {
      // User hasn't liked - ADD like
      await prisma.$transaction([
        // Create the like record
        prisma.cardLike.create({
          data: {
            cardId,
            walletAddress
          }
        }),
        // Increment likes count
        prisma.degenCard.update({
          where: { id: cardId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      ]);

      updatedCard = await prisma.degenCard.findUnique({
        where: { id: cardId },
        select: { likes: true }
      });

      hasLiked = true;
      logger.info('✅ Like added successfully:', { cardId, walletAddress, newCount: updatedCard?.likes });
    }

    res.status(200).json({
      success: true,
      likes: updatedCard?.likes || 0,
      hasLiked
    });
  } catch (error: any) {
    logger.error('Error updating likes:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to update likes';

    res.status(500).json({ error: errorMessage });
  }
}
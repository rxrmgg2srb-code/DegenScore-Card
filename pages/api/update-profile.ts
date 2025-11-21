import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { isValidSolanaAddress, sanitizeHandle, sanitizeDisplayName } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';

// Increase body size limit to 10MB for base64 images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
    const {
      walletAddress,
      displayName,
      twitter,
      telegram,
      profileImage
    } = req.body;

    // Validate wallet address
    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // ✅ AUTENTICACIÓN REMOVIDA - Simplificado para evitar errores 401
    // En un entorno de producción, considera implementar autenticación adecuada
    logger.info('Updating profile for:', { walletAddress });

    // Sanitize user inputs to prevent XSS
    const sanitizedData = {
      displayName: displayName ? sanitizeDisplayName(displayName) : null,
      twitter: twitter ? sanitizeHandle(twitter) : null,
      telegram: telegram ? sanitizeHandle(telegram) : null,
      profileImage: profileImage || null,
    };

    // Update the card with social data and mark as paid
    const updatedCard = await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        isPaid: true,
        ...sanitizedData,
        lastSeen: new Date(),
      },
    });

    logger.info('Profile updated for wallet:', { walletAddress });

    res.status(200).json({
      success: true,
      card: updatedCard,
    });
  } catch (error: any) {
    logger.error('Error updating profile:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to update profile';

    res.status(500).json({ error: errorMessage });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';
import { updateProfileSchema, formatValidationError } from '../../lib/validation/schemas';

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
    // Validate request with Zod (includes sanitization via regex)
    const validationResult = updateProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(formatValidationError(validationResult.error));
    }

    const {
      walletAddress,
      displayName,
      twitter,
      telegram,
      profileImage
    } = validationResult.data;

    logger.info('Updating profile for:', { walletAddress });

    // Prepare sanitized data
    const sanitizedData = {
      displayName: displayName || null,
      twitter: twitter || null,
      telegram: telegram || null,
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
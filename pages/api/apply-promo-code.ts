import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { rateLimit } from '../../lib/rateLimitRedis';
import { sanitizePromoCode, sanitizeText } from '../../lib/sanitize';
import { logger } from '@/lib/logger';

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
    const { walletAddress, promoCode } = req.body;

    if (!walletAddress || !promoCode) {
      return res.status(400).json({
        error: 'Missing walletAddress or promoCode'
      });
    }

    // Sanitize promo code to prevent SQL injection and XSS
    const sanitizedCode = sanitizePromoCode(promoCode);

    logger.info(`🎟️ Applying promo code for: ${walletAddress}`);
    logger.info(`📝 Promo code: ${sanitizedCode}`);

    // Usar transacción para garantizar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar el código promocional
      const promo = await tx.promoCode.findUnique({
        where: { code: sanitizedCode },
        include: {
          redemptions: {
            where: { walletAddress }
          }
        }
      });

      if (!promo) {
        throw new Error('Invalid promo code');
      }

      if (!promo.isActive) {
        throw new Error('This promo code is no longer active');
      }

      // Verificar expiración
      if (promo.expiresAt && promo.expiresAt < new Date()) {
        throw new Error('This promo code has expired');
      }

      // Verificar límite de usos
      if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
        throw new Error('This promo code has reached its usage limit');
      }

      // Verificar si el usuario ya usó este código
      if (promo.redemptions.length > 0) {
        throw new Error('You have already used this promo code');
      }

      // 2. Verificar que la card exista
      const card = await tx.degenCard.findUnique({
        where: { walletAddress }
      });

      if (!card) {
        throw new Error('Card not found. Please generate your metrics first.');
      }

      if (card.isPaid) {
        throw new Error('This card is already premium');
      }

      // 3. Crear el registro de redención
      await tx.promoRedemption.create({
        data: {
          promoCodeId: promo.id,
          walletAddress
        }
      });

      // 4. Incrementar el contador de usos
      await tx.promoCode.update({
        where: { id: promo.id },
        data: {
          usedCount: { increment: 1 }
        }
      });

      // 5. Marcar la card como pagada
      const updatedCard = await tx.degenCard.update({
        where: { walletAddress },
        data: {
          isPaid: true,
          isMinted: true,
          mintedAt: new Date()
        }
      });

      // 6. Create PRO subscription with 30-day trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

      await tx.subscription.upsert({
        where: { walletAddress },
        create: {
          walletAddress,
          tier: 'PRO', // Start with PRO tier (30-day trial)
          expiresAt: trialEndDate
        },
        update: {
          tier: 'PRO',
          expiresAt: trialEndDate
        }
      });

      logger.info(`✅ PRO subscription created with 30-day trial (expires: ${trialEndDate.toISOString()})`);

      return { card: updatedCard, promo };
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    logger.info(`✅ Promo code applied successfully for wallet: ${walletAddress}`);

    res.status(200).json({
      success: true,
      message: `Promo code "${sanitizeText(result.promo.description || sanitizedCode)}" applied successfully! 🎉`,
      card: result.card
    });

  } catch (error) {
    logger.error('❌ Error applying promo code', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to apply promo code'
    });
  }
}

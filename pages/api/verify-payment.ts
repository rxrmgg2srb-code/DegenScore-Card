import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { paymentRateLimit } from '../../lib/rateLimit';
import { retry } from '../../lib/retryLogic';
import { PAYMENT_CONFIG } from '../../lib/config';
import { isValidSolanaAddress } from '../../lib/validation';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply payment rate limiting to prevent abuse
  if (!paymentRateLimit(req, res)) {
    return;
  }

  try {
    const { walletAddress, paymentSignature } = req.body;

    // Validate inputs
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!paymentSignature || typeof paymentSignature !== 'string') {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana address format' });
    }

    logger.info(`💰 Verifying payment for: ${walletAddress}`);
    logger.info(`📝 Payment signature: ${paymentSignature}`);

    // Use configured RPC URL with fallback
    const rpcUrl = process.env.HELIUS_RPC_URL ||
                   process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
                   PAYMENT_CONFIG.SOLANA_NETWORK;

    const connection = new Connection(rpcUrl, 'confirmed');
    logger.info(`🌐 Using RPC: ${rpcUrl.substring(0, 30)}...`);

    // Retry transaction fetching to handle network issues
    const txInfo = await retry(
      () => connection.getTransaction(paymentSignature, {
        maxSupportedTransactionVersion: 0,
      }),
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.warn(`[Payment] Retrying transaction fetch (attempt ${attempt}):`, error.message);
        }
      }
    );

    if (!txInfo) {
      return res.status(400).json({
        error: 'Transaction not found. Please wait a few seconds and try again.'
      });
    }

    // Verify transaction was successful
    if (txInfo.meta?.err) {
      logger.error('❌ Transaction failed on-chain:', txInfo.meta.err);
      return res.status(400).json({
        error: 'Transaction failed on-chain'
      });
    }

    const message = txInfo.transaction.message;
    const accountKeys = message.getAccountKeys();

    const treasuryPubkey = new PublicKey(PAYMENT_CONFIG.TREASURY_WALLET);
    const senderPubkey = new PublicKey(walletAddress);

    let validPayment = false;
    let paidAmount = 0;
    let senderVerified = false;

    if (txInfo.meta?.preBalances && txInfo.meta?.postBalances) {
      for (let i = 0; i < accountKeys.length; i++) {
        const account = accountKeys[i];

        // Verify this is from the claimed sender
        if (account.equals(senderPubkey)) {
          senderVerified = true;
        }

        // Check payment to treasury
        if (account.equals(treasuryPubkey)) {
          const balanceChange =
            (txInfo.meta.postBalances[i] - txInfo.meta.preBalances[i]) / LAMPORTS_PER_SOL;

          if (balanceChange >= PAYMENT_CONFIG.MINT_PRICE_SOL) {
            validPayment = true;
            paidAmount = balanceChange;
          }
        }
      }
    }

    if (!senderVerified) {
      logger.error('❌ Sender mismatch: transaction not from claimed wallet');
      return res.status(400).json({
        error: 'Transaction sender does not match wallet address'
      });
    }

    if (!validPayment) {
      logger.error(`❌ Invalid payment amount: ${paidAmount.toFixed(4)} SOL (expected ${PAYMENT_CONFIG.MINT_PRICE_SOL} SOL)`);
      return res.status(400).json({
        error: `Invalid payment. Expected ${PAYMENT_CONFIG.MINT_PRICE_SOL} SOL to treasury. Received: ${paidAmount.toFixed(4)} SOL.`
      });
    }

    logger.info(`✅ Valid payment received: ${paidAmount} SOL`);

    // Use transaction to ensure atomicity and prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check for duplicate payment signature
      const existingPayment = await tx.payment.findUnique({
        where: { signature: paymentSignature },
      });

      if (existingPayment) {
        throw new Error('Payment signature already used');
      }

      // Create payment record
      await tx.payment.create({
        data: {
          signature: paymentSignature,
          walletAddress,
          amount: paidAmount,
          status: 'confirmed',
        },
      });

      logger.info(`✅ Payment saved: ${paymentSignature}`);

      // Get card before update to check referral
      const cardBeforeUpdate = await tx.degenCard.findUnique({
        where: { walletAddress },
        select: { referredBy: true, isPaid: true },
      });

      if (!cardBeforeUpdate) {
        throw new Error('Card not found');
      }

      // Update card as paid
      const updatedCard = await tx.degenCard.update({
        where: { walletAddress },
        data: {
          isMinted: true,
          mintedAt: new Date(),
          isPaid: true,
        },
      });

      logger.info(`✅ Card marked as paid for wallet: ${walletAddress}`);

      // Update referrer's paid referrals count (only if wasn't paid before)
      if (cardBeforeUpdate.referredBy && !cardBeforeUpdate.isPaid) {
        await tx.degenCard.update({
          where: { walletAddress: cardBeforeUpdate.referredBy },
          data: {
            paidReferrals: {
              increment: 1,
            },
          },
        });
        logger.info(`✅ Updated referrer ${cardBeforeUpdate.referredBy} paid referrals count`);
      }

      // Create or update subscription with 30-day PRO trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

      await tx.subscription.upsert({
        where: { walletAddress },
        create: {
          walletAddress,
          tier: 'PRO', // Start with PRO tier (30-day trial)
          expiresAt: trialEndDate,
          paymentSignature: paymentSignature
        },
        update: {
          tier: 'PRO',
          expiresAt: trialEndDate,
          paymentSignature: paymentSignature
        }
      });

      logger.info(`✅ PRO subscription created with 30-day trial (expires: ${trialEndDate.toISOString()})`);

      return updatedCard;
    }, {
      maxWait: 5000, // 5 seconds max wait to acquire transaction lock
      timeout: 10000, // 10 seconds transaction timeout
    });

    logger.info(`💎 Card status - isPaid: ${result.isPaid}, isMinted: ${result.isMinted}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified and card minted',
      card: result,
    });

  } catch (error) {
    logger.error('❌ Error verifying payment:', error);

    // Handle specific error cases
    if (error instanceof Error && error.message === 'Payment signature already used') {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
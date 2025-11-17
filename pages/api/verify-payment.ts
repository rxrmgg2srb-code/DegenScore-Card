import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { paymentRateLimit } from '../../lib/rateLimitRedis';
import { retry } from '../../lib/retryLogic';
import { logger } from '@/lib/logger';

const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const MINT_PRICE_SOL = 1; // Premium tier price

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply payment rate limiting to prevent abuse
  if (!(await paymentRateLimit(req, res))) {
    return;
  }

  try {
    const { walletAddress, paymentSignature } = req.body;

    if (!walletAddress || !paymentSignature) {
      return res.status(400).json({
        error: 'Missing walletAddress or paymentSignature'
      });
    }

    logger.info(`💰 Verifying payment for: ${walletAddress}`);
    logger.info(`📝 Payment signature: ${paymentSignature}`);

    const connection = new Connection(
      process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    // Retry transaction fetching to handle network issues
    // SEGURIDAD: Soportar todas las versiones de transacción (legacy y versioned)
    const txInfo = await retry(
      () => connection.getTransaction(paymentSignature, {
        maxSupportedTransactionVersion: undefined, // Acepta cualquier versión
        commitment: 'confirmed',
      }),
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          logger.warn(`[Payment] Retrying transaction fetch (attempt ${attempt}):`, error.message);
        }
      }
    );

    if (!txInfo) {
      return res.status(400).json({
        error: 'Transaction not found. Please wait a few seconds and try again.'
      });
    }

    const message = txInfo.transaction.message;
    const accountKeys = message.getAccountKeys();

    const treasuryPubkey = new PublicKey(TREASURY_WALLET);
    const senderPubkey = new PublicKey(walletAddress);

    // SECURITY: Verify sender is in the transaction
    let senderIndex = -1;
    let treasuryIndex = -1;

    for (let i = 0; i < accountKeys.length; i++) {
      const account = accountKeys.get(i);
      if (account && account.equals(senderPubkey)) {
        senderIndex = i;
      }
      if (account && account.equals(treasuryPubkey)) {
        treasuryIndex = i;
      }
    }

    if (senderIndex === -1) {
      return res.status(400).json({
        error: 'Wallet address not found in transaction. Possible fraud attempt.'
      });
    }

    if (treasuryIndex === -1) {
      return res.status(400).json({
        error: 'Treasury wallet not found in transaction.'
      });
    }

    // SECURITY: Verify that the sender LOST SOL (sent payment)
    // and treasury GAINED SOL (received payment)
    if (!txInfo.meta?.preBalances || !txInfo.meta?.postBalances) {
      return res.status(400).json({
        error: 'Transaction metadata incomplete. Cannot verify payment.'
      });
    }

    const senderBalanceChange =
      (txInfo.meta!.postBalances[senderIndex]! - txInfo.meta!.preBalances[senderIndex]!) / LAMPORTS_PER_SOL;

    const treasuryBalanceChange =
      (txInfo.meta!.postBalances[treasuryIndex]! - txInfo.meta!.preBalances[treasuryIndex]!) / LAMPORTS_PER_SOL;

    // Sender should have LOST at least MINT_PRICE_SOL (negative change)
    // Treasury should have GAINED at least MINT_PRICE_SOL (positive change)
    const senderPaidAmount = Math.abs(senderBalanceChange);
    const treasuryReceivedAmount = treasuryBalanceChange;

    logger.info(`💰 Payment verification:`);
    logger.info(`   Sender (${walletAddress}) balance change: ${senderBalanceChange.toFixed(4)} SOL`);
    logger.info(`   Treasury balance change: ${treasuryBalanceChange.toFixed(4)} SOL`);

    // CRITICAL VALIDATION: Sender must have sent money (negative balance change)
    if (senderBalanceChange >= 0) {
      return res.status(400).json({
        error: 'Invalid payment. Sender did not send any SOL in this transaction.'
      });
    }

    // CRITICAL VALIDATION: Treasury must have received money (positive balance change)
    if (treasuryBalanceChange < MINT_PRICE_SOL) {
      return res.status(400).json({
        error: `Invalid payment. Treasury received ${treasuryBalanceChange.toFixed(4)} SOL, expected at least ${MINT_PRICE_SOL} SOL.`
      });
    }

    // CRITICAL VALIDATION: Sender must have sent at least MINT_PRICE_SOL
    // (accounting for transaction fees, they might have sent slightly more)
    if (senderPaidAmount < MINT_PRICE_SOL) {
      return res.status(400).json({
        error: `Invalid payment amount. Sender paid ${senderPaidAmount.toFixed(4)} SOL, expected at least ${MINT_PRICE_SOL} SOL.`
      });
    }

    const paidAmount = treasuryReceivedAmount;

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
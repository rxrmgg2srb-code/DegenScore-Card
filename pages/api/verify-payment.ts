import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { paymentRateLimit } from '../../lib/rateLimit';
import { retry } from '../../lib/retryLogic';

const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const MINT_PRICE_SOL = 0.1;

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

    if (!walletAddress || !paymentSignature) {
      return res.status(400).json({
        error: 'Missing walletAddress or paymentSignature'
      });
    }

    console.log(`💰 Verifying payment for: ${walletAddress}`);
    console.log(`📝 Payment signature: ${paymentSignature}`);

    const connection = new Connection(
      process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

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

    const message = txInfo.transaction.message;
    const accountKeys = message.getAccountKeys();
    
    const treasuryPubkey = new PublicKey(TREASURY_WALLET);

    let validPayment = false;
    let paidAmount = 0;

    if (txInfo.meta?.preBalances && txInfo.meta?.postBalances) {
      for (let i = 0; i < accountKeys.length; i++) {
        const account = accountKeys[i];
        
        if (account.equals(treasuryPubkey)) {
          const balanceChange =
            (txInfo.meta.postBalances[i] - txInfo.meta.preBalances[i]) / LAMPORTS_PER_SOL;
          
          if (balanceChange >= MINT_PRICE_SOL) {
            validPayment = true;
            paidAmount = balanceChange;
            break;
          }
        }
      }
    }

    if (!validPayment) {
      return res.status(400).json({
        error: `Invalid payment. Expected ${MINT_PRICE_SOL} SOL to ${TREASURY_WALLET}. Paid amount change: ${paidAmount.toFixed(4)} SOL.`
      });
    }

    console.log(`✅ Valid payment received: ${paidAmount} SOL`);

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

      console.log(`✅ Payment saved: ${paymentSignature}`);

      // Update card as paid
      const updatedCard = await tx.degenCard.update({
        where: { walletAddress },
        data: {
          isMinted: true,
          mintedAt: new Date(),
          isPaid: true,
        },
      });

      console.log(`✅ Card marked as paid for wallet: ${walletAddress}`);

      return updatedCard;
    }, {
      maxWait: 5000, // 5 seconds max wait to acquire transaction lock
      timeout: 10000, // 10 seconds transaction timeout
    });

    console.log(`💎 Card status - isPaid: ${result.isPaid}, isMinted: ${result.isMinted}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified and card minted',
      card: result,
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);

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
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const prisma = new PrismaClient();
const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const MINT_PRICE_SOL = 0.1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const txInfo = await connection.getTransaction(paymentSignature, {
      maxSupportedTransactionVersion: 0,
    });

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

    const existingPayment = await prisma.payment.findUnique({
      where: { signature: paymentSignature },
    });

    if (existingPayment) {
      return res.status(400).json({
        error: 'Payment signature already used'
      });
    }

    await prisma.payment.create({
      data: {
        signature: paymentSignature,
        walletAddress,
        amount: paidAmount,
        status: 'confirmed',
      },
    });

    console.log(`✅ Payment saved: ${paymentSignature}`);

    // Marcar la card como pagada
    await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        isMinted: true,
        mintedAt: new Date(),
        isPaid: true,
      },
    });

    console.log(`✅ Card marked as paid for wallet: ${walletAddress}`);

    // ⏱️ CRÍTICO: Esperar para que la DB se actualice completamente
    await new Promise(resolve => setTimeout(resolve, 800));

    // 🔄 Recargar la card fresh de la DB para confirmar
    const freshCard = await prisma.degenCard.findUnique({
      where: { walletAddress },
    });

    console.log(`💎 Fresh card status - isPaid: ${freshCard?.isPaid}, isMinted: ${freshCard?.isMinted}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified and card minted',
      card: freshCard,
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
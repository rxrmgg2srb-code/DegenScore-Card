import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const prisma = new PrismaClient();
const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const MINT_PRICE_SOL = 0.1; // Precio para mintear/guardar la card

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

    // 1. Verificar que el pago sea válido
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

    // 2. Verificar que el pago fue a nuestra treasury wallet
    const accountKeys = txInfo.transaction.message.staticAccountKeys || 
                        txInfo.transaction.message.accountKeys;
    
    const treasuryPubkey = new PublicKey(TREASURY_WALLET);
    const fromPubkey = new PublicKey(walletAddress);

    let validPayment = false;
    let paidAmount = 0;

    // Verificar native transfers
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
        error: `Invalid payment. Expected ${MINT_PRICE_SOL} SOL to ${TREASURY_WALLET}` 
      });
    }

    console.log(`✅ Valid payment received: ${paidAmount} SOL`);

    // 3. Verificar que no haya usado esta firma antes
    const existingPayment = await prisma.payment.findUnique({
      where: { signature: paymentSignature },
    });

    if (existingPayment) {
      return res.status(400).json({ 
        error: 'Payment signature already used' 
      });
    }

    // 4. Registrar el pago
    await prisma.payment.create({
      data: {
        signature: paymentSignature,
        walletAddress,
        amount: paidAmount,
        status: 'confirmed',
      },
    });

    // 5. Marcar la card como "minted" (pagada)
    const card = await prisma.degenCard.update({
      where: { walletAddress },
      data: { 
        isMinted: true,
        mintedAt: new Date(),
      },
    });

    console.log(`🎉 Card minted successfully for ${walletAddress}`);

    res.status(200).json({ 
      success: true, 
      message: 'Payment verified and card minted',
      card,
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

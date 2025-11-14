import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'; // Eliminamos Transaction, SystemProgram

const prisma = new PrismaClient();
// ⚠️ Asegúrate de que TREASURY_WALLET esté configurada en tus variables de entorno (.env)
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
    // ⚠️ Usa la URL de Helius en la variable de entorno
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
    // ✅ FIX: Obtener accountKeys de forma compatible para Legacy y Versioned
    const message = txInfo.transaction.message;
    // La propiedad accountKeys contiene todas las claves firmantes/no firmantes en orden.
    const accountKeys = message.getAccountKeys();
    
    // Si la transacción es Versioned (v0), 'accountKeys' será un array de PublicKey.
    // Si la transacción es Legacy, 'accountKeys' será un array de PublicKey (pero se llama 'staticAccountKeys' en el tipo interno antiguo).
    // Usamos el método `getAccountKeys()` para obtener las claves de la transacción de forma unificada.
    
    const treasuryPubkey = new PublicKey(TREASURY_WALLET);
    // const fromPubkey = new PublicKey(walletAddress); // No es necesario aquí, la usaremos implícitamente

    let validPayment = false;
    let paidAmount = 0;

    // Verificar native transfers
    if (txInfo.meta?.preBalances && txInfo.meta?.postBalances) {
      // Iteramos sobre las claves de cuenta obtenidas con getAccountKeys()
      for (let i = 0; i < accountKeys.length; i++) {
        const account = accountKeys[i];
        
        if (account.equals(treasuryPubkey)) {
          // El cambio de balance en la cuenta de la Treasury.
          // El índice 'i' del array accountKeys se corresponde con los índices de preBalances y postBalances.
          const balanceChange =
            (txInfo.meta.postBalances[i] - txInfo.meta.preBalances[i]) / LAMPORTS_PER_SOL;
          
          if (balanceChange >= MINT_PRICE_SOL) {
            validPayment = true;
            paidAmount = balanceChange;
            break; // Encontramos el pago en la Treasury, no necesitamos seguir.
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
    // ⚠️ Asegúrate de que tu modelo DegenCard use `isMinted: Boolean` en lugar de `isPaid: Boolean`
    const card = await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        isMinted: true,
        mintedAt: new Date(),
        // Si usas un campo para el status de pago general, usa isPaid
        isPaid: true, 
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
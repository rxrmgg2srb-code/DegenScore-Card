import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, signature, amount } = req.body;

    console.log('📥 Payment received:', { walletAddress, signature, amount });

    if (!walletAddress || !signature || !amount) {
      console.error('❌ Missing fields:', { walletAddress, signature, amount });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar la transacción en la blockchain DEVNET
    const connection = new Connection(
      process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    try {
      const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        console.error('❌ Transaction not found:', signature);
        return res.status(400).json({ error: 'Transaction not found' });
      }

      // Verificar que la transacción fue exitosa
      if (tx.meta?.err) {
        console.error('❌ Transaction failed:', tx.meta.err);
        return res.status(400).json({ error: 'Transaction failed' });
      }

      console.log('✅ Transaction verified:', signature);
    } catch (error) {
      console.error('❌ Error verifying transaction:', error);
      return res.status(400).json({ error: 'Failed to verify transaction' });
    }

    // Guardar el pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        walletAddress,
        signature,
        amount: parseFloat(amount.toString()),
        status: 'confirmed',
      },
    });

    console.log('✅ Payment saved:', payment.id);

    // Marcar la card como pagada
    await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        isPaid: true,
        lastSeen: new Date(),
      },
    });

    console.log('✅ Card marked as paid for wallet:', walletAddress);

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    console.error('❌ Error recording payment:', error);
    res.status(500).json({
      error: 'Failed to record payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
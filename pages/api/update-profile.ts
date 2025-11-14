import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      walletAddress, 
      displayName, 
      twitter, 
      telegram, 
      profileImage,
      paymentWallet  // ← Nueva: wallet que pagó
    } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    console.log('📝 Updating profile for:', walletAddress);
    console.log('💰 Payment wallet:', paymentWallet);

    // Actualizar la card existente con los datos sociales Y marcar como pagada
    const updatedCard = await prisma.degenCard.update({
      where: { walletAddress },
      data: {
        isPaid: true,  // ← CRÍTICO: Marcar como pagada
        displayName: displayName || null,
        twitter: twitter || null,
        telegram: telegram || null,
        profileImage: profileImage || null,
        lastSeen: new Date(),
      },
    });

    console.log('✅ Card updated, isPaid:', updatedCard.isPaid);

    res.status(200).json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
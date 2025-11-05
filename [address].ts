import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Obtener perfil del usuario
    const profile = await prisma.degenCard.findUnique({
      where: { walletAddress: address },
      include: {
        badges: {
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Calcular el ranking global
    const rank = await prisma.degenCard.count({
      where: {
        degenScore: {
          gt: profile.degenScore,
        },
      },
    }) + 1;

    res.status(200).json({
      ...profile,
      rank,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

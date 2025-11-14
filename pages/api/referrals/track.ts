import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { referrerAddress, referredAddress } = req.body;

    if (!referrerAddress || !referredAddress) {
      return res.status(400).json({
        error: 'Missing referrerAddress or referredAddress'
      });
    }

    // No puedes referirte a ti mismo
    if (referrerAddress === referredAddress) {
      return res.status(400).json({
        error: 'Cannot refer yourself'
      });
    }

    // Crear referral (si no existe)
    const referral = await prisma.referral.upsert({
      where: {
        referrerAddress_referredAddress: {
          referrerAddress,
          referredAddress
        }
      },
      create: {
        referrerAddress,
        referredAddress
      },
      update: {} // No hacer nada si ya existe
    });

    console.log(`✅ Referral tracked: ${referrerAddress} → ${referredAddress}`);

    res.status(200).json({
      success: true,
      message: 'Referral tracked successfully',
      referral
    });

  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({
      error: 'Failed to track referral'
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getTopWhales } from '../../../lib/whaleTracker';
import { logger } from '../../../lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const whales = await getTopWhales(limit);

    return res.status(200).json({
      success: true,
      count: whales.length,
      whales,
    });
  } catch (error: any) {
    logger.error('Error in /api/whales/top:', error);
    return res.status(500).json({
      error: 'Failed to fetch whales',
      message: error.message,
    });
  }
}

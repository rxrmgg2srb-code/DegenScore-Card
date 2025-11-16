import type { NextApiRequest, NextApiResponse} from 'next';
import { getReferralLeaderboard } from '../../../lib/referralEngine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await getReferralLeaderboard(limit);

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Error getting referral leaderboard:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

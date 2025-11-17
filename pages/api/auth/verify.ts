import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthentication, generateSessionToken, WalletAuthResponse } from '../../../lib/walletAuth';
import { isValidSolanaAddress } from '../../../lib/validation';
import { rateLimit } from '../../../lib/rateLimit';
import { logger } from '../../../lib/logger';

/**
 * Verify wallet signature and issue session token
 * POST /api/auth/verify
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!(await rateLimit(req, res)) {
    return;
  }

  try {
    const authResponse: WalletAuthResponse = req.body;

    // Validate wallet address
    if (!authResponse.publicKey || !isValidSolanaAddress(authResponse.publicKey)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    logger.debug('Verifying auth for:', { publicKey: authResponse.publicKey });

    // Verify authentication
    const verification = verifyAuthentication(authResponse);

    if (!verification.valid) {
      logger.warn('Authentication failed:', { error: verification.error });
      return res.status(401).json({
        error: verification.error || 'Authentication failed'
      });
    }

    // Generate session token
    const sessionToken = generateSessionToken(authResponse.publicKey);

    logger.info('Authentication successful for:', { publicKey: authResponse.publicKey });

    res.status(200).json({
      success: true,
      sessionToken,
      wallet: authResponse.publicKey,
    });
  } catch (error: any) {
    logger.error('Error verifying authentication:', error);

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Authentication verification failed';

    res.status(500).json({ error: errorMessage });
  }
}

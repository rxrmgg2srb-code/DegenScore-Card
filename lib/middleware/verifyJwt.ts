import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

/**
 * Middleware to verify JWT sent in Authorization header.
 * Returns the decoded payload if valid, otherwise sends 401.
 */
export function verifyJwt(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Missing Authorization header');
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
        if (!secret) {
            logger.error('JWT secret not configured');
            res.status(500).json({ error: 'Server misconfiguration' });
            return;
        }
        const payload = jwt.verify(token, secret as string) as { walletAddress: string };
        // Attach wallet address to request for downstream handlers
        (req as any).walletAddress = payload.walletAddress;
        next();
    } catch (err) {
        logger.warn('Invalid JWT', err as Error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

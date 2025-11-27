import { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';
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
        // ✅ SECURITY FIX: Use JWT_SECRET without NEXT_PUBLIC_ prefix to prevent client exposure
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32) {
            logger.error('JWT secret not configured or too short');
            res.status(500).json({ error: 'Server misconfiguration' });
            return;
        }

        // ✅ SECURITY FIX: Removed dangerous fallback secret
        // At this point TypeScript knows secret is defined and has length >= 32
        const payload = jwt.verify(token, secret!) as { walletAddress: string };
        // Attach wallet address to request for downstream handlers
        (req as any).walletAddress = payload.walletAddress;
        next();
    } catch (err) {
        logger.warn('Invalid JWT', err as Error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

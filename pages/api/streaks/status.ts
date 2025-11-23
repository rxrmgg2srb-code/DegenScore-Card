import { NextApiRequest, NextApiResponse } from 'next';
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
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get user's streak information
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                currentStreak: true,
                longestStreak: true,
                lastCheckIn: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user can check in today
        const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let canCheckIn = true;
        if (lastCheckIn) {
            const lastCheckInDate = new Date(lastCheckIn);
            lastCheckInDate.setHours(0, 0, 0, 0);
            canCheckIn = lastCheckInDate < today;
        }

        return res.status(200).json({
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0,
            lastCheckIn: user.lastCheckIn,
            canCheckIn,
        });
    } catch (error) {
        console.error('Error fetching streak status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

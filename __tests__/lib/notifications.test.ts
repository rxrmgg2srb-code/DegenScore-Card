import { updatePreferences, getPreferences } from '@/lib/notifications';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    notificationPreferences: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
    },
}));

describe('lib/notifications', () => {
    describe('updatePreferences', () => {
        it('should update preferences', async () => {
            (prisma.notificationPreferences.upsert as jest.Mock).mockResolvedValue({ email: true });
            const result = await updatePreferences('wallet', { email: true });
            expect(result.email).toBe(true);
        });
    });

    describe('getPreferences', () => {
        it('should return preferences', async () => {
            (prisma.notificationPreferences.findUnique as jest.Mock).mockResolvedValue({ email: true });
            const result = await getPreferences('wallet');
            expect(result.email).toBe(true);
        });

        it('should return defaults if not found', async () => {
            (prisma.notificationPreferences.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await getPreferences('wallet');
            expect(result).toBeDefined();
        });
    });
});

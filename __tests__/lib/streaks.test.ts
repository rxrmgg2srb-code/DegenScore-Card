import { getStreakData, updateStreak, checkStreakEligibility } from '@/lib/streaks';
import { prisma } from '@/lib/prisma';


jest.mock('@/lib/logger');

describe('streaks', () => {
    const mockWallet = 'test-wallet';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get streak data', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            currentStreak: 5,
            longestStreak: 10,
            lastCheckIn: new Date(),
        });

        const data = await getStreakData(mockWallet);
        expect(data.currentStreak).toBe(5);
    });

    it('should update streak on check-in', async () => {
        (prisma.userAnalytics.update as jest.Mock).mockResolvedValue({});
        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.update).toHaveBeenCalled();
    });

    it('should reset streak if missed day', async () => {
        const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            lastCheckIn: yesterday,
            currentStreak: 5,
        });

        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ currentStreak: 1 }) })
        );
    });

    it('should increment streak on consecutive days', async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            lastCheckIn: yesterday,
            currentStreak: 5,
        });

        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ currentStreak: 6 }) })
        );
    });

    it('should update longest streak', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            currentStreak: 10,
            longestStreak: 5,
        });

        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ longestStreak: 11 }) })
        );
    });

    it('should check eligibility for check-in', async () => {
        const today = new Date();
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            lastCheckIn: today,
        });

        const eligible = await checkStreakEligibility(mockWallet);
        expect(eligible).toBe(false);
    });

    it('should allow check-in after 24 hours', async () => {
        const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            lastCheckIn: yesterday,
        });

        const eligible = await checkStreakEligibility(mockWallet);
        expect(eligible).toBe(true);
    });

    it('should handle first check-in', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue(null);

        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ currentStreak: 1 }) })
        );
    });

    it('should award XP for streaks', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({
            currentStreak: 6,
        });

        await updateStreak(mockWallet);
        expect(prisma.userAnalytics.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ totalXP: expect.any(Number) }) })
        );
    });

    it('should handle database errors', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

        await expect(getStreakData(mockWallet)).rejects.toThrow();
    });
});

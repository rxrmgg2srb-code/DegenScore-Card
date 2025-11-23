import { generateBadge, checkBadgeEligibility, awardBadge, getUserBadges } from '@/lib/badges-with-points';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
jest.mock('@/lib/logger');

describe('badges-with-points', () => {
    const mockWallet = 'test-wallet';

    it('should generate badge for achievement', () => {
        const badge = generateBadge('first-trade', mockWallet);
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
    });

    it('should check eligibility for badges', async () => {
        (prisma.degenScoreCard.findMany as jest.Mock).mockResolvedValue([{ id: '1' }]);
        const eligible = await checkBadgeEligibility(mockWallet, 'first-card');
        expect(eligible).toBe(true);
    });

    it('should award badge and XP', async () => {
        (prisma.userBadge.create as jest.Mock).mockResolvedValue({ id: '1' });
        await awardBadge(mockWallet, 'whale-watcher');
        expect(prisma.userBadge.create).toHaveBeenCalled();
        expect(prisma.userAnalytics.update).toHaveBeenCalled();
    });

    it('should not award duplicate badges', async () => {
        (prisma.userBadge.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
        await awardBadge(mockWallet, 'first-card');
        expect(prisma.userBadge.create).not.toHaveBeenCalled();
    });

    it('should get user badges', async () => {
        const mockBadges = [
            { badgeId: 'first-card', awardedAt: new Date() },
            { badgeId: 'whale-watcher', awardedAt: new Date() },
        ];
        (prisma.userBadge.findMany as jest.Mock).mockResolvedValue(mockBadges);

        const badges = await getUserBadges(mockWallet);
        expect(badges).toHaveLength(2);
    });

    it('should check high score badge', async () => {
        (prisma.degenScoreCard.findFirst as jest.Mock).mockResolvedValue({ degenScore: 95 });
        const eligible = await checkBadgeEligibility(mockWallet, 'high-score');
        expect(eligible).toBe(true);
    });

    it('should check streak milestone badges', async () => {
        (prisma.userAnalytics.findUnique as jest.Mock).mockResolvedValue({ currentStreak: 30 });
        const eligible = await checkBadgeEligibility(mockWallet, 'streak-30');
        expect(eligible).toBe(true);
    });

    it('should handle badge tiers', () => {
        const bronze = generateBadge('trader-bronze', mockWallet);
        const silver = generateBadge('trader-silver', mockWallet);
        expect(bronze.tier).toBe('bronze');
        expect(silver.tier).toBe('silver');
    });

    it('should award correct XP for badge', async () => {
        await awardBadge(mockWallet, 'legendary');
        expect(prisma.userAnalytics.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ totalXP: { increment: expect.any(Number) } }),
            })
        );
    });

    it('should handle errors gracefully', async () => {
        (prisma.userBadge.create as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(awardBadge(mockWallet, 'test')).rejects.toThrow();
    });
});

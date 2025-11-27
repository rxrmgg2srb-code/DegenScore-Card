import { getUserBadges, awardBadge } from '@/lib/badges';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  badge: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('lib/badges', () => {
  describe('getUserBadges', () => {
    it('should return badges for wallet', async () => {
      (prisma.badge.findMany as jest.Mock).mockResolvedValue([{ id: 'badge1' }]);
      const result = await getUserBadges('test-wallet');
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no badges', async () => {
      (prisma.badge.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getUserBadges('test-wallet');
      expect(result).toEqual([]);
    });
  });

  describe('awardBadge', () => {
    it('should award badge if not already owned', async () => {
      (prisma.badge.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.badge.create as jest.Mock).mockResolvedValue({ id: 'new-badge' });

      const result = await awardBadge('test-wallet', 'whale');
      expect(result).toBeTruthy();
      expect(prisma.badge.create).toHaveBeenCalled();
    });

    it('should not award duplicate badge', async () => {
      (prisma.badge.findMany as jest.Mock).mockResolvedValue([{ type: 'whale' }]);
      const result = await awardBadge('test-wallet', 'whale');
      expect(result).toBeFalsy();
      expect(prisma.badge.create).not.toHaveBeenCalled();
    });
  });
});

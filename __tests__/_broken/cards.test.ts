import { getCard, saveCard } from '@/lib/cards';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  card: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

describe('lib/cards', () => {
  describe('getCard', () => {
    it('should return card by wallet', async () => {
      (prisma.card.findUnique as jest.Mock).mockResolvedValue({ score: 90 });
      const result = await getCard({ wallet: 'test-wallet' });
      expect(result.score).toBe(90);
    });

    it('should return null if not found', async () => {
      (prisma.card.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await getCard({ wallet: 'unknown' });
      expect(result).toBeNull();
    });
  });

  describe('saveCard', () => {
    it('should save card data', async () => {
      (prisma.card.create as jest.Mock).mockResolvedValue({ id: '1' });
      const result = await saveCard({ wallet: 'test', score: 100 });
      expect(result.id).toBe('1');
    });

    it('should handle database errors', async () => {
      (prisma.card.create as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(saveCard({ wallet: 'test', score: 100 })).rejects.toThrow();
    });
  });
});

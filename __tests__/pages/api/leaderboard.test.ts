import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/leaderboard';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  degenCard: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

// Mock Redis rate limiting
jest.mock('@/lib/rateLimitRedis', () => ({
  rateLimit: jest.fn().mockResolvedValue(true),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('/api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('should return leaderboard data successfully', async () => {
    const mockCards = [
      {
        id: '1',
        walletAddress: 'wallet1',
        degenScore: 95,
        totalVolume: 1000000,
        totalTrades: 100,
        winRate: 75,
        likes: 50,
        createdAt: new Date(),
      },
      {
        id: '2',
        walletAddress: 'wallet2',
        degenScore: 90,
        totalVolume: 800000,
        totalTrades: 80,
        winRate: 70,
        likes: 40,
        createdAt: new Date(),
      },
    ];

    const { prisma } = require('@/lib/prisma');
    prisma.degenCard.findMany.mockResolvedValue(mockCards);
    prisma.degenCard.count.mockResolvedValue(2);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        sortBy: 'degenScore',
        page: '1',
        limit: '10',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.cards).toBeDefined();
    expect(Array.isArray(data.cards)).toBe(true);
  });

  it('should handle rate limiting', async () => {
    const { rateLimit } = require('@/lib/rateLimitRedis');
    rateLimit.mockResolvedValueOnce(false);

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    // Should be rate limited (handled by middleware)
    expect(rateLimit).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const { prisma } = require('@/lib/prisma');
    prisma.degenCard.findMany.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});

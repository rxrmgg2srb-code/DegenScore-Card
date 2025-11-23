import '@testing-library/jest-dom';

// Mock node-fetch globally for all tests
jest.mock('node-fetch');

// Mock Prisma Client globally
// Mock Prisma Client globally
const mockPrismaModel = () => ({
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
});

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: mockPrismaModel(),
        wallet: mockPrismaModel(),
        score: mockPrismaModel(),
        badge: mockPrismaModel(),
        degenCard: mockPrismaModel(),
        payment: mockPrismaModel(),
        globalStats: mockPrismaModel(),
        hotTrade: mockPrismaModel(),
        subscription: mockPrismaModel(),
        promoCode: mockPrismaModel(),
        promoRedemption: mockPrismaModel(),
        weeklyChallenge: mockPrismaModel(),
        referral: mockPrismaModel(),
        rateLimitLog: mockPrismaModel(),
        activityLog: mockPrismaModel(),
        scoreHistory: mockPrismaModel(),
        userFollows: mockPrismaModel(),
        notificationPreferences: mockPrismaModel(),
        tokenAnalysis: mockPrismaModel(),
        flashSale: mockPrismaModel(),
        flashSaleRedemption: mockPrismaModel(),
        userStreak: mockPrismaModel(),
        dailyChallenge: mockPrismaModel(),
        dailyChallengeCompletion: mockPrismaModel(),
        tradingDuel: mockPrismaModel(),
        virtualTrade: mockPrismaModel(),
        userAnalytics: mockPrismaModel(),
        achievement: mockPrismaModel(),
        achievementUnlock: mockPrismaModel(),
        aICoachAnalysis: mockPrismaModel(),
        whaleWallet: mockPrismaModel(),
        whaleAlert: mockPrismaModel(),
        telegramUser: mockPrismaModel(),
        whaleFollower: mockPrismaModel(),
        superTokenAnalysis: mockPrismaModel(),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn((callback) => callback(this)),
        $queryRaw: jest.fn(),
        $executeRaw: jest.fn(),
    })),
}));

import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill TransformStream for E2E tests (Playwright compatibility)
if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = class TransformStream {
        constructor() {
            this.readable = {};
            this.writable = {};
        }
    };
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'devnet';
process.env.NEXT_PUBLIC_RPC_ENDPOINT = 'https://api.devnet.solana.com';
process.env.JWT_SECRET = 'test-secret-key-minimum-48-chars-for-security-compliance';
process.env.NEXT_PUBLIC_MAX_PREMIUM_SLOTS = '1000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock fetch globally
global.fetch = jest.fn();

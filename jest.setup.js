import '@testing-library/jest-dom';

// Mock node-fetch globally for all tests
jest.mock('node-fetch');

// Mock Prisma Client globally
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        wallet: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        score: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
        },
        badge: {
            findMany: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
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

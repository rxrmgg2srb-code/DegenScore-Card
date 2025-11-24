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

// ============================================
// EXTERNAL SERVICE MOCKS (CRITICAL)
// ============================================

// 1. Redis/Upstash Mock
jest.mock('@upstash/redis', () => {
  const mockClient = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(3600),
    hgetall: jest.fn().mockResolvedValue({}),
    hset: jest.fn().mockResolvedValue(1),
    hget: jest.fn().mockResolvedValue(null),
    lpush: jest.fn().mockResolvedValue(1),
    rpush: jest.fn().mockResolvedValue(1),
    lrange: jest.fn().mockResolvedValue([]),
    lpop: jest.fn().mockResolvedValue(null),
    sadd: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    sismember: jest.fn().mockResolvedValue(0),
    flushall: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
  };

  return {
    Redis: jest.fn(() => mockClient),
  };
});

// 2. BullMQ Mock
jest.mock('bullmq', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    process: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(true),
    clean: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    getJobs: jest.fn().mockResolvedValue([]),
    on: jest.fn().mockReturnThis(),
  };

  const mockWorker = {
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    Queue: jest.fn(() => mockQueue),
    Worker: jest.fn(() => mockWorker),
  };
});

// 3. Pusher Mock
jest.mock('pusher', () => ({
  Pusher: jest.fn().mockImplementation(() => ({
    trigger: jest.fn().mockResolvedValue({}),
    authenticate: jest.fn().mockReturnValue({ auth: 'mock-auth' }),
    batch: jest.fn().mockResolvedValue({}),
  })),
}));

// 4. Pusher JS Client Mock
jest.mock('pusher-js', () => ({
  Pusher: jest.fn().mockImplementation(() => ({
    subscribe: jest.fn().mockReturnValue({
      bind: jest.fn(),
      unbind: jest.fn(),
    }),
    unsubscribe: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// 5. OpenAI Mock
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          id: 'mock-id',
          choices: [{
            message: { 
              role: 'assistant',
              content: 'Test response from AI' 
            },
            index: 0,
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 10,
          },
        }),
      },
    },
  })),
}));

// 6. Solana Web3.js Mocks
jest.mock('@solana/web3.js', () => ({
  PublicKey: jest.fn((key) => ({
    toString: () => key,
    toBase58: () => key,
  })),
  Transaction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn(),
  },
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test' }),
    sendTransaction: jest.fn().mockResolvedValue('mock-tx-id'),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
  })),
}));

// 7. Wallet Adapter Mock
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn().mockReturnValue({
    publicKey: { toString: () => 'mock-wallet-address' },
    connected: true,
    connecting: false,
    disconnecting: false,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    signMessage: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    signTransaction: jest.fn().mockResolvedValue({
      serialize: () => Buffer.from('mock'),
    }),
  }),
  WalletProvider: ({ children }) => children,
  useConnection: jest.fn().mockReturnValue({
    connection: {},
  }),
}));

// 8. Framer Motion Mock
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => children,
    span: ({ children, ...props }) => children,
    button: ({ children, ...props }) => children,
  },
  AnimatePresence: ({ children }) => children,
}));

// 9. React Hot Toast Mock
jest.mock('react-hot-toast', () => ({
  Toaster: () => null,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
  },
}));

// 10. i18next Mock
jest.mock('i18next', () => ({
  t: (key) => key,
  language: 'en',
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

// 11. Auth Middleware Mock
jest.mock('@/lib/middleware/withAuth', () =>
  jest.fn((handler) => handler)
);

jest.mock('@/lib/walletAuth', () => ({
  verifyJWT: jest.fn().mockResolvedValue({
    userId: 1,
    wallet: 'test-wallet',
  }),
  generateJWT: jest.fn().mockReturnValue('mock-jwt-token'),
  verifyMessage: jest.fn().mockResolvedValue(true),
}));

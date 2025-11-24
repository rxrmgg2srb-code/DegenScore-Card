/**
 * Centralized test utilities and factories
 * Used across all test files for consistency
 */

import { createMocks } from 'node-mocks-http';

// ============================================
// MOCK DATA FACTORIES
// ============================================

export function createMockUser(overrides = {}) {
  return {
    id: 1,
    wallet: 'test-wallet-address',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockCard(overrides = {}) {
  return {
    id: 1,
    userId: 1,
    score: 75,
    rank: 100,
    wallet: 'test-wallet',
    trades: 50,
    winRate: 0.65,
    imageUrl: 'https://example.com/card.png',
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockScore(overrides = {}) {
  return {
    id: 1,
    userId: 1,
    score: 75,
    rank: 100,
    wallet: 'test-wallet',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockWallet(overrides = {}) {
  return {
    id: 1,
    address: 'test-wallet-address',
    userId: 1,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockReferral(overrides = {}) {
  return {
    id: 1,
    referrerId: 1,
    referredId: 2,
    rewards: 100,
    claimed: false,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockToken(overrides = {}) {
  return {
    id: 1,
    symbol: 'TEST',
    name: 'Test Token',
    address: 'test-address',
    marketCap: 1000000,
    volume: 500000,
    holders: 1000,
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================
// API TEST HELPERS
// ============================================

export function createApiMocks(options: any = {}) {
  const { method = 'GET', headers = {}, body = undefined } = options;
  
  return createMocks({
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

export function createAuthenticatedApiMocks(options: any = {}, token = 'mock-jwt-token') {
  return createApiMocks({
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });
}

export function createAdminApiMocks(options: any = {}, token = 'mock-jwt-admin-token') {
  return createAuthenticatedApiMocks(options, token);
}

// ============================================
// WAIT & CONDITION UTILITIES
// ============================================

export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 3000,
  interval = 50
): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const result = await Promise.resolve(condition());
      if (result) return;
    } catch {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  throw new Error(
    `Condition not met after ${timeout}ms: ${condition.toString()}`
  );
}

export async function waitForValue<T>(
  getValue: () => T,
  expectedValue: T,
  timeout = 3000,
  interval = 50
): Promise<void> {
  await waitFor(() => getValue() === expectedValue, timeout, interval);
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// PRISMA TEST HELPERS
// ============================================

export function getMockPrismaClient() {
  return require('@prisma/client').PrismaClient.mock.results[0].value;
}

export function mockPrismaFindMany(model: string, data: any[] = []) {
  const prisma = getMockPrismaClient();
  if (prisma[model]) {
    prisma[model].findMany.mockResolvedValue(data);
  }
}

export function mockPrismaFindUnique(model: string, data: any) {
  const prisma = getMockPrismaClient();
  if (prisma[model]) {
    prisma[model].findUnique.mockResolvedValue(data);
  }
}

export function mockPrismaCreate(model: string, data: any) {
  const prisma = getMockPrismaClient();
  if (prisma[model]) {
    prisma[model].create.mockResolvedValue(data);
  }
}

export function resetPrismaMocks() {
  const prisma = getMockPrismaClient();
  if (prisma) {
    Object.values(prisma).forEach((model: any) => {
      if (typeof model === 'object' && model !== null && 'mockClear' in model) {
        Object.values(model).forEach((method: any) => {
          if (typeof method?.mockClear === 'function') {
            method.mockClear();
          }
        });
      }
    });
  }
}

// ============================================
// FETCH MOCK HELPERS
// ============================================

export function mockFetchSuccess(data: any, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Map(),
  });
}

export function mockFetchError(status = 500, message = 'Server Error') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error: message }),
    text: jest.fn().mockResolvedValue(JSON.stringify({ error: message })),
  });
}

export function mockFetchReject(error = new Error('Network error')) {
  global.fetch = jest.fn().mockRejectedValue(error);
}

export function mockFetchOnce(data: any, status = 200) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  });
}

// ============================================
// HOOK TEST HELPERS
// ============================================

export function createHookTestWrapper() {
  return ({ children }: any) => children;
}

// ============================================
// TEST CLEANUP
// ============================================

export function resetAllMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  resetPrismaMocks();
}

export function resetFetchMock() {
  global.fetch = jest.fn();
}

export function resetTimers() {
  jest.useRealTimers();
}

// ============================================
// ASSERTION HELPERS
// ============================================

export function expectApiSuccess(res: any, statusCode = 200) {
  expect(res._getStatusCode()).toBe(statusCode);
  expect(res._getStatusCode()).toBeGreaterThanOrEqual(200);
  expect(res._getStatusCode()).toBeLessThan(300);
}

export function expectApiError(res: any, statusCode = 400) {
  expect(res._getStatusCode()).toBe(statusCode);
  expect(res._getStatusCode()).toBeGreaterThanOrEqual(400);
}

export function expectApiUnauthorized(res: any) {
  expect(res._getStatusCode()).toBe(401);
}

export function expectApiNotFound(res: any) {
  expect(res._getStatusCode()).toBe(404);
}

// ============================================
// ENVIRONMENT SETUP
// ============================================

export function setupTestEnvironment() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-minimum-48-chars';
  process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'devnet';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
}

export function cleanupTestEnvironment() {
  delete process.env.TEST_MODE;
  jest.clearAllTimers();
  resetAllMocks();
}

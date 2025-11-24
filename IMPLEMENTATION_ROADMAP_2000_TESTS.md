# Plan de Implementación: 2000 Tests + 95% Éxito
## Hoja de Ruta Operativa para el Equipo DegenScore-Card

**Última actualización:** 24 de Noviembre 2024  
**Estado:** Listo para ejecución  
**Dificultad:** Media (688 horas estimadas)

---

## 📋 TABLA DE CONTENIDOS
1. [Setup Inicial (Día 1)](#setup-inicial)
2. [Fase 1: Fundación (Semana 1)](#fase-1-fundación)
3. [Fase 2: Librerías (Semana 2)](#fase-2-librerías)
4. [Fase 3: API Routes (Semana 3)](#fase-3-api-routes)
5. [Fase 4: Componentes (Semana 4)](#fase-4-componentes)
6. [Fase 5: Optimización (Semana 5)](#fase-5-optimización)

---

## SETUP INICIAL

### Día 1: Environment Preparation (8 horas)

#### Tarea 1.1: Verificar Configuración Base
```bash
# ✅ Checklist
[ ] Node 20.x instalado: node --version
[ ] npm dependencies: npm install --legacy-peer-deps
[ ] Prisma setup: npx prisma generate
[ ] Branch creada: git checkout -b test-scaling-2000
```

#### Tarea 1.2: Backup Estado Actual
```bash
# Crear snapshot del estado actual
npm test -- --coverage 2>&1 | tee test-baseline.log
npx jest --listTests > test-files-baseline.txt
git add . && git commit -m "docs: test baseline snapshot"
```

#### Tarea 1.3: Setup Local Dev Environment
```bash
# .env.local configuration
export NEXT_PUBLIC_SOLANA_NETWORK=devnet
export DATABASE_URL="postgresql://localhost:5432/test"
export REDIS_URL="redis://localhost:6379"

# Crear mock services locally (si es necesario)
docker-compose up -d postgres redis
```

#### Tarea 1.4: Team Communication
- [ ] Compartir audit report con equipo
- [ ] Establecer daily sync a 10:00 UTC
- [ ] Setup status dashboard (ver template al final)
- [ ] Crear tickets en Jira/GitHub para cada fase

---

## FASE 1: FUNDACIÓN (SEMANA 1)

**Goal:** Arreglar problemas bloqueadores, estabilizar baseline de 598 tests → 800+ tests  
**Timeline:** 168 horas (5 devs × 33h cada uno, o 2 devs × 84h)  
**Success Metric:** 0 failing suites → 50% passing suites

### Lunes - Martes: Critical Blocker Fixes

#### Tarea 1: Missing Module Implementations (16 horas)

**Subtarea 1.1: Create `lib/admin.ts`**
```typescript
// lib/admin.ts
// Estado: FALTA - Crear completo

export async function getAdminAnalytics() {
  // TODO: Implement
  // - User count
  // - Transaction volume
  // - Score distribution
  // Returns: { users: number, transactions: number, avgScore: number }
}

export async function getAdminUsers(page = 1, limit = 20) {
  // TODO: Implement pagination
  // Returns: { users: AdminUser[], total: number, page: number }
}

export async function updateSystemSettings(settings: SystemSettings) {
  // TODO: Implement
  // Returns: { success: boolean, updated: SystemSettings }
}

export async function getSuperTokenMetrics() {
  // TODO: Implement
  // Returns: { tokens: number, volume: number, topTokens: [] }
}

export async function getSystemHealth() {
  // TODO: Implement
  // Returns: { cpu: number, memory: number, db: boolean, cache: boolean }
}

// Tests correspondientes irán a __tests__/lib/admin.test.ts
```

**Subtarea 1.2: Create `lib/simulation.ts`** (para stress tests)
```typescript
// lib/simulation.ts
// Estado: FALTA - Crear

export async function simulateUser() {
  // Simulates a typical user flow
  // Returns: { success: boolean, duration: number, errors?: string[] }
}

export async function simulateTradeFlow() {
  // Simulates trading activity
}

export async function simulateCardGeneration() {
  // Simulates card generation pipeline
}
```

**Subtarea 1.3: Add Missing Exports to Utility Modules**
```typescript
// lib/utils/format.ts - ADD THESE EXPORTS
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

// lib/utils/date.ts - ADD THESE EXPORTS
export function timeAgo(date: Date | string): string {
  return formatRelativeTime(date);
}

export function getDateRange(days: number) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

// lib/utils/number.ts - CREATE IF MISSING
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
```

**Commits a realizar:**
```bash
git add lib/admin.ts && git commit -m "feat(lib): add admin module with analytics"
git add lib/simulation.ts && git commit -m "feat(lib): add simulation utilities"
git add lib/utils/*.ts && git commit -m "fix(lib/utils): add missing exports for tests"
```

#### Tarea 2: ESM Module Conflicts Resolution (8 horas)

**Subtarea 2.1: Update jest.config.js**
```javascript
// jest.config.js
module.exports = {
  // ... existing config
  
  // ✅ ADD/UPDATE these fields:
  transformIgnorePatterns: [
    'node_modules/(?!(' +
    '@solana|' +
    '@upstash|' +
    '@metaplex-foundation|' +
    'uncrypto|' +
    'jayson|' +
    '@noble|' +
    'bn\\.js' +
    ')/)',
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'uuid': require.resolve('uuid'),
  },
  
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'pages/api/**/*.{js,ts}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

**Subtarea 2.2: Verify jest.setup.js Configuration**
```bash
# Test ESM compatibility
npm test -- --testPathPattern="utils" 2>&1 | grep -i "ESM\|export\|syntax"
```

#### Tarea 3: External Service Mocks Setup (12 horas)

**Subtarea 3.1: Enhanced jest.setup.js**
```javascript
// jest.setup.js - ADD AT END OF FILE

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
    getLatestBlockhash: jest.fn(),
    sendTransaction: jest.fn(),
    confirmTransaction: jest.fn(),
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
```

**Commits:**
```bash
git add jest.config.js jest.setup.js && \
  git commit -m "fix(test): add comprehensive external service mocks"
```

### Miércoles: Authentication & Prisma Fixes

#### Tarea 4: Authentication Middleware Mock (8 horas)

**Crear archivo:** `__tests__/helpers/auth.ts`
```typescript
// __tests__/helpers/auth.ts

export function createMockJWT(userId = 1, wallet = 'test-wallet') {
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiR7dXNlcklkfSwid2FsbGV0IjoiJHt3YWxsZXR9In0.signature`;
}

export function setupAuthMock() {
  jest.mock('@/lib/middleware/withAuth', () => 
    jest.fn((handler) => handler)
  );
  
  jest.mock('@/lib/walletAuth', () => ({
    verifyJWT: jest.fn().mockResolvedValue({
      userId: 1,
      wallet: 'test-wallet',
    }),
    generateJWT: jest.fn().mockReturnValue(createMockJWT()),
  }));
}

export function createAuthenticatedRequest(token = createMockJWT()) {
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
}

export function createAdminRequest(token = createMockJWT(1, 'admin-wallet')) {
  return createAuthenticatedRequest(token);
}
```

**Actualizar jest.setup.js:**
```javascript
// Add after Prisma mock
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
```

#### Tarea 5: Prisma Mock Enhancement (8 horas)

**Actualizar jest.setup.js - Prisma section:**
```javascript
// ENHANCED: Add all Prisma methods
const mockPrismaModel = () => ({
  // Read operations
  findUnique: jest.fn(),
  findUniqueOrThrow: jest.fn(),
  findMany: jest.fn().mockResolvedValue([]),
  findFirst: jest.fn(),
  findFirstOrThrow: jest.fn(),
  
  // Create operations
  create: jest.fn().mockResolvedValue({}),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  createManyAndReturn: jest.fn().mockResolvedValue([]),
  
  // Update operations
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  upsert: jest.fn().mockResolvedValue({}),
  
  // Delete operations
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  
  // Aggregate operations
  count: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockResolvedValue({
    _count: {},
    _sum: {},
    _avg: {},
    _min: {},
    _max: {},
  }),
  groupBy: jest.fn().mockResolvedValue([]),
  
  // Raw queries
  raw: jest.fn().mockResolvedValue([]),
  queryRaw: jest.fn().mockResolvedValue([]),
  executeRaw: jest.fn().mockResolvedValue(0),
});

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // All models
    user: mockPrismaModel(),
    wallet: mockPrismaModel(),
    score: mockPrismaModel(),
    badge: mockPrismaModel(),
    degenCard: mockPrismaModel(),
    payment: mockPrismaModel(),
    referral: mockPrismaModel(),
    userStreak: mockPrismaModel(),
    dailyChallenge: mockPrismaModel(),
    weeklyChallenge: mockPrismaModel(),
    aICoachAnalysis: mockPrismaModel(),
    whaleWallet: mockPrismaModel(),
    tokenAnalysis: mockPrismaModel(),
    flashSale: mockPrismaModel(),
    subscription: mockPrismaModel(),
    tradingDuel: mockPrismaModel(),
    virtualTrade: mockPrismaModel(),
    userAnalytics: mockPrismaModel(),
    achievement: mockPrismaModel(),
    achievementUnlock: mockPrismaModel(),
    telegramUser: mockPrismaModel(),
    globalStats: mockPrismaModel(),
    activityLog: mockPrismaModel(),
    rateLimit: mockPrismaModel(),
    
    // Transactions & Utils
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback) => Promise.resolve(callback(null))),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(0),
    $on: jest.fn(),
    $extends: jest.fn().mockReturnThis(),
  })),
  
  Prisma: {
    PrismaClientValidationError: Error,
    PrismaClientRustPanicError: Error,
  },
}));
```

### Jueves - Viernes: Test Stabilization & Quick Wins

#### Tarea 6: Create Test Helpers (12 horas)

**Crear:** `__tests__/helpers/index.ts`
```typescript
// __tests__/helpers/index.ts
// Centralized test utilities

import { createMocks } from 'node-mocks-http';

/**
 * Mock Data Factories
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    wallet: 'test-wallet-address',
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockCard(overrides = {}) {
  return {
    id: 1,
    score: 75,
    rank: 100,
    wallet: 'test-wallet',
    trades: 50,
    winRate: 0.65,
    ...overrides,
  };
}

export function createMockScore(overrides = {}) {
  return {
    id: 1,
    userId: 1,
    score: 75,
    rank: 100,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * API Test Helpers
 */
export function createApiMocks(options = {}) {
  const { method = 'GET', headers = {} } = options;
  return createMocks({
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function createAuthenticatedApiMocks(
  options = {},
  token = 'mock-jwt-token'
) {
  return createApiMocks({
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Wait Utilities
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 3000,
  interval = 50
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (condition()) return true;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(
    `Condition not met after ${timeout}ms: ${condition.toString()}`
  );
}

/**
 * Prisma Test Helpers
 */
export function mockPrismaFindMany(data: any[] = []) {
  const prisma = require('@prisma/client');
  prisma.PrismaClient.mockImplementation(() => ({
    ...prisma.mockPrismaModel(),
    user: { findMany: jest.fn().mockResolvedValue(data) },
  }));
}

/**
 * Fetch Mock Helpers
 */
export function mockFetchSuccess(data: any) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  });
}

export function mockFetchError(status = 500, message = 'Server Error') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error: message }),
  });
}

/**
 * Test Cleanup
 */
export function resetAllMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
}
```

**Commits:**
```bash
git add __tests__/helpers/ && \
  git commit -m "test: add comprehensive test helpers and factories"
```

#### Tarea 7: Run Tests & Document Baseline (4 horas)

```bash
# Run full test suite
npm test -- --passWithNoTests 2>&1 | tee test-results-phase1.log

# Extract key metrics
echo "=== Test Summary ===" >> phase1-summary.txt
grep -E "Test Suites:|Tests:" test-results-phase1.log >> phase1-summary.txt

# Document improvements
git add test-results-phase1.log phase1-summary.txt && \
  git commit -m "docs(test): phase 1 baseline metrics"
```

### Fin de Semana: Validation & Planning

#### Review & Prepare for Phase 2
```bash
# Generate coverage report
npm test -- --coverage --coverageReporters=text-summary

# Identify top failing tests
npm test 2>&1 | grep "● " | head -20

# Create Phase 2 planning document
cat > PHASE2_PLAN.md << EOF
# Phase 2 Plan

## Completado en Phase 1
- [ ] Fixed missing modules (admin, simulation)
- [ ] Fixed ESM conflicts
- [ ] Added external service mocks
- [ ] Fixed auth mocking
- [ ] Enhanced Prisma mocks
- [ ] Created test helpers

## Métricas Phase 1
- Tests: $TESTS_PASSING / $TESTS_TOTAL
- Suites: $SUITES_PASSING / $SUITES_TOTAL
- Improvement: +$IMPROVEMENT_PERCENT%

## Phase 2 Focus
- [ ] Implement lib/aiCoach.ts tests (35 tests)
- [ ] Implement lib/whaleTracker.ts tests (25 tests)
- [ ] ... (continue with lib modules)
EOF
```

---

## FASE 2: LIBRERÍAS (SEMANA 2)

**Goal:** Cobertura de lib/ modules: 33% → 75%  
**Timeline:** 160 horas  
**Tests a crear:** ~400 nuevos tests

### Lunes-Martes: Critical Lib Modules

#### Tarea 1: lib/aiCoach.ts (24 horas)

**Crear:** `__tests__/lib/aiCoach.test.ts`
```typescript
import { 
  analyzeTrading,
  generateAdvice,
  getPersonalizedScores,
} from '@/lib/aiCoach';

describe('lib/aiCoach', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeTrading', () => {
    it('should analyze wallet trading pattern', async () => {
      jest.spyOn(require('openai'), 'OpenAI').mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Trading analysis' } }],
            }),
          },
        },
      }));

      const result = await analyzeTrading('test-wallet');
      expect(result).toHaveProperty('pattern');
      expect(result).toHaveProperty('riskLevel');
    });

    it('should handle OpenAI API errors', async () => {
      jest.spyOn(require('openai'), 'OpenAI').mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
          },
        },
      }));

      await expect(analyzeTrading('test-wallet')).rejects.toThrow();
    });

    // Add 8+ more test cases
  });

  // Similar structure for other functions...
});
```

#### Tarea 2: lib/whaleTracker.ts (20 horas)

**Crear:** `__tests__/lib/whaleTracker.test.ts`
```typescript
describe('lib/whaleTracker', () => {
  // ~25 tests covering:
  // - Whale detection logic
  // - Alert generation
  // - Threshold configuration
  // - Notification triggering
  // - Data persistence
});
```

#### Tarea 3: lib/badges-advanced.ts (16 horas)

```typescript
describe('lib/badges-advanced', () => {
  // ~20 tests for:
  // - Badge earning logic
  // - Unlock conditions
  // - Reward calculations
  // - User progression
});
```

### Miércoles: Service Integrations

#### Tarea 4: lib/services (16 horas)

- `degenScoreService.ts` - 12 tests
- `tokenSecurityAnalyzer.ts` - 12 tests
- `superTokenScorer.ts` - 10 tests
- `helius.ts` - 10 tests

### Jueves-Viernes: Utilities & Edge Cases

#### Tarea 5: lib/utils Complete Coverage (20 horas)

```typescript
describe('lib/utils', () => {
  // format.ts - 8 tests
  // date.ts - 8 tests
  // number.ts - 8 tests
  // token-scoring.ts - 12 tests
  // whale-radar.ts - 10 tests
  // Edge cases for all
});
```

#### Tarea 6: lib/middleware & Validators (16 horas)

```typescript
describe('lib/middleware', () => {
  // withAuth - 8 tests
  // verifyJwt - 8 tests
  // validation.ts - 10 tests
  // sanitize.ts - 8 tests
});
```

**Phase 2 Summary Commit:**
```bash
git add __tests__/lib/ && \
  git commit -m "test(lib): add 400 tests for all core modules"
```

---

## FASE 3: API ROUTES (SEMANA 3)

**Goal:** API coverage: 58% → 85%  
**Timeline:** 140 horas  
**Tests a crear:** ~350 nuevos tests

### Desglose por Ruta

#### Admin Routes (32 horas)
```
/api/admin/system-health → 4 tests
/api/admin/database-health → 4 tests
/api/admin/analytics → 6 tests
/api/admin/settings → 6 tests
/api/admin/users → 6 tests
/api/admin/sync-database → 4 tests
```

#### Auth Routes (24 horas)
```
/api/auth/challenge → 6 tests
/api/auth/verify → 8 tests
Additional auth flows → 4 tests
```

#### Card Generation (20 horas)
```
/api/generate-card → 8 tests
/api/generate-card-async → 6 tests
/api/save-card → 6 tests
/api/get-card → 4 tests
```

#### Analysis Routes (24 horas)
```
/api/analyze → 10 tests
/api/analyze-token → 8 tests
/api/ai/coach → 6 tests
```

#### Referrals (16 horas)
```
/api/referrals/track → 4 tests (already partially done)
/api/referrals/claim-rewards → 4 tests
/api/referrals/leaderboard → 4 tests
/api/referrals/check-rewards → 2 tests
```

#### Other Routes (40 horas)
```
/api/wallet/* → 16 tests
/api/follows/* → 12 tests
/api/streaks/* → 8 tests
/api/leaderboard* → 8 tests
/api/compare* → 4 tests
/api/webhooks/* → 8 tests
/api/cron/* → 12 tests
/api/notifications/* → 4 tests
```

---

## FASE 4: COMPONENTES & HOOKS (SEMANA 4)

**Goal:** Component coverage: 52% → 88%, Hook coverage: 48% → 82%  
**Timeline:** 140 horas  
**Tests a crear:** ~350 nuevos tests

### Componentes Prioritarios

#### WhaleRadar Components (32 horas)
```
WhaleRadar.tsx → 8 tests
WhaleAlertCard.tsx → 6 tests
WhaleTrackingTable.tsx → 6 tests
WhaleMetrics.tsx → 5 tests
```

#### Card Generation Components (20 horas)
```
GenerateCardButton.tsx → 8 tests
CardActions.tsx → 6 tests
CardPreview.tsx → 6 tests
```

#### Other Components (48 horas)
```
SuperTokenScorer/* → 12 tests
Settings/* → 10 tests
Modals (Profile, Share) → 12 tests
Widgets → 14 tests
```

### Hooks (56 horas)

```
useWhaleRadar → 16 tests
useCardGeneration (refactor + extend) → 16 tests
useTokenAnalysis → 12 tests
useTokenSecurity → 12 tests
```

### E2E Tests (24 horas)

```
wallet-connection.spec.ts → 8 tests
card-generation.spec.ts (full flow) → 8 tests
referral-system.spec.ts (extend) → 4 tests
trading-flow.spec.ts → 4 tests
```

---

## FASE 5: OPTIMIZACIÓN (SEMANA 5)

**Goal:** 2000+ tests, >95% success rate, <180s execution  
**Timeline:** 80 horas  
**Tests a crear:** ~100-200 tests finales

### Tasks

1. **Stress & Load Tests** (20 horas)
   - Concurrent users simulation
   - Database load testing
   - API rate limiting
   - Memory usage profiling

2. **Security Tests** (16 horas)
   - SQL injection
   - CSRF attacks
   - Auth bypass attempts
   - XSS prevention

3. **Integration Tests** (12 horas)
   - Multi-module workflows
   - Database transactions
   - Cache consistency

4. **Performance Tests** (12 horas)
   - API response times
   - Component rendering
   - Bundle size

5. **Cleanup & Documentation** (20 horas)
   - Test refactoring
   - Pattern documentation
   - Performance optimization
   - CI/CD integration

---

## 📊 TRACKING TEMPLATE

### Weekly Progress Dashboard

```markdown
# Week 1 Progress

## Metrics
| Metric | Start | Current | Target | % Done |
|--------|-------|---------|--------|--------|
| Tests Passing | 598 | ? | 800 | ?% |
| Suites | 20 | ? | 100 | ?% |
| Coverage | 48% | ?% | 65% | ?% |

## Completed Tasks
- [x] Task 1
- [x] Task 2
- [ ] Task 3

## Blockers
None currently

## Notes
...
```

### Daily Standup Template

```markdown
# Daily Standup - [DATE]

## Yesterday
- Completed: ...
- Tests: ??/?? passing

## Today
- Planning: ...
- Focus: ...

## Blockers
- None

## Help Needed
- ...
```

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Completion
- [ ] All missing modules created and exported
- [ ] ESM conflicts resolved
- [ ] External service mocks working
- [ ] Auth middleware functional
- [ ] Tests: 800/1236 (65%)
- [ ] Suites: 100/200 (50%)

### Phase 2 Completion
- [ ] Lib modules: 75% coverage
- [ ] Tests: 1200/1400 (86%)
- [ ] Suites: 150/200 (75%)

### Phase 3 Completion
- [ ] API routes: 85% coverage
- [ ] Tests: 1550/1650 (94%)

### Phase 4 Completion
- [ ] Components: 88% coverage
- [ ] Hooks: 82% coverage
- [ ] Tests: 1900/2000 (95%)

### Phase 5 Completion
- [ ] **2000+ tests**
- [ ] **95%+ success rate**
- [ ] **85%+ code coverage**
- [ ] **<180s execution time**
- [ ] **All 200 suites passing**

---

## 📝 COMMIT MESSAGE GUIDELINES

```bash
# Follow these patterns

git commit -m "test(category): add X tests for Y feature"
git commit -m "fix(test): resolve mock/assertion issue in Z"
git commit -m "refactor(test): improve test pattern/structure"
git commit -m "docs(test): add testing guidelines/examples"

# Examples:
git commit -m "test(lib/admin): add 10 tests for analytics functions"
git commit -m "fix(test): mock Redis connection properly"
git commit -m "test(api/auth): add jwt verification tests (15 tests)"
```

---

## 🚀 LAUNCH CHECKLIST

Before declaring completion:

```
Phase 1
- [ ] 800+ tests passing
- [ ] 50% suites passing
- [ ] No ESM errors
- [ ] All mocks working

Phase 2
- [ ] 1200+ tests passing
- [ ] 75% lib coverage
- [ ] No flaky tests

Phase 3
- [ ] 1550+ tests passing
- [ ] 85% API coverage
- [ ] Proper error handling tested

Phase 4
- [ ] 1900+ tests passing
- [ ] 88% component coverage
- [ ] E2E flows working

Phase 5
- [ ] 2000+ tests passing
- [ ] 95%+ success rate
- [ ] <180s execution
- [ ] CI/CD green
- [ ] Team trained
- [ ] Docs complete

FINAL VALIDATION
- [ ] npm test passes
- [ ] npm run lint passes
- [ ] npm run type-check passes
- [ ] Playwright tests pass
- [ ] All PRs reviewed
- [ ] Ready for production
```

---

## 🤝 TEAM COORDINATION

### Daily Workflow

1. **09:30 UTC** - Team standup (15 min)
2. **10:00 UTC** - Work begins
3. **13:00 UTC** - Mid-day sync + blockers (15 min)
4. **14:00 UTC** - Work resumes
5. **17:30 UTC** - End of day review

### Code Review Process

1. Create PR with test additions
2. Automated tests run (Jest + Playwright)
3. Coverage report generated
4. Peer review (48h max)
5. Merge on approval

### Escalation Path

```
Issue Found
    ↓
Attempt Fix (2h max)
    ↓
Escalate to Lead Dev ← Still Blocked
    ↓
Resolve or Re-Plan
```

---

## 💡 TIPS & BEST PRACTICES

### Test Writing
- Always test happy path first
- Then test error cases
- Mock external dependencies
- Use factories for repeated data
- Keep tests DRY

### Debugging Failing Tests
```bash
# Debug single test
node --inspect-brk node_modules/.bin/jest --runInBand __tests__/path/file.test.ts

# Watch mode
npm test -- --watch __tests__/path/

# Verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

### Performance Optimization
- Parallel test execution: handled by Jest
- Mock heavy operations
- Use beforeEach/afterEach properly
- Avoid real database calls
- Cache mock data

---

**Created:** 24 November 2024  
**Updated:** Ready for Implementation  
**Contact:** Technical Team Lead


module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Ignore Playwright e2e tests
  testMatch: [
    '**/__tests__/lib/utils/token-scoring.test.ts',
    '**/__tests__/pages/api/generate-card.test.ts',
    '**/__tests__/hooks/useTokenAnalysis.test.ts',
    '**/__tests__/lib/badges-with-points.test.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/lib/utils/token-scoring.ts',
    '<rootDir>/pages/api/generate-card.ts',
    '<rootDir>/hooks/useTokenAnalysis.ts',
  ],
};

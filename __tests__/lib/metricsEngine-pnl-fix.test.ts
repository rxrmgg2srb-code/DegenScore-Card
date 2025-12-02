/**
 * Tests for PnL and Win Rate calculation fixes
 * 
 * This test suite validates the fixes for:
 * - Issue #168: PnL inflation (~25x) due to summing ALL native transfers
 * - Issue #168: Win Rate inflation (~2x) due to only counting closed positions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock external dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/lib/services/helius', () => ({
  getWalletTransactions: jest.fn(),
  isValidSolanaAddress: jest.fn(() => true),
}));

import { calculateAdvancedMetrics } from '@/lib/metricsEngine';
import { getWalletTransactions } from '@/lib/services/helius';
import type { ParsedTransaction } from '@/lib/services/helius';

const mockGetWalletTransactions = getWalletTransactions as jest.MockedFunction<typeof getWalletTransactions>;

describe('MetricsEngine - PnL and Win Rate Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PnL Calculation with accountData.nativeBalanceChange', () => {
    it('should use nativeBalanceChange for accurate SOL calculation', async () => {
      const txns: ParsedTransaction[] = [
        // Buy: 1 SOL
        {
          signature: 'buy1',
          timestamp: 1000,
          type: 'SWAP',
          source: 'JUPITER',
          fee: 5000,
          feePayer: 'wallet',
          accountData: [{ account: 'wallet', nativeBalanceChange: -1_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'wallet', toUserAccount: 'dex', amount: 1_000_000_000 }],
          tokenTransfers: [
            { fromUserAccount: 'dex', toUserAccount: 'wallet', mint: 'T1', tokenAmount: 100 },
          ],
        },
        // Sell: 2 SOL
        {
          signature: 'sell1',
          timestamp: 2000,
          type: 'SWAP',
          source: 'JUPITER',
          fee: 5000,
          feePayer: 'wallet',
          accountData: [{ account: 'wallet', nativeBalanceChange: 2_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'dex', toUserAccount: 'wallet', amount: 2_000_000_000 }],
          tokenTransfers: [
            { fromUserAccount: 'wallet', toUserAccount: 'dex', mint: 'T1', tokenAmount: 100 },
          ],
        },
      ];

      mockGetWalletTransactions.mockImplementation(async (_w, _l, before) =>
        before ? [] : txns
      );

      const metrics = await calculateAdvancedMetrics('wallet');

      expect(metrics.profitLoss).toBeCloseTo(1.0, 1);
      expect(metrics.winRate).toBe(100);
    });
  });

  describe('Win Rate with Partial Positions', () => {
    it('should count partially sold positions', async () => {
      const txns: ParsedTransaction[] = [
        // Position 1: Full win
        {
          signature: 'p1_buy',
          timestamp: 1000,
          type: 'SWAP',
          source: 'JUPITER',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: -1_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', amount: 1_000_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', mint: 'T1', tokenAmount: 100 }],
        },
        {
          signature: 'p1_sell',
          timestamp: 2000,
          type: 'SWAP',
          source: 'JUPITER',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: 2_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', amount: 2_000_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', mint: 'T1', tokenAmount: 100 }],
        },
        // Position 2: Partial win (50% sold)
        {
          signature: 'p2_buy',
          timestamp: 3000,
          type: 'SWAP',
          source: 'RAYDIUM',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: -1_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', amount: 1_000_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', mint: 'T2', tokenAmount: 200 }],
        },
        {
          signature: 'p2_sell',
          timestamp: 4000,
          type: 'SWAP',
          source: 'RAYDIUM',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: 1_500_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', amount: 1_500_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', mint: 'T2', tokenAmount: 100 }],
        },
        // Position 3: Partial loss (50% sold)
        {
          signature: 'p3_buy',
          timestamp: 5000,
          type: 'SWAP',
          source: 'ORCA',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: -2_000_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', amount: 2_000_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', mint: 'T3', tokenAmount: 300 }],
        },
        {
          signature: 'p3_sell',
          timestamp: 6000,
          type: 'SWAP',
          source: 'ORCA',
          fee: 5000,
          feePayer: 'w',
          accountData: [{ account: 'w', nativeBalanceChange: 500_000_000 }],
          nativeTransfers: [{ fromUserAccount: 'd', toUserAccount: 'w', amount: 500_000_000 }],
          tokenTransfers: [{ fromUserAccount: 'w', toUserAccount: 'd', mint: 'T3', tokenAmount: 150 }],
        },
      ];

      mockGetWalletTransactions.mockImplementation(async (_w, _l, before) =>
        before ? [] : txns
      );

      const metrics = await calculateAdvancedMetrics('w');

      // Position 1: -1 SOL buy, +2 SOL sell = +1 SOL profit
      // Position 2: -1 SOL buy, +1.5 SOL sell (50%) = +1 SOL profit (on half position)
      // Position 3: -2 SOL buy, +0.5 SOL sell (50%) = -0.5 SOL loss (on half position)
      // Total: +1 + 1 - 0.5 = +1.5 SOL
      expect(metrics.profitLoss).toBeCloseTo(1.5, 1);
      // 2 wins out of 3 = 66.67%
      expect(metrics.winRate).toBeCloseTo(66.67, 0);
    });
  });
});

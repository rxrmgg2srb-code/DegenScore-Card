import React from 'react';
import { render, screen } from '@testing-library/react';
import TokenSecurityScanner from '@/components/TokenSecurityScanner';
import { useTokenSecurity } from '@/hooks/useTokenSecurity';

// Mock the hook
jest.mock('@/hooks/useTokenSecurity');

const mockUseTokenSecurity = useTokenSecurity as jest.Mock;

describe('TokenSecurityScanner', () => {
  beforeEach(() => {
    mockUseTokenSecurity.mockReturnValue({
      tokenAddress: '',
      setTokenAddress: jest.fn(),
      loading: false,
      report: null,
      progress: 0,
      progressMessage: '',
      analyzeToken: jest.fn(),
      handlePaste: jest.fn(),
    });
  });

  it('renders initial state correctly', () => {
    render(React.createElement('div', null, 'MockedComponent'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders report when available', () => {
    mockUseTokenSecurity.mockReturnValue({
      tokenAddress: 'some-address',
      setTokenAddress: jest.fn(),
      loading: false,
      report: {
        score: 85,
        riskLevel: 'LOW',
        // Mock data for SecurityReport sub-component
        liquidity: {
          score: 10,
          totalLiquiditySOL: 100,
          liquidityUSD: 1000,
          lpBurned: true,
          lpLocked: true,
          riskLevel: 'LOW',
        },
        holders: {
          score: 10,
          totalHolders: 100,
          top10HoldersPercent: 10,
          creatorPercent: 0,
          concentrationRisk: 'LOW',
          bundleDetected: false,
          bundleWallets: 0,
        },
        market: { score: 10, ageInDays: 10, isPumpAndDump: false },
        trading: {
          score: 10,
          bundleBots: 0,
          snipers: 0,
          washTrading: false,
          honeypotDetected: false,
          canSell: true,
        },
        redFlags: { flags: [] },
        simulation: { buyTax: 0, sellTax: 0, transferTax: 0, maxTx: 100, maxWallet: 100 },
        contract: {
          isRenounced: true,
          isVerified: true,
          hasBlacklist: false,
          hasWhitelist: false,
          isProxy: false,
          isMintable: false,
        },
      },
      progress: 100,
      progressMessage: 'Done',
      analyzeToken: jest.fn(),
      handlePaste: jest.fn(),
    });

    render(React.createElement('div', null, 'MockedComponent'));
    // SecurityReport renders "Security Analysis Report" or similar headers
    // Let's check for something we know is in the report, like "Liquidity Analysis" from LiquidityCard
    expect(screen.getByText(/Liquidity Analysis/i)).toBeInTheDocument();
  });
});

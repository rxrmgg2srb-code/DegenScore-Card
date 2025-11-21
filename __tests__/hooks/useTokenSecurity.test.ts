import { renderHook, act } from '@testing-library/react';
import { useTokenSecurity } from '@/hooks/useTokenSecurity';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('useTokenSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTokenSecurity());

    expect(result.current.tokenAddress).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.report).toBeNull();
  });

  it('updates token address', () => {
    const { result } = renderHook(() => useTokenSecurity());

    act(() => {
      result.current.setTokenAddress('TokenAddress123');
    });

    expect(result.current.tokenAddress).toBe('TokenAddress123');
  });

  it('successfully scans token', async () => {
    const mockReport = {
      tokenAddress: 'TestToken',
      securityScore: 75,
      riskLevel: 'Medium',
      recommendation: 'Use caution',
      tokenAuthorities: {},
      holderDistribution: {},
      liquidityAnalysis: {},
      tradingPatterns: {},
      metadata: {},
      marketMetrics: {},
      redFlags: [],
      analyzedAt: Date.now()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: mockReport })
    });

    const { result } = renderHook(() => useTokenSecurity());

    act(() => {
      result.current.setTokenAddress('ValidTokenAddress');
    });

    await act(async () => {
      await result.current.analyzeToken();
    });

    expect(result.current.report).toEqual(mockReport);
    expect(result.current.loading).toBe(false);
  });

  it('handles scan errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useTokenSecurity());

    act(() => {
      result.current.setTokenAddress('TokenAddress');
    });

    await act(async () => {
      await result.current.analyzeToken();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
  });

  it('detects high-risk tokens', async () => {
    const highRiskReport = {
      tokenAddress: 'ScamToken',
      securityScore: 15,
      riskLevel: 'High',
      recommendation: 'Avoid this token',
      redFlags: ['Mint authority enabled', 'Freeze authority enabled'],
      analyzedAt: Date.now()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report: highRiskReport })
    });

    const { result } = renderHook(() => useTokenSecurity());

    act(() => {
      result.current.setTokenAddress('ScamToken');
    });

    await act(async () => {
      await result.current.analyzeToken();
    });

    expect(result.current.report?.riskLevel).toBe('High');
    expect(result.current.report?.securityScore).toBeLessThan(30);
  });
});

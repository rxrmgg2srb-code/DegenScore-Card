import { renderHook, act, waitFor } from '@testing-library/react';
import { useTokenAnalysis } from '@/hooks/useTokenAnalysis';

jest.mock('@/hooks/useTokenAnalysis', () => ({
  useTokenAnalysis: jest.fn(() => ({
    analyze: jest.fn(),
    loading: false,
    result: null,
    error: null,
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useTokenAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTokenAnalysis());

    expect(result.current.tokenAddress).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('updates token address', () => {
    const { result } = renderHook(() => useTokenAnalysis());

    act(() => {
      result.current.setTokenAddress('SolTokenAddress123');
    });

    expect(result.current.tokenAddress).toBe('SolTokenAddress123');
  });

  it('shows error when analyzing empty address', async () => {
    const { result } = renderHook(() => useTokenAnalysis());

    await act(async () => {
      await result.current.analyzeToken();
    });

    expect(result.current.error).toBe('Por favor ingresa una dirección de token');
  });

  it('successfully analyzes token', async () => {
    const mockResponse = {
      data: {
        totalScore: 85,
        liquidity: { score: 90 },
        holders: { score: 80 }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useTokenAnalysis());

    act(() => {
      result.current.setTokenAddress('ValidTokenAddress');
    });

    await act(async () => {
      await result.current.analyzeToken();
    });

    await waitFor(() => {
      expect(result.current.result).toEqual(mockResponse.data);
      expect(result.current.progress).toBe(100);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Token not found' })
    });

    const { result } = renderHook(() => useTokenAnalysis());

    act(() => {
      result.current.setTokenAddress('InvalidTokenAddress');
    });

    await act(async () => {
      await result.current.analyzeToken();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Token not found');
      expect(result.current.loading).toBe(false);
    });
  });

  it('updates progress during analysis', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ data: {} })
      }), 1000))
    );

    const { result } = renderHook(() => useTokenAnalysis());

    act(() => {
      result.current.setTokenAddress('TokenAddress');
    });

    await act(async () => {
      result.current.analyzeToken();
    });

    // Progress should increase
    await waitFor(() => {
      expect(result.current.progress).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });
});

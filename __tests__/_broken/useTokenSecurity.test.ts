import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenSecurity } from '@/hooks/useTokenSecurity';
import { Connection, PublicKey } from '@solana/web3.js';

jest.mock('@/hooks/useTokenSecurity', () => ({
  useTokenSecurity: jest.fn(() => ({
    scan: jest.fn(),
    loading: false,
    report: null,
    error: null,
  })),
}));

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn(),
}));

global.fetch = jest.fn();

describe('useTokenSecurity', () => {
  const mockTokenAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTokenSecurity(mockTokenAddress));
    expect(result.current.loading).toBe(true);
    expect(result.current.securityData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch security data on mount', async () => {
    const mockData = { score: 85, risks: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSecurity(mockTokenAddress));
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.securityData).toEqual(mockData);
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result, waitForNextUpdate } = renderHook(() => useTokenSecurity(mockTokenAddress));
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle invalid token address', () => {
    const { result } = renderHook(() => useTokenSecurity(''));
    expect(result.current.error).toBe('Invalid token address');
    expect(result.current.loading).toBe(false);
  });

  it('should retry on failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fail 1')).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 90 }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenSecurity(mockTokenAddress));
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
  });

  it('should update when token address changes', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ address }) => useTokenSecurity(address),
      { initialProps: { address: mockTokenAddress } }
    );

    await waitForNextUpdate();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 50 }),
    });

    rerender({ address: 'new-address' });
    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.securityData).toEqual({ score: 50 });
  });
});

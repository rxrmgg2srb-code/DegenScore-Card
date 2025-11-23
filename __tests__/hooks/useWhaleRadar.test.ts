import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhaleRadar, WhaleWallet } from '@/hooks/useWhaleRadar';

jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));
jest.mock('@/lib/logger', () => ({
    logger: {
        error: jest.fn(),
        log: jest.fn(),
    },
}));
jest.mock('@/lib/walletAuth', () => ({
    generateSessionToken: jest.fn(),
}));
jest.mock('@solana/wallet-adapter-react', () => ({
    useWallet: jest.fn(() => ({
        publicKey: null,
        signMessage: jest.fn(),
        connected: false,
    })),
}));

global.fetch = jest.fn();

const mockWhales: WhaleWallet[] = [
    {
        id: '1',
        walletAddress: 'whale1',
        nickname: null,
        totalVolume: 1000000,
        winRate: 0.5,
        avgPositionSize: 100,
        followersCount: 10,
        totalProfit: 5000,
        topTokens: [],
        lastActive: '2024-01-01',
        address: 'whale1',
        balance: 1000000,
        riskScore: 75,
        tags: ['smart-money', 'early-adopter'],
        recentActivity: 50,
    },
    {
        id: '2',
        walletAddress: 'whale2',
        nickname: null,
        totalVolume: 500000,
        winRate: 0.6,
        avgPositionSize: 50,
        followersCount: 5,
        totalProfit: 2000,
        topTokens: [],
        lastActive: '2024-01-02',
        address: 'whale2',
        balance: 500000,
        riskScore: 85,
        tags: ['whale'],
        recentActivity: 30,
    },
];

describe('useWhaleRadar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockReset();
        (global.fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({ whales: [] }),
            })
        );
    });

    describe('Initialization', () => {
        it('should initialize with empty state', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());
            await waitFor(() => expect(result.current.loading).toBe(false));
            expect(result.current.whales).toEqual([]);
            expect(result.current.error).toBe(null);
        });
    });

    describe('fetchWhales', () => {
        it('should fetch whales successfully', async () => {
            (global.fetch as jest.Mock)
                .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ whales: [] }) }))
                .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ whales: mockWhales }) }));

            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.fetchWhales();
            });

            expect(result.current.whales).toEqual(mockWhales);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle fetch errors', async () => {
            (global.fetch as jest.Mock)
                .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ whales: [] }) }))
                .mockImplementationOnce(() => Promise.resolve({ ok: false, json: async () => ({ error: 'Failed to fetch whales' }) }));

            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.fetchWhales();
            });

            expect(result.current.error).toBe('Failed to fetch whales');
            expect(result.current.whales).toEqual([]);
        });
    });

    describe('Filtering', () => {
        it('should filter whales by minimum balance', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setMinBalance(750000);
            });

            const filtered = result.current.getFilteredWhales();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].address).toBe('whale1');
        });

        it('should filter whales by risk score', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setMinRiskScore(80);
            });

            const filtered = result.current.getFilteredWhales();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].address).toBe('whale2');
        });

        it('should filter by tags', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setFilterTags(['smart-money']);
            });

            const filtered = result.current.getFilteredWhales();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].tags).toContain('smart-money');
        });
    });

    describe('Sorting', () => {
        it('should sort by balance descending', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setSortBy('balance');
                result.current.setSortDirection('desc');
            });

            const sorted = result.current.getSortedWhales();
            expect(sorted[0].balance).toBeGreaterThan(sorted[1].balance);
        });

        it('should sort by risk score ascending', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setSortBy('riskScore');
                result.current.setSortDirection('asc');
            });

            const sorted = result.current.getSortedWhales();
            expect(sorted[0].riskScore).toBeLessThan(sorted[1].riskScore);
        });
    });

    describe('Alerts', () => {
        it('should trigger alert for new whale', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            const mockAlert = jest.fn();
            result.current.setOnNewWhale(mockAlert);

            act(() => {
                result.current.addWhale(mockWhales[0]);
            });

            expect(mockAlert).toHaveBeenCalledWith(mockWhales[0]);
        });

        it('should trigger alert for high risk whale', async () => {
            const { result } = renderHook(() => useWhaleRadar());
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());

            const mockAlert = jest.fn();
            result.current.setOnHighRisk(mockAlert);

            act(() => {
                result.current.checkRiskAlert(mockWhales[1]);
            });

            expect(mockAlert).toHaveBeenCalled();
        });
    });
});

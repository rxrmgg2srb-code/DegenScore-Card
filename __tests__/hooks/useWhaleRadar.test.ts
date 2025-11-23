import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhaleRadar } from '@/hooks/useWhaleRadar';

global.fetch = jest.fn();

describe('useWhaleRadar', () => {
    const mockWhales = [
        {
            address: 'whale1',
            balance: 1000000,
            recentActivity: 50,
            riskScore: 75,
            tags: ['smart-money', 'early-adopter'],
        },
        {
            address: 'whale2',
            balance: 500000,
            recentActivity: 30,
            riskScore: 85,
            tags: ['whale'],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with empty state', () => {
            const { result } = renderHook(() => useWhaleRadar());

            expect(result.current.whales).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });
    });

    describe('fetchWhales', () => {
        it('should fetch whales successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ whales: mockWhales }),
            });

            const { result } = renderHook(() => useWhaleRadar());

            await act(async () => {
                await result.current.fetchWhales();
            });

            expect(result.current.whales).toEqual(mockWhales);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should handle fetch errors', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to fetch whales' }),
            });

            const { result } = renderHook(() => useWhaleRadar());

            await act(async () => {
                await result.current.fetchWhales();
            });

            expect(result.current.error).toBe('Failed to fetch whales');
            expect(result.current.whales).toEqual([]);
        });
    });

    describe('Filtering', () => {
        it('should filter whales by minimum balance', () => {
            const { result } = renderHook(() => useWhaleRadar());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setMinBalance(750000);
            });

            const filtered = result.current.getFilteredWhales();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].address).toBe('whale1');
        });

        it('should filter whales by risk score', () => {
            const { result } = renderHook(() => useWhaleRadar());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setMinRiskScore(80);
            });

            const filtered = result.current.getFilteredWhales();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].address).toBe('whale2');
        });

        it('should filter by tags', () => {
            const { result } = renderHook(() => useWhaleRadar());

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
        it('should sort by balance descending', () => {
            const { result } = renderHook(() => useWhaleRadar());

            act(() => {
                result.current.setWhales(mockWhales);
                result.current.setSortBy('balance');
                result.current.setSortDirection('desc');
            });

            const sorted = result.current.getSortedWhales();
            expect(sorted[0].balance).toBeGreaterThan(sorted[1].balance);
        });

        it('should sort by risk score ascending', () => {
            const { result } = renderHook(() => useWhaleRadar());

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
        it('should trigger alert for new whale', () => {
            const { result } = renderHook(() => useWhaleRadar());
            const mockAlert = jest.fn();

            act(() => {
                result.current.setOnNewWhale(mockAlert);
                result.current.addWhale(mockWhales[0]);
            });

            expect(mockAlert).toHaveBeenCalledWith(mockWhales[0]);
        });

        it('should trigger alert for high risk whale', () => {
            const { result } = renderHook(() => useWhaleRadar());
            const mockAlert = jest.fn();

            act(() => {
                result.current.setOnHighRisk(mockAlert);
                result.current.checkRiskAlert(mockWhales[1]);
            });

            expect(mockAlert).toHaveBeenCalled();
        });
    });
});

import { render, screen, waitFor } from '@testing-library/react';
import ScoreHistoryChart from '@/components/ScoreHistoryChart';

// Mock fetch globally for this test
global.fetch = jest.fn();

describe('ScoreHistoryChart', () => {
    const mockWalletAddress = 'ABC123...XYZ';

    const mockHistoryResponse = {
        walletAddress: mockWalletAddress,
        period: {
            startDate: '2024-01-01',
            endDate: '2024-01-30',
            days: 30
        },
        dataPoints: 30,
        history: [
            {
                timestamp: '2024-01-01T00:00:00Z',
                score: 80,
                rank: 100,
                totalTrades: 50,
                totalVolume: 10000,
                profitLoss: 500,
                winRate: 60,
                badges: 5
            },
            {
                timestamp: '2024-01-02T00:00:00Z',
                score: 85,
                rank: 95,
                totalTrades: 52,
                totalVolume: 11000,
                profitLoss: 600,
                winRate: 62,
                badges: 5
            }
        ],
        statistics: {
            current: 85,
            max: 90,
            min: 75,
            average: 82,
            change: 5,
            changePercent: 6.25,
            bestRank: 90
        }
    };

    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHistoryResponse
        });
    });

    it('should render chart with data', async () => {
        const { container } = render(<ScoreHistoryChart walletAddress={mockWalletAddress} />);

        await waitFor(() => {
            expect(container.querySelectorAll('.recharts-surface').length).toBeGreaterThan(0);
        });
    });

    it('should display current score and statistics', async () => {
        render(<ScoreHistoryChart walletAddress={mockWalletAddress} />);

        await waitFor(() => {
            expect(screen.getByText('85')).toBeInTheDocument();
        });
    });

    it('should handle loading state', () => {
        render(<ScoreHistoryChart walletAddress={mockWalletAddress} />);
        expect(screen.getByText(/evolución de score/i)).toBeInTheDocument();
    });

    it('should handle error state', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Failed to fetch' })
        });

        render(<ScoreHistoryChart walletAddress={mockWalletAddress} />);

        await waitFor(() => {
            expect(screen.getByText(/sin historial disponible/i)).toBeInTheDocument();
        });
    });

    it('should allow period selection', async () => {
        render(<ScoreHistoryChart walletAddress={mockWalletAddress} />);

        await waitFor(() => {
            expect(screen.getByText('7D')).toBeInTheDocument();
            expect(screen.getByText('30D')).toBeInTheDocument();
            expect(screen.getByText('90D')).toBeInTheDocument();
        });
    });
});

import { render, screen, waitFor } from '@testing-library/react';
import WeeklyChallengeBanner from '@/components/WeeklyChallengeBanner';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeeklyChallengeBanner', () => {
    const mockChallengeData = {
        hasChallenge: true,
        challenge: {
            id: 'challenge-1',
            title: '❤️ Most Loved Card Challenge',
            description: 'Get the most likes on your card this week!',
            metric: 'likes',
            prizeSOL: 1,
            daysRemaining: 3
        },
        currentLeader: {
            address: 'ABC123XYZ789',
            displayName: 'DegenKing',
            score: 150
        }
    };

    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should not render when loading', () => {
        (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));
        const { container } = render(<WeeklyChallengeBanner />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render when no challenge is active', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ hasChallenge: false })
        });

        const { container } = render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('should render challenge with all details', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockChallengeData
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText(/Most Loved Card Challenge/i)).toBeInTheDocument();
            expect(screen.getByText(/Get the most likes/i)).toBeInTheDocument();
            expect(screen.getByText('1 SOL')).toBeInTheDocument();
        });
    });

    it('should display current leader information', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockChallengeData
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText('DegenKing')).toBeInTheDocument();
            expect(screen.getByText(/ABC123\.\.\.X789/)).toBeInTheDocument();
            expect(screen.getByText('150 likes')).toBeInTheDocument();
        });
    });

    it('should show days remaining', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockChallengeData
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText('3 days left')).toBeInTheDocument();
        });
    });

    it('should format profit metric correctly', async () => {
        const profitChallenge = {
            ...mockChallengeData,
            challenge: {
                ...mockChallengeData.challenge,
                metric: 'profit'
            },
            currentLeader: {
                ...mockChallengeData.currentLeader,
                score: 25.5
            }
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => profitChallenge
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText('25.50 SOL')).toBeInTheDocument();
        });
    });

    it('should format win rate metric correctly', async () => {
        const winRateChallenge = {
            ...mockChallengeData,
            challenge: {
                ...mockChallengeData.challenge,
                metric: 'winRate'
            },
            currentLeader: {
                ...mockChallengeData.currentLeader,
                score: 85.7
            }
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => winRateChallenge
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText('85.7%')).toBeInTheDocument();
        });
    });

    it('should display correct icon for different metrics', async () => {
        const mockData = {
            ...mockChallengeData,
            challenge: {
                ...mockChallengeData.challenge,
                metric: 'volume'
            }
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        const { container } = render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
        });
    });

    it('should handle fetch errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

        const { container } = render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('should handle singular day remaining', async () => {
        const oneDay = {
            ...mockChallengeData,
            challenge: {
                ...mockChallengeData.challenge,
                daysRemaining: 1
            }
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => oneDay
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText('1 day left')).toBeInTheDocument();
        });
    });

    it('should show premium users only message', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockChallengeData
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText(/Premium users only/i)).toBeInTheDocument();
        });
    });

    it('should refresh data every 5 minutes', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockChallengeData
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        // Fast-forward 5 minutes
        jest.advanceTimersByTime(5 * 60 * 1000);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    it('should render without leader when not provided', async () => {
        const noLeader = {
            hasChallenge: true,
            challenge: mockChallengeData.challenge
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => noLeader
        });

        render(<WeeklyChallengeBanner />);

        await waitFor(() => {
            expect(screen.getByText(/Most Loved Card Challenge/i)).toBeInTheDocument();
            expect(screen.queryByText('🔥 Current Leader')).not.toBeInTheDocument();
        });
    });
});

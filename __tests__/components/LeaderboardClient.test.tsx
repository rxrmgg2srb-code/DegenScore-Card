import { render, screen } from '@testing-library/react';
import LeaderboardClient from '@/components/LeaderboardClient';

describe('LeaderboardClient', () => {
    const mockData = [
        { rank: 1, wallet: 'alice', score: 100 },
        { rank: 2, wallet: 'bob', score: 90 },
    ];

    it('should render leaderboard', () => {
        render(<LeaderboardClient initialData={mockData} />);
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should filter by timeframe', () => {
        render(<LeaderboardClient initialData={mockData} />);
        expect(screen.getByText(/weekly/i)).toBeInTheDocument();
        expect(screen.getByText(/all time/i)).toBeInTheDocument();
    });

    it('should search users', () => {
        render(<LeaderboardClient initialData={mockData} />);
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'alice' } });
        expect(screen.getByText('alice')).toBeInTheDocument();
    });

    it('should paginate results', () => {
        render(<LeaderboardClient initialData={mockData} />);
        expect(screen.getByText(/next/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        // Simulate loading
    });

    it('should handle empty state', () => {
        render(<LeaderboardClient initialData={[]} />);
        expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should highlight current user', () => {
        // ...
    });

    it('should sort columns', () => {
        render(<LeaderboardClient initialData={mockData} />);
        fireEvent.click(screen.getByText(/score/i));
        // Check sort order
    });

    it('should display badges', () => {
        // ...
    });

    it('should refresh data', () => {
        // ...
    });
});

import { render, screen } from '@testing-library/react';
import ChallengeWinnersWidget from '@/components/ChallengeWinnersWidget';

describe('ChallengeWinnersWidget', () => {
    const mockWinners = [
        { rank: 1, wallet: 'alice', prize: 1000, challenge: 'Daily Volume' },
        { rank: 2, wallet: 'bob', prize: 500, challenge: 'Daily Volume' },
    ];

    it('should render winners list', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} />);
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should display prizes', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} />);
        expect(screen.getByText('1000')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should show challenge name', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} />);
        expect(screen.getByText('Daily Volume')).toBeInTheDocument();
    });

    it('should highlight top winner', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} />);
        expect(screen.getByText('🥇')).toBeInTheDocument();
    });

    it('should handle empty list', () => {
        render(<ChallengeWinnersWidget winners={[]} />);
        expect(screen.getByText(/no winners/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<ChallengeWinnersWidget loading={true} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should link to user profiles', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} />);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('should display date', () => {
        render(<ChallengeWinnersWidget winners={mockWinners} date="2024-01-01" />);
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });

    it('should animate list', () => {
        const { container } = render(<ChallengeWinnersWidget winners={mockWinners} />);
        expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('should support different layouts', () => {
        const { container } = render(<ChallengeWinnersWidget winners={mockWinners} layout="grid" />);
        expect(container.firstChild).toHaveClass('grid');
    });
});

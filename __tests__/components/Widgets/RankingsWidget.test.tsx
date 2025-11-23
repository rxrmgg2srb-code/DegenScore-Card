import { render, screen } from '@testing-library/react';
import RankingsWidget from '@/components/Widgets/RankingsWidget';

describe('Widgets/RankingsWidget', () => {
    const mockRankings = [
        { rank: 1, wallet: 'alice', score: 98, change: +2 },
        { rank: 2, wallet: 'bob', score: 95, change: -1 },
        { rank: 3, wallet: 'charlie', score: 92, change: 0 },
    ];

    it('should render top rankings', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getByText(/alice/i)).toBeInTheDocument();
        expect(screen.getByText(/bob/i)).toBeInTheDocument();
        expect(screen.getByText(/charlie/i)).toBeInTheDocument();
    });

    it('should display rank numbers', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show scores', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getByText(/98/)).toBeInTheDocument();
        expect(screen.getByText(/95/)).toBeInTheDocument();
        expect(screen.getByText(/92/)).toBeInTheDocument();
    });

    it('should display rank changes', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getByText(/\+2/)).toBeInTheDocument();
        expect(screen.getByText(/-1/)).toBeInTheDocument();
    });

    it('should show arrow indicators for changes', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getAllByText(/↑|↓/).length).toBeGreaterThan(0);
    });

    it('should highlight top 3 differently', () => {
        const { container } = render(<RankingsWidget rankings={mockRankings} />);
        const topRanks = container.querySelectorAll('[class*="gold"], [class*="silver"], [class*="bronze"]');
        expect(topRanks.length).toBeGreaterThan(0);
    });

    it('should handle empty rankings', () => {
        render(<RankingsWidget rankings={[]} />);
        expect(screen.getByText(/no rankings/i)).toBeInTheDocument();
    });

    it('should show current user highlight', () => {
        render(<RankingsWidget rankings={mockRankings} currentUser="bob" />);
        const { container } = render(<RankingsWidget rankings={mockRankings} currentUser="bob" />);
        expect(container.querySelector('[class*="highlight"]')).toBeInTheDocument();
    });

    it('should display trophy icons', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getAllByText(/🏆|🥇|🥈|🥉/).length).toBeGreaterThan(0);
    });

    it('should link to full leaderboard', () => {
        render(<RankingsWidget rankings={mockRankings} />);
        expect(screen.getByText(/view all/i)).toBeInTheDocument();
    });
});

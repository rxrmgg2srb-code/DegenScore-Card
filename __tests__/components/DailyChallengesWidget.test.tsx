import { render, screen, fireEvent } from '@testing-library/react';
import DailyChallengesWidget from '@/components/DailyChallengesWidget';

describe('DailyChallengesWidget', () => {
    const mockChallenges = [
        { id: '1', title: 'Trade 5 times', progress: 3, target: 5, reward: 50 },
        { id: '2', title: 'Volume > 10 SOL', progress: 10, target: 10, reward: 100, completed: true },
    ];

    it('should render challenges', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} />);
        expect(screen.getByText('Trade 5 times')).toBeInTheDocument();
        expect(screen.getByText('Volume > 10 SOL')).toBeInTheDocument();
    });

    it('should show progress bars', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} />);
        expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    });

    it('should display rewards', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} />);
        expect(screen.getByText('50 XP')).toBeInTheDocument();
        expect(screen.getByText('100 XP')).toBeInTheDocument();
    });

    it('should mark completed challenges', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} />);
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should claim reward', () => {
        const onClaim = jest.fn();
        render(<DailyChallengesWidget challenges={mockChallenges} onClaim={onClaim} />);
        const claimBtn = screen.getByText(/claim/i);
        fireEvent.click(claimBtn);
        expect(onClaim).toHaveBeenCalledWith('2');
    });

    it('should show timer', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} timeLeft={3600} />);
        expect(screen.getByText(/1h/i)).toBeInTheDocument();
    });

    it('should handle empty state', () => {
        render(<DailyChallengesWidget challenges={[]} />);
        expect(screen.getByText(/no challenges/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<DailyChallengesWidget loading={true} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should animate progress updates', () => {
        const { rerender } = render(<DailyChallengesWidget challenges={mockChallenges} />);
        const updated = [{ ...mockChallenges[0], progress: 4 }];
        rerender(<DailyChallengesWidget challenges={updated} />);
        // Check for animation class or style change
        const bar = screen.getAllByRole('progressbar')[0];
        expect(bar).toHaveStyle('width: 80%');
    });

    it('should display info tooltip', () => {
        render(<DailyChallengesWidget challenges={mockChallenges} />);
        const infoIcon = screen.getAllByText('ℹ️')[0];
        fireEvent.mouseOver(infoIcon);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
});

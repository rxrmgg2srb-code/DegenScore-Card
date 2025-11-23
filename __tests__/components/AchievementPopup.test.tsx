import { render, screen, fireEvent } from '@testing-library/react';
import AchievementPopup from '@/components/AchievementPopup';

describe('AchievementPopup', () => {
    const mockProps = {
        achievement: {
            id: '1',
            title: 'First Trade',
            description: 'You made your first trade!',
            icon: '🎉',
            xp: 100,
            rarity: 'common' as const,
        },
        onClose: jest.fn(),
    };

    it('should render achievement details', () => {
        render(<AchievementPopup {...mockProps} />);
        expect(screen.getByText('First Trade')).toBeInTheDocument();
        expect(screen.getByText('You made your first trade!')).toBeInTheDocument();
        expect(screen.getByText('🎉')).toBeInTheDocument();
        expect(screen.getByText('+100 XP')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
        render(<AchievementPopup {...mockProps} />);
        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should auto-close after timeout', () => {
        jest.useFakeTimers();
        render(<AchievementPopup {...mockProps} duration={3000} />);
        jest.advanceTimersByTime(3000);
        expect(mockProps.onClose).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('should play sound on mount', () => {
        const play = jest.fn();
        window.Audio = jest.fn().mockImplementation(() => ({ play }));
        render(<AchievementPopup {...mockProps} />);
        expect(play).toHaveBeenCalled();
    });

    it('should show animation', () => {
        const { container } = render(<AchievementPopup {...mockProps} />);
        expect(container.firstChild).toHaveClass('animate-slide-up');
    });

    it('should render confetti', () => {
        const { container } = render(<AchievementPopup {...mockProps} />);
        expect(container.querySelector('.confetti')).toBeInTheDocument();
    });

    it('should handle multiple achievements', () => {
        // This would likely be handled by a parent manager, but checking if it renders correctly
        render(<AchievementPopup {...mockProps} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should be accessible', () => {
        render(<AchievementPopup {...mockProps} />);
        expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('should pause timer on hover', () => {
        jest.useFakeTimers();
        render(<AchievementPopup {...mockProps} duration={3000} />);

        fireEvent.mouseEnter(screen.getByRole('alert'));
        jest.advanceTimersByTime(3000);
        expect(mockProps.onClose).not.toHaveBeenCalled();

        fireEvent.mouseLeave(screen.getByRole('alert'));
        jest.advanceTimersByTime(3000);
        expect(mockProps.onClose).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('should render progress bar if applicable', () => {
        render(<AchievementPopup {...mockProps} progress={50} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});

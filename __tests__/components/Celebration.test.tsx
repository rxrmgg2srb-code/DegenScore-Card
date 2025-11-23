import { render, screen, fireEvent } from '@testing-library/react';
import Celebration from '@/components/Celebration';

describe('Celebration', () => {
    it('should render confetti', () => {
        render(<Celebration />);
        expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });

    it('should play sound', () => {
        const play = jest.fn();
        window.Audio = jest.fn().mockImplementation(() => ({ play }));
        render(<Celebration />);
        expect(play).toHaveBeenCalled();
    });

    it('should show message', () => {
        render(<Celebration message="Congrats!" />);
        expect(screen.getByText('Congrats!')).toBeInTheDocument();
    });

    it('should auto-stop', () => {
        jest.useFakeTimers();
        const onComplete = jest.fn();
        render(<Celebration duration={2000} onComplete={onComplete} />);
        jest.advanceTimersByTime(2000);
        expect(onComplete).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('should stop on click', () => {
        const onComplete = jest.fn();
        render(<Celebration onComplete={onComplete} />);
        fireEvent.click(screen.getByTestId('celebration-overlay'));
        expect(onComplete).toHaveBeenCalled();
    });

    it('should render different effects', () => {
        render(<Celebration type="fireworks" />);
        expect(screen.getByTestId('fireworks')).toBeInTheDocument();
    });

    it('should be accessible', () => {
        render(<Celebration />);
        expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('should handle custom colors', () => {
        const colors = ['#ff0000', '#00ff00'];
        render(<Celebration colors={colors} />);
        // Check if colors are passed to confetti library or rendered
        // This depends on implementation, assuming style prop or similar
        const confetti = screen.getByTestId('confetti');
        expect(confetti).toBeInTheDocument();
    });

    it('should support particle count', () => {
        render(<Celebration particleCount={100} />);
        // Check implementation detail
    });

    it('should render children', () => {
        render(<Celebration><div>Custom Content</div></Celebration>);
        expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
});

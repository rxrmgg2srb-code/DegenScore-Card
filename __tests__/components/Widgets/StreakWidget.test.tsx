import { render, screen, fireEvent } from '@testing-library/react';
import StreakWidget from '@/components/Widgets/StreakWidget';

describe('Widgets/StreakWidget', () => {
    const mockData = { currentStreak: 15, longestStreak: 30, lastCheckIn: new Date() };

    it('should render current streak', () => {
        render(<StreakWidget data={mockData} />);
        expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should show check-in button', () => {
        render(<StreakWidget data={mockData} />);
        expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
    });

    it('should display fire emoji for streak', () => {
        render(<StreakWidget data={mockData} />);
        expect(screen.getByText(/🔥/)).toBeInTheDocument();
    });

    it('should show longest streak record', () => {
        render(<StreakWidget data={mockData} />);
        expect(screen.getByText(/30/)).toBeInTheDocument();
    });

    it('should call onCheckIn when button clicked', () => {
        const onCheckIn = jest.fn();
        render(<StreakWidget data={mockData} onCheckIn={onCheckIn} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onCheckIn).toHaveBeenCalled();
    });

    it('should disable button if already checked in today', () => {
        const today = new Date();
        render(<StreakWidget data={{ ...mockData, lastCheckIn: today }} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show milestone message', () => {
        render(<StreakWidget data={{ ...mockData, currentStreak: 30 }} />);
        expect(screen.getByText(/milestone/i)).toBeInTheDocument();
    });

    it('should handle zero streak', () => {
        render(<StreakWidget data={{ currentStreak: 0, longestStreak: 0, lastCheckIn: null }} />);
        expect(screen.getByText(/start/i)).toBeInTheDocument();
    });

    it('should show XP reward', () => {
        render(<StreakWidget data={mockData} />);
        expect(screen.getByText(/\+.*XP/)).toBeInTheDocument();
    });

    it('should display streak animation', () => {
        const { container } = render(<StreakWidget data={mockData} />);
        expect(container.querySelector('.animate-pulse, .animate-bounce')).toBeInTheDocument();
    });
});

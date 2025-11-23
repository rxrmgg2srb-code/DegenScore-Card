import { render, screen, fireEvent } from '@testing-library/react';
import DailyCheckIn from '@/components/DailyCheckIn';

describe('DailyCheckIn', () => {
    const mockProps = {
        streak: 5,
        checkedIn: false,
        onCheckIn: jest.fn(),
        reward: 10,
    };

    it('should render check-in button', () => {
        render(<DailyCheckIn {...mockProps} />);
        expect(screen.getByText(/check in/i)).toBeInTheDocument();
    });

    it('should display current streak', () => {
        render(<DailyCheckIn {...mockProps} />);
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText(/streak/i)).toBeInTheDocument();
    });

    it('should disable button if already checked in', () => {
        render(<DailyCheckIn {...mockProps} checkedIn={true} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByText(/checked in/i)).toBeInTheDocument();
    });

    it('should call onCheckIn click', () => {
        render(<DailyCheckIn {...mockProps} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockProps.onCheckIn).toHaveBeenCalled();
    });

    it('should show reward amount', () => {
        render(<DailyCheckIn {...mockProps} />);
        expect(screen.getByText('+10 XP')).toBeInTheDocument();
    });

    it('should animate on check-in', () => {
        const { rerender, container } = render(<DailyCheckIn {...mockProps} />);
        rerender(<DailyCheckIn {...mockProps} checkedIn={true} />);
        expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
    });

    it('should show next milestone', () => {
        render(<DailyCheckIn {...mockProps} nextMilestone={7} />);
        expect(screen.getByText(/2 days to/i)).toBeInTheDocument();
    });

    it('should display calendar view', () => {
        render(<DailyCheckIn {...mockProps} showCalendar={true} />);
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
        render(<DailyCheckIn {...mockProps} loading={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should show missed days', () => {
        render(<DailyCheckIn {...mockProps} missed={true} />);
        expect(screen.getByText(/streak lost/i)).toBeInTheDocument();
    });
});

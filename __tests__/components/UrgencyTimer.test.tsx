import { render, screen, act } from '@testing-library/react';
import UrgencyTimer from '@/components/UrgencyTimer';

describe('UrgencyTimer', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render timer with default props', () => {
        const endTime = new Date('2024-01-01T15:30:00Z'); // 3.5 hours from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText(/⚡ Flash Sale Ending Soon!/i)).toBeInTheDocument();
        expect(screen.getByText(/Lock in early bird pricing/i)).toBeInTheDocument();
    });

    it('should display correct time remaining', () => {
        const endTime = new Date('2024-01-01T14:05:30Z'); // 2h 5m 30s from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('02')).toBeInTheDocument(); // Hours
        expect(screen.getByText('05')).toBeInTheDocument(); // Minutes
        expect(screen.getByText('30')).toBeInTheDocument(); // Seconds
    });

    it('should update countdown every second', () => {
        const endTime = new Date('2024-01-01T13:00:00Z'); // 1 hour from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('00')).toBeInTheDocument(); // Minutes initially

        act(() => {
            jest.advanceTimersByTime(60000); // Advance 1 minute
        });

        expect(screen.getByText('59')).toBeInTheDocument(); // 59 minutes left
    });

    it('should show critical state when less than 1 hour remaining', () => {
        const endTime = new Date('2024-01-01T12:30:00Z'); // 30 minutes from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('ENDING SOON!')).toBeInTheDocument();
        expect(screen.getByText(/🚨 FINAL HOUR!/i)).toBeInTheDocument();
    });

    it('should show urgent state when less than 2 hours remaining', () => {
        const endTime = new Date('2024-01-01T13:30:00Z'); // 1.5 hours from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText(/⏰ Limited time remaining!/i)).toBeInTheDocument();
    });

    it('should call onExpire when timer ends', () => {
        const onExpire = jest.fn();
        const endTime = new Date('2024-01-01T12:00:05Z'); // 5 seconds from now

        const { container } = render(<UrgencyTimer endTime={endTime} onExpire={onExpire} />);

        act(() => {
            jest.advanceTimersByTime(6000); // Advance 6 seconds
        });

        expect(onExpire).toHaveBeenCalled();
        expect(container.firstChild).toBeNull(); // Component should unmount
    });

    it('should render with early-bird type', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        render(<UrgencyTimer endTime={endTime} type="early-bird" />);

        expect(screen.getByText('🐦')).toBeInTheDocument();
    });

    it('should render with bonus type', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        render(<UrgencyTimer endTime={endTime} type="bonus" />);

        expect(screen.getByText('🎁')).toBeInTheDocument();
    });

    it('should render with event type', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        render(<UrgencyTimer endTime={endTime} type="event" />);

        expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should render with custom title and subtitle', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        render(
            <UrgencyTimer
                endTime={endTime}
                title="🔥 Special Offer!"
                subtitle="Save 50% now"
            />
        );

        expect(screen.getByText('🔥 Special Offer!')).toBeInTheDocument();
        expect(screen.getByText('Save 50% now')).toBeInTheDocument();
    });

    it('should not render when already expired', () => {
        const endTime = new Date('2024-01-01T11:00:00Z'); // Past time
        const { container } = render(<UrgencyTimer endTime={endTime} />);

        expect(container.firstChild).toBeNull();
    });

    it('should display time labels', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('Hours')).toBeInTheDocument();
        expect(screen.getByText('Minutes')).toBeInTheDocument();
        expect(screen.getByText('Seconds')).toBeInTheDocument();
    });

    it('should pad single digit numbers with zero', () => {
        const endTime = new Date('2024-01-01T12:05:03Z'); // 5m 3s from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('00')).toBeInTheDocument(); // Hours
        expect(screen.getByText('05')).toBeInTheDocument(); // Minutes
        expect(screen.getByText('03')).toBeInTheDocument(); // Seconds
    });

    it('should show progress bar', () => {
        const endTime = new Date('2024-01-01T15:00:00Z');
        const { container } = render(<UrgencyTimer endTime={endTime} />);

        const progressBar = container.querySelector('.bg-black\\/30');
        expect(progressBar).toBeInTheDocument();
    });

    it('should countdown to zero before expiring', () => {
        const endTime = new Date('2024-01-01T12:00:03Z'); // 3 seconds from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('00')).toBeInTheDocument(); // Hours
        expect(screen.getByText('00')).toBeInTheDocument(); // Minutes  
        expect(screen.getByText('03')).toBeInTheDocument(); // Seconds

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText('02')).toBeInTheDocument(); // 2 seconds

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText('01')).toBeInTheDocument(); // 1 second
    });

    it('should handle very long durations', () => {
        const endTime = new Date('2024-01-02T12:00:00Z'); // 24 hours from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.getByText('24')).toBeInTheDocument(); // Hours
    });

    it('should not show urgent messaging when time is not urgent', () => {
        const endTime = new Date('2024-01-01T18:00:00Z'); // 6 hours from now
        render(<UrgencyTimer endTime={endTime} />);

        expect(screen.queryByText(/⏰ Limited time remaining!/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/🚨 FINAL HOUR!/i)).not.toBeInTheDocument();
        expect(screen.queryByText('ENDING SOON!')).not.toBeInTheDocument();
    });
});

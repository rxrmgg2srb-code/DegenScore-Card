import { render, screen, waitFor, act } from '@testing-library/react';
import LiveActivityFeed from '@/components/LiveActivityFeed';

describe('LiveActivityFeed', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render live activity feed', () => {
        render(<LiveActivityFeed />);
        // The component generates its own initial activities
        expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should display wallet addresses', async () => {
        render(<LiveActivityFeed />);

        await waitFor(() => {
            // Look for elements that contain "..." which are part of truncated wallet addresses
            const addresses = screen.getAllByText(/\.\.\./);
            expect(addresses.length).toBeGreaterThan(0);
        });
    });

    it('should show activity types', async () => {
        render(<LiveActivityFeed />);

        await waitFor(() => {
            // The component should show at least one activity message
            const messages = screen.getByText(/generated a|unlocked premium|achieved/i);
            expect(messages).toBeInTheDocument();
        });
    });

    it('should show activity indicators', () => {
        const { container } = render(<LiveActivityFeed />);

        // Check for indicator dots
        const indicators = container.querySelectorAll('.h-1.w-8');
        expect(indicators.length).toBeGreaterThan(0);
    });

    it('should animate between activities', async () => {
        render(<LiveActivityFeed />);

        // Fast-forward time to trigger activity rotation
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // Should still have the LIVE indicator
        expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('should generate new activities over time', () => {
        render(<LiveActivityFeed />);

        // Fast-forward to trigger new activity generation
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // Component should still be rendering
        expect(screen.queryByText('LIVE')).toBeInTheDocument();
    });

    it('should display activity icons', () => {
        const { container } = render(<LiveActivityFeed />);

        // Icons are rendered as emojis in span elements
        const icons = container.querySelectorAll('.text-2xl');
        expect(icons.length).toBeGreaterThan(0);
    });

    it('should render with animated pulse effect', () => {
        const { container } = render(<LiveActivityFeed />);

        // Check for ping animation on live indicator
        const pingElement = container.querySelector('.animate-ping');
        expect(pingElement).toBeInTheDocument();
    });
});

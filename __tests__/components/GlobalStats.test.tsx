import { render, screen } from '@testing-library/react';
import GlobalStats from '@/components/GlobalStats';

describe('GlobalStats', () => {
    const mockStats = {
        totalUsers: 1000,
        totalVolume: 1000000,
        activeToday: 500,
    };

    it('should render stats', () => {
        render(<GlobalStats stats={mockStats} />);
        expect(screen.getByText('1000')).toBeInTheDocument();
        expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('should display labels', () => {
        render(<GlobalStats stats={mockStats} />);
        expect(screen.getByText(/users/i)).toBeInTheDocument();
        expect(screen.getByText(/volume/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<GlobalStats loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should handle error state', () => {
        render(<GlobalStats error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should animate numbers', () => {
        // Check for animation library or class
    });

    it('should be responsive', () => {
        const { container } = render(<GlobalStats stats={mockStats} />);
        expect(container.firstChild).toHaveClass('grid');
    });

    it('should show trend indicators', () => {
        render(<GlobalStats stats={{ ...mockStats, trend: 10 }} />);
        expect(screen.getByText('+10%')).toBeInTheDocument();
    });

    it('should support dark mode', () => {
        const { container } = render(<GlobalStats stats={mockStats} theme="dark" />);
        expect(container.firstChild).toHaveClass('dark');
    });

    it('should refresh data', () => {
        const onRefresh = jest.fn();
        render(<GlobalStats stats={mockStats} onRefresh={onRefresh} />);
        fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
        expect(onRefresh).toHaveBeenCalled();
    });

    it('should display last updated', () => {
        render(<GlobalStats stats={mockStats} lastUpdated={new Date()} />);
        expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });
});

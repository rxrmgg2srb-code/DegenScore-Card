import { render, screen } from '@testing-library/react';
import Analytics from '@/components/Analytics';

describe('Analytics', () => {
    const mockData = {
        views: 1000,
        conversions: 50,
        revenue: 500,
    };

    it('should render analytics overview', () => {
        render(<Analytics data={mockData} />);
        expect(screen.getByText('1000')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('$500')).toBeInTheDocument();
    });

    it('should display charts', () => {
        const { container } = render(<Analytics data={mockData} />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<Analytics loading={true} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle empty data', () => {
        render(<Analytics data={null} />);
        expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should filter by date range', () => {
        render(<Analytics data={mockData} />);
        expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
    });

    it('should show trend indicators', () => {
        render(<Analytics data={{ ...mockData, viewsTrend: 10 }} />);
        expect(screen.getByText('+10%')).toBeInTheDocument();
    });

    it('should display user retention', () => {
        render(<Analytics data={mockData} />);
        expect(screen.getByText(/retention/i)).toBeInTheDocument();
    });

    it('should show top sources', () => {
        render(<Analytics data={mockData} />);
        expect(screen.getByText(/sources/i)).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<Analytics data={mockData} />);
        expect(container.firstChild).toHaveClass('grid');
    });

    it('should export data', () => {
        render(<Analytics data={mockData} />);
        expect(screen.getByText(/export/i)).toBeInTheDocument();
    });
});

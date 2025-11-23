import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from '@/components/Features/AnalyticsDashboard';

describe('Features/AnalyticsDashboard', () => {
    const mockData = {
        totalTrades: 150,
        winRate: 67.5,
        avgProfit: 250,
        totalVolume: 50000,
        bestDay: { date: '2024-01-15', profit: 1500 },
        worstDay: { date: '2024-01-20', profit: -500 },
    };

    it('should render analytics cards', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/150/)).toBeInTheDocument();
    });

    it('should display win rate', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/67\.5%/)).toBeInTheDocument();
    });

    it('should show average profit', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/250/)).toBeInTheDocument();
    });

    it('should display total volume', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/50,000/i)).toBeInTheDocument();
    });

    it('should show best day', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/1500/)).toBeInTheDocument();
    });

    it('should show worst day', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/-500/)).toBeInTheDocument();
    });

    it('should render charts', () => {
        const { container } = render(<AnalyticsDashboard data={mockData} />);
        expect(container.querySelector('canvas, svg')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
        render(<AnalyticsDashboard data={{}} />);
        expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should display time filters', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/7d|30d|all/i)).toBeInTheDocument();
    });

    it('should show export button', () => {
        render(<AnalyticsDashboard data={mockData} />);
        expect(screen.getByText(/export/i)).toBeInTheDocument();
    });
});

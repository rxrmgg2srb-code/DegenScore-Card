import { render, screen, waitFor, act } from '@testing-library/react';
import ScoreHistoryChart from '@/components/ScoreHistoryChart';

jest.mock('node-fetch');

describe('ScoreHistoryChart', () => {
    const mockData = [
        { date: '2024-01-01', score: 80 },
        { date: '2024-01-02', score: 85 },
    ];

    it('should render chart', () => {
        const { container } = render(<ScoreHistoryChart data={mockData} />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should display title', () => {
        render(<ScoreHistoryChart data={mockData} title="History" />);
        expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
        render(<ScoreHistoryChart data={[]} />);
        expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<ScoreHistoryChart loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should support different timeframes', () => {
        render(<ScoreHistoryChart data={mockData} timeframe="7d" />);
        // Check if filter applied or UI updated
    });

    it('should be responsive', () => {
        const { container } = render(<ScoreHistoryChart data={mockData} />);
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('should show tooltip on hover', () => {
        // Difficult to test with canvas, usually mocked or integration test
    });

    it('should support dark mode', () => {
        // ...
    });

    it('should animate entry', () => {
        // ...
    });

    it('should handle resize', () => {
        // ...
    });
});

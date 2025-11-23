import { render, screen } from '@testing-library/react';
import CardHeader from '@/components/DegenCard/CardHeader';

describe('DegenCard/CardHeader', () => {
    const mockProps = {
        degenScore: 85,
        rank: 'S',
        level: 15,
    };

    it('should render degen score', () => {
        render(<CardHeader {...mockProps} />);
        expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should display rank', () => {
        render(<CardHeader {...mockProps} />);
        expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('should show level', () => {
        render(<CardHeader {...mockProps} />);
        expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should render title', () => {
        render(<CardHeader {...mockProps} title="DEGEN SCORE" />);
        expect(screen.getByText('DEGEN SCORE')).toBeInTheDocument();
    });

    it('should show color based on score', () => {
        const { container } = render(<CardHeader {...mockProps} />);
        expect(container.querySelector('[class*="text-green"], [class*="text-yellow"]')).toBeInTheDocument();
    });

    it('should handle low scores', () => {
        render(<CardHeader {...mockProps} degenScore={25} rank="F" />);
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('F')).toBeInTheDocument();
    });

    it('should handle perfect scores', () => {
        render(<CardHeader {...mockProps} degenScore={100} rank="S++" />);
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('S++')).toBeInTheDocument();
    });

    it('should display badges', () => {
        render(<CardHeader {...mockProps} badges={['🏆', '💎']} />);
        expect(screen.getByText('🏆')).toBeInTheDocument();
        expect(screen.getByText('💎')).toBeInTheDocument();
    });

    it('should show gradient background', () => {
        const { container } = render(<CardHeader {...mockProps} />);
        expect(container.querySelector('[class*="gradient"]')).toBeInTheDocument();
    });

    it('should handle custom rank colors', () => {
        render(<CardHeader {...mockProps} rank="SSS" rankColor="gold" />);
        const rankElement = screen.getByText('SSS');
        expect(rankElement.parentElement).toHaveClass expect.stringContaining('gold');
    });
});

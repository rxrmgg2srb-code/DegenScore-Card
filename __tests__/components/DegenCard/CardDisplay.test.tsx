import { render, screen } from '@testing-library/react';
import CardDisplay from '@/components/DegenCard/CardDisplay';

describe('DegenCard/CardDisplay', () => {
    const mockData = {
        username: 'DegenKing',
        score: 99,
        rank: 'Whale',
        stats: { volume: 1000, trades: 50 },
    };

    it('should render card details', () => {
        render(<CardDisplay data={mockData} />);
        expect(screen.getByText('DegenKing')).toBeInTheDocument();
        expect(screen.getByText('99')).toBeInTheDocument();
        expect(screen.getByText('Whale')).toBeInTheDocument();
    });

    it('should show stats', () => {
        render(<CardDisplay data={mockData} />);
        expect(screen.getByText('1000')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should render avatar', () => {
        render(<CardDisplay data={mockData} />);
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
        render(<CardDisplay loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should support themes', () => {
        const { container } = render(<CardDisplay data={mockData} theme="dark" />);
        expect(container.firstChild).toHaveClass('theme-dark');
    });

    it('should show badges', () => {
        const dataWithBadges = { ...mockData, badges: ['🏆'] };
        render(<CardDisplay data={dataWithBadges} />);
        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<CardDisplay data={mockData} />);
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('should handle missing data', () => {
        render(<CardDisplay data={null} />);
        expect(screen.queryByText('DegenKing')).not.toBeInTheDocument();
    });

    it('should display qr code', () => {
        render(<CardDisplay data={mockData} showQR={true} />);
        expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });

    it('should animate entry', () => {
        const { container } = render(<CardDisplay data={mockData} />);
        expect(container.firstChild).toHaveClass('animate-fade-in');
    });
});

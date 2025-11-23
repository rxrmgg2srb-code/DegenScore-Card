import { render, screen, fireEvent } from '@testing-library/react';
import CompareContent from '@/components/CompareContent';

describe('CompareContent', () => {
    const mockCards = [
        { id: '1', wallet: 'alice', score: 90 },
        { id: '2', wallet: 'bob', score: 80 },
    ];

    it('should render comparison view', () => {
        render(<CompareContent cards={mockCards} />);
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should display scores side by side', () => {
        render(<CompareContent cards={mockCards} />);
        expect(screen.getByText('90')).toBeInTheDocument();
        expect(screen.getByText('80')).toBeInTheDocument();
    });

    it('should show score difference', () => {
        render(<CompareContent cards={mockCards} />);
        expect(screen.getByText('+10')).toBeInTheDocument();
    });

    it('should allow adding more cards', () => {
        render(<CompareContent cards={mockCards} />);
        expect(screen.getByText(/add/i)).toBeInTheDocument();
    });

    it('should remove card', () => {
        const onRemove = jest.fn();
        render(<CompareContent cards={mockCards} onRemove={onRemove} />);
        const removeBtns = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeBtns[0]);
        expect(onRemove).toHaveBeenCalledWith('1');
    });

    it('should highlight winner', () => {
        render(<CompareContent cards={mockCards} />);
        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should compare detailed metrics', () => {
        render(<CompareContent cards={mockCards} showDetails={true} />);
        expect(screen.getByText(/volume/i)).toBeInTheDocument();
        expect(screen.getByText(/trades/i)).toBeInTheDocument();
    });

    it('should handle empty state', () => {
        render(<CompareContent cards={[]} />);
        expect(screen.getByText(/select cards/i)).toBeInTheDocument();
    });

    it('should share comparison', () => {
        const onShare = jest.fn();
        render(<CompareContent cards={mockCards} onShare={onShare} />);
        fireEvent.click(screen.getByText(/share/i));
        expect(onShare).toHaveBeenCalled();
    });

    it('should support mobile view', () => {
        // Mock viewport or check responsive classes
        const { container } = render(<CompareContent cards={mockCards} />);
        expect(container.firstChild).toHaveClass('flex-col md:flex-row');
    });
});

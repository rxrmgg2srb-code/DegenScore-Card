import { render, screen } from '@testing-library/react';
import LeaderboardContent from '@/components/LeaderboardContent';

describe('LeaderboardContent', () => {
    it('should render content', () => {
        render(<LeaderboardContent />);
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should display headers', () => {
        render(<LeaderboardContent />);
        expect(screen.getByText(/rank/i)).toBeInTheDocument();
        expect(screen.getByText(/wallet/i)).toBeInTheDocument();
        expect(screen.getByText(/score/i)).toBeInTheDocument();
    });

    it('should render rows', () => {
        const data = [{ rank: 1, wallet: 'test', score: 100 }];
        render(<LeaderboardContent data={data} />);
        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should handle loading', () => {
        render(<LeaderboardContent loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should handle error', () => {
        render(<LeaderboardContent error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should support row click', () => {
        const onRowClick = jest.fn();
        const data = [{ rank: 1, wallet: 'test', score: 100 }];
        render(<LeaderboardContent data={data} onRowClick={onRowClick} />);
        fireEvent.click(screen.getByText('test'));
        expect(onRowClick).toHaveBeenCalled();
    });

    it('should format wallet addresses', () => {
        const data = [{ rank: 1, wallet: '0x1234567890abcdef', score: 100 }];
        render(<LeaderboardContent data={data} />);
        expect(screen.getByText('0x12...cdef')).toBeInTheDocument();
    });

    it('should show rank icons', () => {
        const data = [{ rank: 1, wallet: 'test', score: 100 }];
        render(<LeaderboardContent data={data} />);
        expect(screen.getByText('🥇')).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<LeaderboardContent />);
        expect(container.firstChild).toHaveClass('overflow-x-auto');
    });

    it('should support custom columns', () => {
        // ...
    });
});

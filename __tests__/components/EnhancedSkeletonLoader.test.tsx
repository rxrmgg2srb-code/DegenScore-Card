import { render, screen } from '@testing-library/react';
import EnhancedSkeletonLoader from '@/components/EnhancedSkeletonLoader';

describe('EnhancedSkeletonLoader', () => {
    it('should render skeleton', () => {
        render(<EnhancedSkeletonLoader />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should support different shapes', () => {
        const { container } = render(<EnhancedSkeletonLoader variant="circle" />);
        expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('should support custom dimensions', () => {
        const { container } = render(<EnhancedSkeletonLoader width={100} height={50} />);
        expect(container.firstChild).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('should animate pulse', () => {
        const { container } = render(<EnhancedSkeletonLoader animation="pulse" />);
        expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('should animate wave', () => {
        const { container } = render(<EnhancedSkeletonLoader animation="wave" />);
        expect(container.firstChild).toHaveClass('animate-shimmer');
    });

    it('should support custom colors', () => {
        const { container } = render(<EnhancedSkeletonLoader color="red" />);
        expect(container.firstChild).toHaveClass('bg-red-200');
    });

    it('should render multiple lines', () => {
        render(<EnhancedSkeletonLoader count={3} />);
        expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    });

    it('should be accessible', () => {
        render(<EnhancedSkeletonLoader />);
        expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support dark mode', () => {
        const { container } = render(<EnhancedSkeletonLoader theme="dark" />);
        expect(container.firstChild).toHaveClass('dark:bg-gray-700');
    });

    it('should handle className prop', () => {
        const { container } = render(<EnhancedSkeletonLoader className="custom" />);
        expect(container.firstChild).toHaveClass('custom');
    });
});

import { render, screen, fireEvent } from '@testing-library/react';
import HeroButton from '@/components/HeroButton';

describe('HeroButton', () => {
    const mockProps = {
        onClick: jest.fn(),
        children: 'Click Me',
    };

    it('should render button', () => {
        render(<HeroButton {...mockProps} />);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should handle click events', () => {
        render(<HeroButton {...mockProps} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockProps.onClick).toHaveBeenCalled();
    });

    it('should show loading state', () => {
        render(<HeroButton {...mockProps} loading={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should support disabled state', () => {
        render(<HeroButton {...mockProps} disabled={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should support different variants', () => {
        const { container } = render(<HeroButton {...mockProps} variant="secondary" />);
        expect(container.firstChild).toHaveClass('bg-secondary');
    });

    it('should support different sizes', () => {
        const { container } = render(<HeroButton {...mockProps} size="large" />);
        expect(container.firstChild).toHaveClass('text-lg');
    });

    it('should render icon', () => {
        render(<HeroButton {...mockProps} icon={<span>🚀</span>} />);
        expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('should be full width', () => {
        const { container } = render(<HeroButton {...mockProps} fullWidth={true} />);
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('should animate on hover', () => {
        const { container } = render(<HeroButton {...mockProps} />);
        fireEvent.mouseEnter(screen.getByRole('button'));
        expect(container.firstChild).toHaveClass('hover:scale-105');
    });

    it('should handle custom className', () => {
        const { container } = render(<HeroButton {...mockProps} className="custom" />);
        expect(container.firstChild).toHaveClass('custom');
    });
});

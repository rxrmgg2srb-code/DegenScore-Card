import { render, screen } from '@testing-library/react';
import ScarcityBanner from '@/components/ScarcityBanner';

describe('ScarcityBanner', () => {
    it('should render banner', () => {
        render(<ScarcityBanner />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display message', () => {
        render(<ScarcityBanner message="Only 5 left!" />);
        expect(screen.getByText('Only 5 left!')).toBeInTheDocument();
    });

    it('should show countdown', () => {
        render(<ScarcityBanner expiresAt={new Date(Date.now() + 10000)} />);
        expect(screen.getByText(/:/)).toBeInTheDocument();
    });

    it('should handle expiration', () => {
        render(<ScarcityBanner expiresAt={new Date(Date.now() - 1000)} />);
        expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });

    it('should be dismissible', () => {
        const onClose = jest.fn();
        render(<ScarcityBanner onClose={onClose} />);
        fireEvent.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalled();
    });

    it('should animate urgency', () => {
        const { container } = render(<ScarcityBanner urgent={true} />);
        expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('should support links', () => {
        render(<ScarcityBanner link="/upgrade" linkText="Upgrade" />);
        expect(screen.getByText('Upgrade')).toHaveAttribute('href', '/upgrade');
    });

    it('should handle different types', () => {
        const { container } = render(<ScarcityBanner type="warning" />);
        expect(container.firstChild).toHaveClass('bg-yellow-500');
    });

    it('should be accessible', () => {
        // ...
    });

    it('should persist dismissal', () => {
        // ...
    });
});

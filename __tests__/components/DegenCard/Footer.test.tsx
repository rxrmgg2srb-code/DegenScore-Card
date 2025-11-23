import { render, screen } from '@testing-library/react';
import Footer from '@/components/DegenCard/Footer';

describe('DegenCard/Footer', () => {
    it('should render footer links', () => {
        render(<Footer />);
        expect(screen.getByText(/terms/i)).toBeInTheDocument();
        expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    });

    it('should display copyright', () => {
        render(<Footer />);
        expect(screen.getByText(/copyright/i)).toBeInTheDocument();
    });

    it('should show social icons', () => {
        render(<Footer />);
        expect(screen.getByLabelText(/twitter/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/discord/i)).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<Footer />);
        expect(container.firstChild).toHaveClass('flex-col md:flex-row');
    });

    it('should render logo', () => {
        render(<Footer />);
        expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    });

    it('should have accessible links', () => {
        render(<Footer />);
        const links = screen.getAllByRole('link');
        links.forEach(link => {
            expect(link).toHaveAttribute('href');
        });
    });

    it('should display version', () => {
        render(<Footer version="1.0.0" />);
        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should support dark mode', () => {
        const { container } = render(<Footer theme="dark" />);
        expect(container.firstChild).toHaveClass('bg-gray-900');
    });

    it('should render newsletter signup', () => {
        render(<Footer showNewsletter={true} />);
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    it('should handle custom classes', () => {
        const { container } = render(<Footer className="custom" />);
        expect(container.firstChild).toHaveClass('custom');
    });
});

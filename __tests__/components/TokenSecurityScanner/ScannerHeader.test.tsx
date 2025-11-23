import { render, screen } from '@testing-library/react';
import ScannerHeader from '@/components/TokenSecurityScanner/ScannerHeader';

describe('TokenSecurityScanner/ScannerHeader', () => {
    it('should render title', () => {
        render(<ScannerHeader />);
        expect(screen.getByText(/Token Security Scanner/i)).toBeInTheDocument();
    });

    it('should display subtitle', () => {
        render(<ScannerHeader />);
        expect(screen.getByText(/Analyze/i)).toBeInTheDocument();
    });

    it('should show logo', () => {
        const { container } = render(<ScannerHeader />);
        expect(container.querySelector('img, svg')).toBeInTheDocument();
    });

    it('should render beta badge', () => {
        render(<ScannerHeader />);
        expect(screen.getByText(/beta/i)).toBeInTheDocument();
    });

    it('should have proper styling', () => {
        const { container } = render(<ScannerHeader />);
        expect(container.firstChild).toHaveClass('flex');
    });

    it('should be responsive', () => {
        const { container } = render(<ScannerHeader />);
        expect(container.querySelector('[class*="md:"]')).toBeInTheDocument();
    });

    it('should display icon', () => {
        render(<ScannerHeader />);
        expect(screen.getByText(/🔒/)).toBeInTheDocument();
    });

    it('should show version number', () => {
        render(<ScannerHeader />);
        expect(screen.getByText(/v1/i)).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        render(<ScannerHeader />);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('should have gradient background', () => {
        const { container } = render(<ScannerHeader />);
        expect(container.querySelector('[class*="gradient"]')).toBeInTheDocument();
    });
});

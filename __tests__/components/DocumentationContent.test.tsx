import { render, screen } from '@testing-library/react';
import DocumentationContent from '@/components/DocumentationContent';

describe('DocumentationContent', () => {
    it('should render documentation', () => {
        render(<DocumentationContent />);
        expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should display table of contents', () => {
        render(<DocumentationContent />);
        expect(screen.getByText(/contents/i)).toBeInTheDocument();
    });

    it('should render sections', () => {
        render(<DocumentationContent />);
        expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
    });

    it('should show code blocks', () => {
        const { container } = render(<DocumentationContent />);
        expect(container.querySelector('pre')).toBeInTheDocument();
    });

    it('should have accessible links', () => {
        render(<DocumentationContent />);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('should support search', () => {
        render(<DocumentationContent showSearch={true} />);
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<DocumentationContent />);
        expect(container.firstChild).toHaveClass('prose');
    });

    it('should handle dark mode', () => {
        const { container } = render(<DocumentationContent theme="dark" />);
        expect(container.firstChild).toHaveClass('dark:prose-invert');
    });

    it('should render navigation', () => {
        render(<DocumentationContent />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should display last updated', () => {
        render(<DocumentationContent lastUpdated="2024-01-01" />);
        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
    });
});

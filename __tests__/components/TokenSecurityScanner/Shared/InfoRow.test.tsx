import { render, screen } from '@testing-library/react';
import InfoRow from '@/components/TokenSecurityScanner/Shared/InfoRow';

describe('TokenSecurityScanner/Shared/InfoRow', () => {
    it('should render label and value', () => {
        render(<InfoRow label="Token Name" value="TEST" />);
        expect(screen.getByText('Token Name')).toBeInTheDocument();
        expect(screen.getByText('TEST')).toBeInTheDocument();
    });

    it('should apply custom value class', () => {
        render(<InfoRow label="Score" value="95" valueClass="text-green-500" />);
        const value = screen.getByText('95');
        expect(value).toHaveClass('text-green-500');
    });

    it('should render with icon', () => {
        render(<InfoRow label="Status" value="Active" icon="✓" />);
        expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should handle numeric values', () => {
        render(<InfoRow label="Count" value={100} />);
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle boolean values', () => {
        render(<InfoRow label="Verified" value={true} />);
        expect(screen.getByText('true')).toBeInTheDocument();
    });

    it('should support tooltips', () => {
        render(<InfoRow label="Info" value="Test" tooltip="Additional info" />);
        expect(screen.getByTitle('Additional info')).toBeInTheDocument();
    });

    it('should handle long values', () => {
        const long = 'a'.repeat(100);
        render(<InfoRow label="Address" value={long} />);
        expect(screen.getByText(long)).toBeInTheDocument();
    });

    it('should render as list item', () => {
        const { container } = render(<InfoRow label="Test" value="Value" />);
        expect(container.querySelector('li, div')).toBeInTheDocument();
    });

    it('should support custom styling', () => {
        render(<InfoRow label="Custom" value="Styled" className="custom-class" />);
        expect(screen.getByText('Custom').parentElement).toHaveClass('custom-class');
    });

    it('should handle empty values', () => {
        render(<InfoRow label="Empty" value="" />);
        expect(screen.getByText('Empty')).toBeInTheDocument();
    });
});

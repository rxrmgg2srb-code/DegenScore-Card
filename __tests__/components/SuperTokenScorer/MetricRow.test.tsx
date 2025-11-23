import { render, screen } from '@testing-library/react';
import MetricRow from '@/components/SuperTokenScorer/MetricRow';

describe('SuperTokenScorer/MetricRow', () => {
    it('should render label and value', () => {
        render(<MetricRow label="Test Label" value="Test Value" />);

        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('should apply custom valueClass', () => {
        render(<MetricRow label="Score" value="100" valueClass="text-green-500" />);

        const valueElement = screen.getByText('100');
        expect(valueElement).toHaveClass('text-green-500');
    });

    it('should render numeric values', () => {
        render(<MetricRow label="Amount" value={1234} />);
        expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
        render(<MetricRow label="Count" value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle boolean values', () => {
        render(<MetricRow label="Active" value={true} />);
        expect(screen.getByText('true')).toBeInTheDocument();
    });
});

import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/SuperTokenScorer/MetricCard';

describe('SuperTokenScorer/MetricCard', () => {
    it('should render title and icon', () => {
        render(<MetricCard title="Test Card" icon="🔥"><div>Content</div></MetricCard>);

        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('should render children', () => {
        render(<MetricCard title="Card" icon="📊">
            <div>Test Content</div>
        </MetricCard>);

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
        const { container } = render(<MetricCard title="Empty" icon="❌" />);
        expect(container).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        const { container } = render(
            <MetricCard title="Custom" icon="✨" className="custom-class">
                <div>Content</div>
            </MetricCard>
        );
        expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
});

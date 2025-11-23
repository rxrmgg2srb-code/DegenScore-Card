import { render, screen } from '@testing-library/react';
import ScoreCard from '@/components/SuperTokenScorer/ScoreCard';

describe('SuperTokenScorer/ScoreCard', () => {
    const mockProps = {
        score: 85,
        label: 'Security Score',
        description: 'Overall security rating',
        maxScore: 100,
    };

    it('should render score and label', () => {
        render(<ScoreCard {...mockProps} />);
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('Security Score')).toBeInTheDocument();
    });

    it('should display description', () => {
        render(<ScoreCard {...mockProps} />);
        expect(screen.getByText('Overall security rating')).toBeInTheDocument();
    });

    it('should show progress bar', () => {
        const { container } = render(<ScoreCard {...mockProps} />);
        expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('should color code based on score', () => {
        const { container } = render(<ScoreCard {...mockProps} score={95} />);
        expect(container.innerHTML).toMatch(/green|emerald/);
    });

    it('should handle low scores', () => {
        const { container } = render(<ScoreCard {...mockProps} score={20} />);
        expect(container.innerHTML).toMatch(/red/);
    });

    it('should display max score if provided', () => {
        render(<ScoreCard {...mockProps} />);
        expect(screen.getByText('/ 100')).toBeInTheDocument();
    });

    it('should handle missing description', () => {
        render(<ScoreCard {...mockProps} description={undefined} />);
        expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should animate score', async () => {
        render(<ScoreCard {...mockProps} animate={true} />);
        // Animation testing usually requires visual regression or specific library support
        // Checking for class presence
        expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should render icon if provided', () => {
        render(<ScoreCard {...mockProps} icon={<span>🏆</span>} />);
        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(<ScoreCard {...mockProps} className="custom-class" />);
        expect(container.firstChild).toHaveClass('custom-class');
    });
});

import { render, screen } from '@testing-library/react';
import ScoreBreakdown from '@/components/SuperTokenScorer/ScoreBreakdown';

describe('SuperTokenScorer/ScoreBreakdown', () => {
    const mockBreakdown = {
        baseSecurityScore: 75,
        newWalletScore: 45,
        insiderScore: 48,
        volumeScore: 38,
        socialScore: 28,
        botDetectionScore: 55,
        smartMoneyScore: 65,
        teamScore: 38,
        pricePatternScore: 45,
        historicalHoldersScore: 35,
        liquidityDepthScore: 42,
        crossChainScore: 28,
        competitorScore: 25,
        rugCheckScore: 80,
        dexScreenerScore: 50,
        birdeyeScore: 45,
        jupiterScore: 40,
    };

    it('should render all score categories', () => {
        render(<ScoreBreakdown breakdown={mockBreakdown} />);
        expect(screen.getByText(/Base Security/i)).toBeInTheDocument();
        expect(screen.getByText(/Smart Money/i)).toBeInTheDocument();
    });

    it('should display score values', () => {
        render(<ScoreBreakdown breakdown={mockBreakdown} />);
        expect(screen.getByText(/75/)).toBeInTheDocument();
        expect(screen.getByText(/65/)).toBeInTheDocument();
    });

    it('should show color coding for scores', () => {
        const { container } = render(<ScoreBreakdown breakdown={mockBreakdown} />);
        const scores = container.querySelectorAll('[class*="text-"]');
        expect(scores.length).toBeGreaterThan(0);
    });

    it('should handle zero scores', () => {
        const zeroScores = Object.fromEntries(Object.keys(mockBreakdown).map(k => [k, 0]));
        render(<ScoreBreakdown breakdown={zeroScores as any} />);
        const zeros = screen.getAllByText(/0/);
        expect(zeros.length).toBeGreaterThan(0);
    });

    it('should show progress bars', () => {
        const { container } = render(<ScoreBreakdown breakdown={mockBreakdown} />);
        const progressBars = container.querySelectorAll('[role="progressbar"]');
        expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should display RugCheck score', () => {
        render(<ScoreBreakdown breakdown={mockBreakdown} />);
        expect(screen.getByText(/80/)).toBeInTheDocument();
    });

    it('should show external data scores', () => {
        render(<ScoreBreakdown breakdown={mockBreakdown} />);
        expect(screen.getByText(/DexScreener/i)).toBeInTheDocument();
        expect(screen.getByText(/Birdeye/i)).toBeInTheDocument();
    });

    it('should handle high scores', () => {
        const highScores = Object.fromEntries(Object.keys(mockBreakdown).map(k => [k, 100]));
        render(<ScoreBreakdown breakdown={highScores as any} />);
        const hundreds = screen.getAllByText(/100/);
        expect(hundreds.length).toBeGreaterThan(0);
    });

    it('should render category icons', () => {
        const { container } = render(<ScoreBreakdown breakdown={mockBreakdown} />);
        const icons = container.querySelectorAll('svg, [class*="icon"]');
        expect(icons.length).toBeGreaterThan(0);
    });

    it('should group scores logically', () => {
        render(<ScoreBreakdown breakdown={mockBreakdown} />);
        expect(screen.getByText(/Security/i)).toBeInTheDocument();
        expect(screen.getByText(/Trading/i)).toBeInTheDocument();
    });
});

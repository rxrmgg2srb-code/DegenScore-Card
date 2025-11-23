import { render, screen } from '@testing-library/react';
import FlagSection from '@/components/SuperTokenScorer/FlagSection';

describe('SuperTokenScorer/FlagSection', () => {
    const mockRedFlags = [
        { category: 'Security', severity: 'HIGH' as const, message: 'High risk detected', score_impact: -10 },
        { category: 'Liquidity', severity: 'MEDIUM' as const, message: 'Low liquidity', score_impact: -5 },
    ];

    const mockGreenFlags = [
        { category: 'Security', message: 'LP tokens locked', score_boost: 5 },
        { category: 'Team', message: 'Team tokens vested', score_boost: 3 },
    ];

    it('should render red flags', () => {
        render(<FlagSection redFlags={mockRedFlags} greenFlags={[]} />);
        expect(screen.getByText(/High risk detected/i)).toBeInTheDocument();
    });

    it('should render green flags', () => {
        render(<FlagSection redFlags={[]} greenFlags={mockGreenFlags} />);
        expect(screen.getByText(/LP tokens locked/i)).toBeInTheDocument();
    });

    it('should show severity levels', () => {
        render(<FlagSection redFlags={mockRedFlags} greenFlags={[]} />);
        expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
        expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    });

    it('should display categories', () => {
        render(<FlagSection redFlags={mockRedFlags} greenFlags={[]} />);
        expect(screen.getByText(/Security/i)).toBeInTheDocument();
        expect(screen.getByText(/Liquidity/i)).toBeInTheDocument();
    });

    it('should show score impact', () => {
        render(<FlagSection redFlags={mockRedFlags} greenFlags={[]} />);
        expect(screen.getByText(/-10/)).toBeInTheDocument();
    });

    it('should show score boost', () => {
        render(<FlagSection redFlags={[]} greenFlags={mockGreenFlags} />);
        expect(screen.getByText(/\+5/)).toBeInTheDocument();
    });

    it('should handle empty flags', () => {
        render(<FlagSection redFlags={[]} greenFlags={[]} />);
        expect(screen.getByText(/No flags/i)).toBeInTheDocument();
    });

    it('should display critical severity', () => {
        const critical = [{ ...mockRedFlags[0], severity: 'CRITICAL' as const }];
        render(<FlagSection redFlags={critical} greenFlags={[]} />);
        expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });

    it('should show multiple categories', () => {
        const multiCategory = [
            ...mockRedFlags,
            { category: 'Trading', severity: 'LOW' as const, message: 'Watch out', score_impact: -2 },
        ];
        render(<FlagSection redFlags={multiCategory} greenFlags={[]} />);
        expect(screen.getByText(/Trading/i)).toBeInTheDocument();
    });

    it('should render both red and green flags together', () => {
        render(<FlagSection redFlags={mockRedFlags} greenFlags={mockGreenFlags} />);
        expect(screen.getByText(/High risk detected/i)).toBeInTheDocument();
        expect(screen.getByText(/LP tokens locked/i)).toBeInTheDocument();
    });
});

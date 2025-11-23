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
        render(<FlagSection result={{ allRedFlags: mockRedFlags, greenFlags: [] } as any} />);
        expect(screen.getByText(/High risk detected/i)).toBeInTheDocument();
    });

    it('should render green flags', () => {
        render(<FlagSection result={{ allRedFlags: [], greenFlags: mockGreenFlags } as any} />);
        expect(screen.getByText(/LP tokens locked/i)).toBeInTheDocument();
    });

    it('should show severity levels', () => {
        render(<FlagSection result={{ allRedFlags: mockRedFlags, greenFlags: [] } as any} />);
        expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
        expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    });

    it('should display categories', () => {
        render(<FlagSection result={{ allRedFlags: mockRedFlags, greenFlags: [] } as any} />);
        expect(screen.getByText(/Security/i)).toBeInTheDocument();
        expect(screen.getByText(/Liquidity/i)).toBeInTheDocument();
    });

    it('should show score impact', () => {
        render(<FlagSection result={{ allRedFlags: mockRedFlags, greenFlags: [] } as any} />);
        expect(screen.getByText(/-10/)).toBeInTheDocument();
    });

    it('should show score boost', () => {
        render(<FlagSection result={{ allRedFlags: [], greenFlags: mockGreenFlags } as any} />);
        expect(screen.getByText(/\+5/)).toBeInTheDocument();
    });

    it('should handle empty flags', () => {
        render(<FlagSection result={{ allRedFlags: [], greenFlags: [] } as any} />);
        // The component renders nothing if flags are empty.
        // So checking for "No flags" will fail if the component doesn't render it.
        // I'll check that the container is empty.
        const { container } = render(<FlagSection result={{ allRedFlags: [], greenFlags: [] } as any} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should display critical severity', () => {
        const critical = [{ ...mockRedFlags[0], severity: 'CRITICAL' as const }];
        render(<FlagSection result={{ allRedFlags: critical, greenFlags: [] } as any} />);
        expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });

    it('should show multiple categories', () => {
        const multiCategory = [
            ...mockRedFlags,
            { category: 'Trading', severity: 'LOW' as const, message: 'Watch out', score_impact: -2 },
        ];
        render(<FlagSection result={{ allRedFlags: multiCategory, greenFlags: [] } as any} />);
        expect(screen.getByText(/Trading/i)).toBeInTheDocument();
    });

    it('should render both red and green flags together', () => {
        render(<FlagSection result={{ allRedFlags: mockRedFlags, greenFlags: mockGreenFlags } as any} />);
        expect(screen.getByText(/High risk detected/i)).toBeInTheDocument();
        expect(screen.getByText(/LP tokens locked/i)).toBeInTheDocument();
    });
});

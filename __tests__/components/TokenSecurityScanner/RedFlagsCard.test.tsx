import { render, screen } from '@testing-library/react';
import RedFlagsCard from '@/components/TokenSecurityScanner/ReportCards/RedFlagsCard';

describe('TokenSecurityScanner/RedFlagsCard', () => {
    const mockFlags = [
        { severity: 'CRITICAL', message: 'Honeypot detected', category: 'Trading' },
        { severity: 'HIGH', message: 'LP not locked', category: 'Liquidity' },
        { severity: 'MEDIUM', message: 'High concentration', category: 'Holders' },
    ];

    it('should render all flags', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        expect(screen.getByText(/Honeypot detected/)).toBeInTheDocument();
        expect(screen.getByText(/LP not locked/)).toBeInTheDocument();
        expect(screen.getByText(/High concentration/)).toBeInTheDocument();
    });

    it('should show severity levels', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        expect(screen.getByText('CRITICAL')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('should display categories', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        expect(screen.getByText('Trading')).toBeInTheDocument();
        expect(screen.getByText('Liquidity')).toBeInTheDocument();
    });

    it('should handle empty flags', () => {
        render(<RedFlagsCard flags={[]} />);
        expect(screen.getByText(/no red flags/i)).toBeInTheDocument();
    });

    it('should color code by severity', () => {
        const { container } = render(<RedFlagsCard flags={mockFlags} />);
        expect(container.querySelector('[class*="bg-red"]')).toBeInTheDocument();
    });

    it('should show critical flags first', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        const flagElements = screen.getAllByRole('listitem');
        expect(flagElements[0]).toHaveTextContent('CRITICAL');
    });

    it('should count total flags', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('should display warning icons', () => {
        render(<RedFlagsCard flags={mockFlags} />);
        expect(screen.getAllByText(/⚠️|🚫/).length).toBeGreaterThan(0);
    });

    it('should handle low severity flags', () => {
        const lowFlags = [{ severity: 'LOW' as const, message: 'Minor issue', category: 'Other' }];
        render(<RedFlagsCard flags={lowFlags} />);
        expect(screen.getByText('LOW')).toBeInTheDocument();
    });

    it('should group by category', () => {
        render(<RedFlagsCard flags={mockFlags} groupByCategory={true} />);
        expect(screen.getAllByText(/Trading|Liquidity|Holders/).length).toBeGreaterThan(0);
    });
});

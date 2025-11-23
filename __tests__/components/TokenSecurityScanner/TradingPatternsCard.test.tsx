import { render, screen } from '@testing-library/react';
import TradingPatternsCard from '@/components/TokenSecurityScanner/ReportCards/TradingPatternsCard';

describe('TokenSecurityScanner/TradingPatternsCard', () => {
    const mockData = {
        bundleBots: 5,
        snipers: 10,
        washTrading: false,
        suspiciousVolume: false,
        honeypotDetected: false,
        canSell: true,
        avgBuyTax: 0,
        avgSellTax: 0,
        riskLevel: 'LOW' as const,
        score: 14,
    };

    it('should render trading pattern data', () => {
        render(<TradingPatternsCard patterns={mockData} />);
        expect(screen.getByText(/5/)).toBeInTheDocument();
        expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('should show honeypot warning when detected', () => {
        const honeypot = { ...mockData, honeypotDetected: true, canSell: false };
        render(<TradingPatternsCard patterns={honeypot} />);
        expect(screen.getByText(/honeypot/i)).toBeInTheDocument();
    });

    it('should display wash trading alert', () => {
        const washTrading = { ...mockData, washTrading: true, suspiciousVolume: true };
        render(<TradingPatternsCard patterns={washTrading} />);
        expect(screen.getByText(/wash/i)).toBeInTheDocument();
    });

    it('should show critical risk level', () => {
        const critical = { ...mockData, riskLevel: 'CRITICAL' as const, honeypotDetected: true };
        render(<TradingPatternsCard patterns={critical} />);
        expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });

    it('should display tax information', () => {
        const withTax = { ...mockData, avgBuyTax: 5, avgSellTax: 10 };
        render(<TradingPatternsCard patterns={withTax} />);
        expect(screen.getByText(/5/)).toBeInTheDocument();
        expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('should handle high bot activity', () => {
        const highBots = { ...mockData, bundleBots: 50, snipers: 30 };
        render(<TradingPatternsCard patterns={highBots} />);
        expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('should show canSell status', () => {
        render(<TradingPatternsCard patterns={mockData} />);
        expect(screen.getByText(/can sell/i)).toBeInTheDocument();
    });

    it('should display score', () => {
        render(<TradingPatternsCard patterns={mockData} />);
        expect(screen.getByText(/14/)).toBeInTheDocument();
    });

    it('should handle medium risk scenario', () => {
        const medium = { ...mockData, riskLevel: 'MEDIUM' as const, washTrading: true };
        render(<TradingPatternsCard patterns={medium} />);
        expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    });

    it('should alert on suspicious volume', () => {
        const suspicious = { ...mockData, suspiciousVolume: true };
        render(<TradingPatternsCard patterns={suspicious} />);
        expect(screen.getByText(/suspicious/i)).toBeInTheDocument();
    });
});

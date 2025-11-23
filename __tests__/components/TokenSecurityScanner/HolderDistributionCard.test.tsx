import { render, screen } from '@testing-library/react';
import HolderDistributionCard from '@/components/TokenSecurityScanner/ReportCards/HolderDistributionCard';

describe('TokenSecurityScanner/HolderDistributionCard', () => {
    const mockData = {
        totalHolders: 1000,
        top10HoldersPercent: 35,
        creatorPercent: 15,
        giniCoefficient: 0.45,
        concentrationRisk: 'MEDIUM' as const,
        bundleDetected: false,
        bundleWallets: 0,
        score: 15,
    };

    it('should render holder statistics', () => {
        render(<HolderDistributionCard data={mockData} />);

        expect(screen.getByText(/1000/)).toBeInTheDocument();
        expect(screen.getByText(/35/)).toBeInTheDocument();
    });

    it('should show concentration risk level', () => {
        render(<HolderDistributionCard data={mockData} />);
        expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    });

    it('should display critical risk warning', () => {
        const criticalData = { ...mockData, concentrationRisk: 'CRITICAL' as const };
        render(<HolderDistributionCard data={criticalData} />);
        expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });

    it('should show bundle detection', () => {
        const bundleData = { ...mockData, bundleDetected: true, bundleWallets: 25 };
        render(<HolderDistributionCard data={bundleData} />);
        expect(screen.getByText(/25/)).toBeInTheDocument();
    });

    it('should handle low risk scenario', () => {
        const lowRisk = { ...mockData, concentrationRisk: 'LOW' as const, top10HoldersPercent: 20 };
        render(<HolderDistributionCard data={lowRisk} />);
        expect(screen.getByText(/LOW/i)).toBeInTheDocument();
    });

    it('should display gini coefficient', () => {
        render(<HolderDistributionCard data={mockData} />);
        expect(screen.getByText(/0\.45/)).toBeInTheDocument();
    });

    it('should render score correctly', () => {
        render(<HolderDistributionCard data={mockData} />);
        expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should handle zero holders', () => {
        const zeroData = { ...mockData, totalHolders: 0 };
        render(<HolderDistributionCard data={zeroData} />);
        expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should show high creator percentage warning', () => {
        const highCreator = { ...mockData, creatorPercent: 60 };
        render(<HolderDistributionCard data={highCreator} />);
        expect(screen.getByText(/60/)).toBeInTheDocument();
    });

    it('should handle extreme concentration', () => {
        const extreme = {
            ...mockData,
            top10HoldersPercent: 95,
            concentrationRisk: 'CRITICAL' as const,
        };
        render(<HolderDistributionCard data={extreme} />);
        expect(screen.getByText(/95/)).toBeInTheDocument();
        expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });
});

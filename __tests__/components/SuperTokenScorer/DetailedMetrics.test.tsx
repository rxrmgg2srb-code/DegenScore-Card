import { render, screen } from '@testing-library/react';
import DetailedMetrics from '@/components/SuperTokenScorer/DetailedMetrics';
import { SuperTokenScore } from '@/lib/services/superTokenScorer';

// Mock utility color functions
jest.mock('@/lib/utils/token-scoring', () => ({
    getRiskColor: () => 'text-red-400',
    getSignalColor: () => 'text-green-400',
    getPatternColor: () => 'text-blue-400',
    getLiquidityColor: () => 'text-purple-400',
}));

const mockResult: SuperTokenScore = {
    newWalletAnalysis: {
        walletsUnder10Days: 5,
        percentageNewWallets: 12.3,
        avgWalletAge: 8.5,
        suspiciousNewWallets: 1,
        riskLevel: 'Medium',
    },
    insiderAnalysis: {
        insiderWallets: 3,
        insiderHoldings: 45.6,
        earlyBuyers: 2,
        insiderProfitTaking: false,
    },
    volumeAnalysis: {
        volume24h: 1234567,
        realVolume: 987654,
        fakeVolumePercent: 15.2,
        volumeTrend: 'Upward',
    },
    socialAnalysis: {
        hasTwitter: true,
        twitterFollowers: 1200,
        hasTelegram: false,
        telegramMembers: 0,
        hasWebsite: true,
        websiteSSL: true,
        hasDiscord: true,
        discordMembers: 300,
    },
    botDetection: {
        totalBots: 4,
        botPercent: 22.5,
        mevBots: 1,
        bundleBots: 2,
        washTradingBots: 1,
    },
    smartMoneyAnalysis: {
        smartMoneyWallets: 7,
        smartMoneyHoldings: 33.3,
        signal: 'Buy',
        averageSmartMoneyProfit: 12.5,
    },
    teamAnalysis: {
        teamTokensLocked: true,
        teamAllocation: 15.0,
        vestingSchedule: true,
        vestingDuration: 12,
        teamSelling: false,
    },
    pricePattern: {
        pattern: 'Bullish',
        volatility: 8.4,
        priceStability: 92.1,
        trendStrength: 75.0,
    },
    liquidityDepth: {
        liquidityHealth: 'Good',
        slippage1SOL: 0.12,
        slippage10SOL: 0.45,
        slippage100SOL: 1.23,
    },
};

describe('DetailedMetrics', () => {
    it('renders new wallets analysis correctly', () => {
        render(<DetailedMetrics result={mockResult} />);
        expect(screen.getByText(/Análisis de Wallets Nuevas/i)).toBeInTheDocument();
        expect(screen.getByText(/5 \(12.3%\)/)).toBeInTheDocument();
        expect(screen.getByText(/8.5 días/)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // suspicious wallets
        expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('shows insider analysis profit taking status', () => {
        render(<DetailedMetrics result={mockResult} />);
        expect(screen.getByText(/Análisis de Insiders/i)).toBeInTheDocument();
        expect(screen.getByText('✅ NO')).toBeInTheDocument();
    });

    it('displays volume fake percentage with correct color class', () => {
        render(<DetailedMetrics result={mockResult} />);
        const fakePercent = screen.getByText('15.2%');
        expect(fakePercent).toBeInTheDocument();
        // The mocked getRiskColor returns text-red-400 for risk, but fake volume uses conditional class
        // Since 15.2 < 30, should have green class
        expect(fakePercent.parentElement).toHaveClass('text-green-400');
    });

    it('renders bot detection percentages with correct color', () => {
        render(<DetailedMetrics result={mockResult} />);
        const botPercent = screen.getByText('22.5%');
        expect(botPercent).toBeInTheDocument();
        // 22.5 < 40 => green class
        expect(botPercent.parentElement).toHaveClass('text-green-400');
    });

    it('shows smart money signal with mocked color', () => {
        render(<DetailedMetrics result={mockResult} />);
        expect(screen.getByText('Buy')).toBeInTheDocument();
        // getSignalColor mocked to text-green-400
        const signalElement = screen.getByText('Buy');
        expect(signalElement.parentElement).toHaveClass('text-green-400');
    });

    it('displays liquidity health with mocked color', () => {
        render(<DetailedMetrics result={mockResult} />);
        expect(screen.getByText('Good')).toBeInTheDocument();
        const healthElement = screen.getByText('Good');
        expect(healthElement.parentElement).toHaveClass('text-purple-400');
    });
});

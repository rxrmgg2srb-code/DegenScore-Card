import React from 'react';
import { render, screen } from '@testing-library/react';
import DetailedMetrics from '@/components/SuperTokenScorer/DetailedMetrics';
import { SuperTokenScore } from '@/lib/services/superTokenScorer';

describe('SuperTokenScorer/DetailedMetrics', () => {
    const mockResult: SuperTokenScore = {
        tokenAddress: 'test-token',
        tokenSymbol: 'TEST',
        tokenName: 'Test Token',
        newWalletAnalysis: {
            totalWallets: 1000,
            walletsUnder10Days: 50,
            percentageNewWallets: 5,
            avgWalletAge: 45,
            suspiciousNewWallets: 2,
            riskLevel: 'LOW',
            score: 45,
        },
        insiderAnalysis: {
            insiderWallets: 5,
            insiderHoldings: 10,
            earlyBuyers: 20,
            insiderProfitTaking: false,
            suspiciousActivity: false,
            riskLevel: 'LOW',
            score: 45,
        },
        volumeAnalysis: {
            volume24h: 1000000,
            volume7d: 5000000,
            volume30d: 15000000,
            realVolume: 950000,
            fakeVolumePercent: 5,
            volumeToLiquidityRatio: 2.5,
            volumeTrend: 'INCREASING',
            suspiciousVolume: false,
            score: 38,
        },
        socialAnalysis: {
            hasTwitter: true,
            twitterFollowers: 10000,
            twitterVerified: true,
            twitterAge: 365,
            hasTelegram: true,
            telegramMembers: 5000,
            hasWebsite: true,
            websiteSSL: true,
            websiteAge: 180,
            hasDiscord: true,
            discordMembers: 3000,
            socialScore: 28,
            suspiciousSocials: false,
            score: 28,
        },
        botDetection: {
            totalBots: 50,
            botPercent: 5,
            mevBots: 10,
            sniperBots: 5,
            bundleBots: 20,
            washTradingBots: 15,
            copyTradingBots: 0,
            suspiciousPatterns: [],
            botActivity24h: 100,
            score: 55,
        },
        smartMoneyAnalysis: {
            smartMoneyWallets: 15,
            smartMoneyHoldings: 8,
            smartMoneyBuying: true,
            smartMoneySelling: false,
            averageSmartMoneyProfit: 25,
            signal: 'BUY',
            score: 65,
        },
        teamAnalysis: {
            teamTokensLocked: true,
            teamAllocation: 10,
            vestingSchedule: true,
            vestingDuration: 24,
            teamSelling: false,
            teamWallets: 3,
            riskLevel: 'LOW',
            score: 38,
        },
        pricePattern: {
            pattern: 'ORGANIC_GROWTH',
            volatility: 30,
            priceStability: 70,
            supportLevels: [0.001, 0.0015],
            resistanceLevels: [0.003, 0.004],
            trendStrength: 75,
            score: 45,
        },
        historicalHolders: {
            holderGrowth7d: 15,
            holderGrowth30d: 50,
            holderChurn: 5,
            holderLoyalty: 85,
            diamondHandsPercent: 60,
            paperHandsPercent: 10,
            score: 35,
        },
        liquidityDepth: {
            depthPositive2: 10000,
            depthNegative2: 9500,
            depthPositive5: 25000,
            depthNegative5: 24000,
            slippage1SOL: 0.5,
            slippage10SOL: 2.0,
            slippage100SOL: 8.0,
            liquidityHealth: 'GOOD',
            score: 42,
        },
        crossChainAnalysis: {
            isBridged: false,
            bridgeRisk: 'LOW',
            score: 28,
        },
        competitorAnalysis: {
            similarTokens: [],
            marketPosition: 50,
            competitiveAdvantage: 'First mover',
            score: 25,
        },
        baseSecurityReport: {} as any,
        superScore: 78,
        scoreBreakdown: {
            baseSecurityScore: 75,
            newWalletScore: 45,
            insiderScore: 45,
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
        },
        globalRiskLevel: 'SAFE',
        recommendation: 'Good token',
        allRedFlags: [],
        greenFlags: [],
        analyzedAt: Date.now(),
        analysisTimeMs: 5000,
    };

    it('should render all metric cards', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText(/Análisis de Wallets Nuevas/i)).toBeInTheDocument();
        expect(screen.getByText(/Análisis de Insiders/i)).toBeInTheDocument();
        expect(screen.getByText(/Análisis de Volumen/i)).toBeInTheDocument();
        expect(screen.getByText(/Redes Sociales/i)).toBeInTheDocument();
        expect(screen.getByText(/Detección de Bots/i)).toBeInTheDocument();
        expect(screen.getByText(/Smart Money/i)).toBeInTheDocument();
        expect(screen.getByText(/Análisis del Equipo/i)).toBeInTheDocument();
        expect(screen.getByText(/Patrón de Precio/i)).toBeInTheDocument();
        expect(screen.getByText(/Profundidad de Liquidez/i)).toBeInTheDocument();
    });

    it('should display new wallet analysis data', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText(/50 \(5\.0%\)/i)).toBeInTheDocument();
        expect(screen.getByText(/45\.0 días/i)).toBeInTheDocument();
    });

    it('should show risk level colors', () => {
        render(<DetailedMetrics result={mockResult} />);

        const riskElements = screen.getAllByText(/LOW/i);
        expect(riskElements.length).toBeGreaterThan(0);
    });

    it('should display social analysis', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText(/10000 followers/i)).toBeInTheDocument();
        expect(screen.getByText(/5000 miembros/i)).toBeInTheDocument();
    });

    it('should show bot detection metrics', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText(/5\.0%/)).toBeInTheDocument();
    });

    it('should display smart money signal', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText('BUY')).toBeInTheDocument();
    });

    it('should handle high risk scenarios', () => {
        const highRiskResult = {
            ...mockResult,
            newWalletAnalysis: {
                ...mockResult.newWalletAnalysis,
                riskLevel: 'CRITICAL' as const,
            },
            insiderAnalysis: {
                ...mockResult.insiderAnalysis,
                insiderProfitTaking: true,
            },
        };

        render(<DetailedMetrics result={highRiskResult} />);

        expect(screen.getByText('CRITICAL')).toBeInTheDocument();
        expect(screen.getByText(/⚠️ SÍ/)).toBeInTheDocument();
    });

    it('should display liquidity health colors', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText('GOOD')).toBeInTheDocument();
    });

    it('should show slippage values', () => {
        render(<DetailedMetrics result={mockResult} />);

        expect(screen.getByText(/0\.50%/)).toBeInTheDocument();
        expect(screen.getByText(/2\.00%/)).toBeInTheDocument();
        expect(screen.getByText(/8\.00%/)).toBeInTheDocument();
    });

    it('should handle missing data gracefully', () => {
        const partialResult = {
            ...mockResult,
            socialAnalysis: {
                ...mockResult.socialAnalysis,
                hasTwitter: false,
                hasTelegram: false,
                hasWebsite: false,
                hasDiscord: false,
            },
        };

        render(<DetailedMetrics result={partialResult} />);

        const noElements = screen.getAllByText(/❌ No/i);
        expect(noElements.length).toBeGreaterThan(0);
    });
});

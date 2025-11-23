import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExternalData from '@/components/SuperTokenScorer/ExternalData';

describe('SuperTokenScorer/ExternalData', () => {
    const mockResult = {
        dexScreenerData: {
            pairAddress: 'test-pair',
            dex: 'Raydium',
            priceUSD: 0.001,
            volume24h: 100000,
            liquidity: 50000,
            fdv: 1000000,
            priceChange24h: 15,
            priceChange7d: 50,
            priceChange30d: 120,
            txns24h: { buys: 500, sells: 450 },
            holders: 1000,
            marketCap: 500000,
        },
        birdeyeData: {
            address: 'test-token',
            symbol: 'TEST',
            price: 0.001,
            liquidity: 50000,
            volume24h: 100000,
            priceChange24h: 15,
            priceChange7d: 50,
            priceChange30d: 120,
            marketCap: 500000,
            holder: 1000,
            supply: 1000000000,
            uniqueWallets24h: 300,
            trade24h: 950,
            lastTradeUnixTime: Date.now(),
        },
        solscanData: {
            address: 'test-token',
            symbol: 'TEST',
            name: 'Test Token',
            decimals: 9,
            supply: 1000000000,
            holder: 1000,
            website: 'https://test.com',
            twitter: '@test',
            coingeckoId: 'test',
            priceUsdt: 0.001,
            volumeUsdt: 100000,
            marketCapUsdt: 500000,
        },
        rugCheckData: {
            score: 75,
            risks: [
                { name: 'Low liquidity', level: 'warn' as const, description: 'Liquidity under threshold' },
            ],
            rugged: false,
        },
    };

    it('should render DexScreener data', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/Raydium/i)).toBeInTheDocument();
    });

    it('should display price information', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/\$0\.001/i)).toBeInTheDocument();
    });

    it('should show volume data', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/100,000/i)).toBeInTheDocument();
    });

    it('should display rugcheck score', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/75/)).toBeInTheDocument();
    });

    it('should show risk warnings', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/Low liquidity/i)).toBeInTheDocument();
    });

    it('should handle missing dexscreener data', () => {
        const noData = { ...mockResult, dexScreenerData: undefined };
        render(<ExternalData result={noData as any} />);
        expect(screen.getByText(/No data/i)).toBeInTheDocument();
    });

    it('should display birdeye analytics', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/300/)).toBeInTheDocument(); // unique wallets
    });

    it('should show solscan metadata', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/@test/)).toBeInTheDocument();
    });

    it('should handle rugged tokens', () => {
        const rugged = {
            ...mockResult,
            rugCheckData: { ...mockResult.rugCheckData, rugged: true, ruggedDetails: 'Rug pulled!' },
        };
        render(<ExternalData result={rugged as any} />);
        expect(screen.getByText(/rug/i)).toBeInTheDocument();
    });

    it('should display holder count', () => {
        render(<ExternalData result={mockResult as any} />);
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });
});

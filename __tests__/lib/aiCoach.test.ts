import { getAiAdvice, analyzePortfolio, getTradingTips } from '@/lib/aiCoach';

jest.mock('@/lib/logger');

describe('aiCoach', () => {
    it('should generate advice based on score', async () => {
        const advice = await getAiAdvice(85);
        expect(advice).toContain('Great job');
    });

    it('should give warnings for low scores', async () => {
        const advice = await getAiAdvice(20);
        expect(advice).toMatch(/risk|careful|danger/i);
    });

    it('should analyze portfolio composition', async () => {
        const portfolio = {
            tokens: [{ symbol: 'SOL', value: 100 }, { symbol: 'USDC', value: 50 }],
        };
        const analysis = await analyzePortfolio(portfolio);
        expect(analysis).toHaveProperty('diversificationScore');
        expect(analysis).toHaveProperty('recommendations');
    });

    it('should provide trading tips', async () => {
        const tips = await getTradingTips({ riskTolerance: 'high' });
        expect(Array.isArray(tips)).toBe(true);
        expect(tips.length).toBeGreaterThan(0);
    });

    it('should handle empty portfolio', async () => {
        const analysis = await analyzePortfolio({ tokens: [] });
        expect(analysis.recommendations).toHaveLength(1);
    });

    it('should personalize advice', async () => {
        const advice = await getAiAdvice(50, { username: 'Degen' });
        expect(advice).toContain('Degen');
    });

    it('should handle API errors gracefully', async () => {
        // Mock internal API call failure if applicable
        const advice = await getAiAdvice(NaN);
        expect(advice).toBeDefined();
    });

    it('should suggest risk management', async () => {
        const tips = await getTradingTips({ riskTolerance: 'low' });
        expect(JSON.stringify(tips)).toMatch(/stop loss|limit/i);
    });

    it('should analyze profit/loss', async () => {
        const analysis = await analyzePortfolio({ pnl: -500 });
        expect(analysis.sentiment).toBe('bearish');
    });

    it('should detect gambling behavior', async () => {
        const analysis = await analyzePortfolio({ tradeCount: 1000, timeframe: '24h' });
        expect(analysis.warnings).toContainEqual(expect.stringMatching(/gambling|addiction/i));
    });
});

import { trackWhale, getTopWhales, getWhaleActivity, analyzeWhalePortfolio } from '@/lib/whaleTracker';

jest.mock('@/lib/prisma');
jest.mock('@/lib/logger');

describe('whaleTracker', () => {
    const mockWhale = 'whale-wallet-123';

    it('should track whale wallet', async () => {
        await trackWhale(mockWhale, { totalValue: 1000000 });
        expect(prisma.whale.upsert).toHaveBeenCalled();
    });

    it('should get top whales by volume', async () => {
        const whales = await getTopWhales({ sortBy: 'volume', limit: 10 });
        expect(whales).toHaveLength(10);
    });

    it('should get whale activity history', async () => {
        const activity = await getWhaleActivity(mockWhale, { days: 30 });
        expect(activity).toHaveProperty('trades');
        expect(activity).toHaveProperty('totalVolume');
    });

    it('should analyze whale portfolio', async () => {
        const portfolio = await analyzeWhalePortfolio(mockWhale);
        expect(portfolio).toHaveProperty('tokens');
        expect(portfolio).toHaveProperty('diversification');
    });

    it('should detect whale movements', async () => {
        const movements = await detectWhaleMovements({ threshold: 100000 });
        expect(Array.isArray(movements)).toBe(true);
    });

    it('should calculate whale influence score', async () => {
        const score = await calculateWhaleInfluence(mockWhale);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('should get whale followers', async () => {
        const followers = await getWhaleFollowers(mockWhale);
        expect(followers).toHaveProperty('count');
        expect(followers).toHaveProperty('followers');
    });

    it('should track whale trades', async () => {
        await trackWhaleTrade(mockWhale, {
            token: 'SOL',
            amount: 10000,
            type: 'BUY',
        });
        expect(prisma.whaleTrade.create).toHaveBeenCalled();
    });

    it('should identify new whales', async () => {
        const newWhales = await identifyNewWhales({ minValue: 500000 });
        expect(Array.isArray(newWhales)).toBe(true);
    });

    it('should get whale alerts', async () => {
        const alerts = await getWhaleAlerts('user-wallet', { whaleId: mockWhale });
        expect(alerts).toHaveProperty('enabled');
    });
});

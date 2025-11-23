import { trackEvent, getAnalytics, generateReport, getMetrics } from '@/lib/analytics';

jest.mock('@/lib/prisma');
jest.mock('@/lib/logger');

describe('analytics', () => {
    it('should track custom events', async () => {
        await trackEvent('card_generated', { userId: 'test', score: 85 });
        expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should get user analytics', async () => {
        const analytics = await getAnalytics('test-user');
        expect(analytics).toHaveProperty('totalEvents');
        expect(analytics).toHaveProperty('lastActivity');
    });

    it('should generate analytics report', async () => {
        const report = await generateReport({ startDate: new Date(), endDate: new Date() });
        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('metrics');
    });

    it('should track page views', async () => {
        await trackEvent('page_view', { page: '/dashboard', user: 'test' });
        expect(prisma.event.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ eventType: 'page_view' }) })
        );
    });

    it('should calculate conversion rates', async () => {
        const rate = await calculateConversionRate('card_generate', 'card_download');
        expect(typeof rate).toBe('number');
    });

    it('should get real-time metrics', async () => {
        const metrics = await getMetrics({ realtime: true });
        expect(metrics).toHaveProperty('activeUsers');
        expect(metrics).toHaveProperty('eventsPerMinute');
    });

    it('should track user retention', async () => {
        const retention = await getUserRetention({ cohort: '2024-01' });
        expect(retention).toHaveProperty('day1');
        expect(retention).toHaveProperty('day7');
        expect(retention).toHaveProperty('day30');
    });

    it('should funnel analysis', async () => {
        const funnel = await analyzeFunnel([
            'page_view',
            'wallet_connect',
            'card_generate',
            'card_download',
        ]);
        expect(funnel).toHaveLength(4);
    });

    it('should segment users', async () => {
        const segments = await segmentUsers({ by: 'activity' });
        expect(segments).toHaveProperty('active');
        expect(segments).toHaveProperty('inactive');
    });

    it('should export analytics data', async () => {
        const data = await exportAnalytics({ format: 'csv', dateRange: '30d' });
        expect(data).toBeDefined();
    });
});

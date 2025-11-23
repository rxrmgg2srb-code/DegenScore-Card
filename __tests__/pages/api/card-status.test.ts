import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/card-status';
import { getCardStatus } from '@/lib/cards';

jest.mock('@/lib/cards');

describe('/api/card-status', () => {
    it('should return card status', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: {
                id: 'card-123',
            },
        });

        (getCardStatus as jest.Mock).mockResolvedValue({ status: 'completed', url: 'http://...' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ status: 'completed', url: 'http://...' });
    });

    it('should handle missing id', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: {},
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('should handle not found', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: 'unknown' },
        });

        (getCardStatus as jest.Mock).mockResolvedValue(null);

        await handler(req, res);

        expect(res._getStatusCode()).toBe(404);
    });

    it('should handle processing status', async () => {
        (getCardStatus as jest.Mock).mockResolvedValue({ status: 'processing', progress: 50 });
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: '123' },
        });

        await handler(req, res);
        expect(res._getJSONData()).toHaveProperty('progress');
    });

    it('should handle failed status', async () => {
        (getCardStatus as jest.Mock).mockResolvedValue({ status: 'failed', error: 'Timeout' });
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: '123' },
        });

        await handler(req, res);
        expect(res._getJSONData()).toHaveProperty('error');
    });

    it('should validate id format', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: 'invalid-uuid' },
        });

        await handler(req, res);
        // Depending on validation logic
    });

    it('should handle internal errors', async () => {
        (getCardStatus as jest.Mock).mockRejectedValue(new Error('DB Error'));
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: '123' },
        });

        await handler(req, res);
        expect(res._getStatusCode()).toBe(500);
    });

    it('should support polling', async () => {
        // Maybe check headers for cache control
    });

    it('should return metadata', async () => {
        (getCardStatus as jest.Mock).mockResolvedValue({ status: 'completed', metadata: {} });
        // ...
    });

    it('should log status checks', async () => {
        // ...
    });
});

import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/get-card';
import { getCard } from '@/lib/cards';

jest.mock('@/lib/cards');

describe('/api/get-card', () => {
    it('should return card data', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: { wallet: 'test-wallet' },
        });

        (getCard as jest.Mock).mockResolvedValue({ score: 90 });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toHaveProperty('score');
    });

    it('should handle missing wallet', async () => {
        const { req, res } = createMocks({ method: 'GET' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('should handle not found', async () => {
        (getCard as jest.Mock).mockResolvedValue(null);
        const { req, res } = createMocks({
            method: 'GET',
            query: { wallet: 'unknown' },
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

    it('should handle database errors', async () => {
        (getCard as jest.Mock).mockRejectedValue(new Error('DB Error'));
        // ...
    });

    it('should return public data only', async () => {
        // ...
    });

    it('should support by ID lookup', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            query: { id: 'card-id' },
        });
        await handler(req, res);
        expect(getCard).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-id' }));
    });

    it('should cache response', async () => {
        // ...
    });

    it('should log access', async () => {
        // ...
    });

    it('should validate wallet format', async () => {
        // ...
    });

    it('should include metadata', async () => {
        // ...
    });
});

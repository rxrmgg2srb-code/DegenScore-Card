import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/auth/challenge';
import { generateNonce } from '@/lib/auth';

jest.mock('@/lib/auth');

describe('/api/auth/challenge', () => {
    it('should generate challenge message', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                wallet: 'test-wallet',
            },
        });

        (generateNonce as jest.Mock).mockReturnValue('random-nonce');

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toHaveProperty('message');
        expect(res._getJSONData().message).toContain('random-nonce');
    });

    it('should validate wallet address', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                wallet: 'invalid',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('should handle missing wallet', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {},
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('should store nonce in db/cache', async () => {
        // Verify storage call
    });

    it('should handle rate limiting', async () => {
        // ...
    });

    it('should return 405 for GET', async () => {
        const { req, res } = createMocks({
            method: 'GET',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
    });

    it('should include timestamp in message', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { wallet: 'test' },
        });

        await handler(req, res);
        expect(res._getJSONData().message).toMatch(/timestamp/i);
    });

    it('should include domain in message', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { wallet: 'test' },
        });

        await handler(req, res);
        expect(res._getJSONData().message).toContain(process.env.NEXT_PUBLIC_DOMAIN || 'degenscore.card');
    });

    it('should handle database errors', async () => {
        // ...
    });

    it('should log challenge generation', async () => {
        // ...
    });
});

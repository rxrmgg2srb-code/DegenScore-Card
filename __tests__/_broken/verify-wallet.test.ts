import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/verify-wallet';
import { verifyWallet } from '@/lib/auth';

jest.mock('@/lib/auth');

describe('/api/verify-wallet', () => {
    it('should verify wallet signature', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                wallet: 'test-wallet',
                signature: 'sig',
                message: 'msg',
            },
        });

        (verifyWallet as jest.Mock).mockResolvedValue({ verified: true, token: 'jwt' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ verified: true, token: 'jwt' });
    });

    it('should handle invalid signature', async () => {
        (verifyWallet as jest.Mock).mockResolvedValue({ verified: false });
        const { req, res } = createMocks({
            method: 'POST',
            body: { wallet: 'test', signature: 'bad', message: 'msg' },
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    it('should validate parameters', async () => {
        const { req, res } = createMocks({ method: 'POST', body: {} });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('should handle errors', async () => {
        // ...
    });

    it('should log verification attempt', async () => {
        // ...
    });

    it('should only allow POST', async () => {
        // ...
    });

    it('should set auth cookie', async () => {
        // ...
    });

    it('should handle expired message', async () => {
        // ...
    });

    it('should check nonce', async () => {
        // ...
    });

    it('should return user info', async () => {
        // ...
    });
});

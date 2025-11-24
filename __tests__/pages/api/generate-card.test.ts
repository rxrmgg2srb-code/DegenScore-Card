import React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import generateCardHandler from '@/pages/api/generate-card';

jest.mock('@/lib/logger');

global.fetch = jest.fn();

describe('/api/generate-card', () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;

    beforeEach(() => {
        req = { method: 'POST', body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('should return 405 for non-POST', async () => {
        req.method = 'GET';
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(405);
    });

    it('should require wallet address', async () => {
        req.body = {};
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate wallet format', async () => {
        req.body = { walletAddress: 'invalid' };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should generate card image', async () => {
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    });

    it('should handle cache parameter', async () => {
        req.query = { nocache: 'true' };
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.setHeader).toHaveBeenCalled();
    });

    it('should handle generation errors', async () => {
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' };
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Generation failed'));
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should apply rate limits', async () => {
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' };
        for (let i = 0; i < 50; i++) {
            await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        }
        expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should set proper image headers', async () => {
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', expect.any(String));
    });

    it('should handle premium vs basic cards', async () => {
        req.body = { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', premium: true };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.send).toHaveBeenCalled();
    });

    it('should sanitize input', async () => {
        req.body = { walletAddress: '<script>alert(1)</script>' };
        await generateCardHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

import { NextApiRequest, NextApiResponse } from 'next';
import claimRewardsHandler from '@/pages/api/referrals/claim-rewards';

jest.mock('@/lib/prisma');
jest.mock('@/lib/logger');

describe('/api/referrals/claim-rewards', () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;

    beforeEach(() => {
        req = { method: 'POST', body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    it('should claim available rewards', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1', rewardClaimed: false }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should require wallet address', async () => {
        req.body = {};
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should calculate total rewards', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([
            { id: '1', rewardClaimed: false, rewardAmount: 100 },
            { id: '2', rewardClaimed: false, rewardAmount: 150 },
        ]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalRewards: 250 }));
    });

    it('should mark rewards as claimed', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1', rewardClaimed: false }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(prisma.referral.updateMany).toHaveBeenCalled();
    });

    it('should handle no pending rewards', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalRewards: 0 }));
    });

    it('should update user balance', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1', rewardAmount: 100 }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ balance: { increment: expect.any(Number) } }) })
        );
    });

    it('should prevent double claiming', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1', rewardClaimed: true }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalRewards: 0 }));
    });

    it('should create claim transaction record', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1', rewardAmount: 100 }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return claimed referral IDs', async () => {
        req.body = { walletAddress: 'alice' };
        (prisma.referral.findMany as jest.Mock).mockResolvedValue([{ id: '1' }, { id: '2' }]);
        await claimRewardsHandler(req as NextApiRequest, res as NextApiResponse);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ claimedIds: expect.any(Array) }));
    });
});

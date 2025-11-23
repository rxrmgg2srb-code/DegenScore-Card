import { getActivity } from '@/lib/activity';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    activity: {
        findMany: jest.fn(),
    },
}));

describe('lib/activity', () => {
    describe('getActivity', () => {
        it('should return activity list', async () => {
            (prisma.activity.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
            const result = await getActivity();
            expect(result).toHaveLength(1);
        });

        it('should support pagination', async () => {
            await getActivity({ page: 2 });
            expect(prisma.activity.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: expect.any(Number) }));
        });
    });
});

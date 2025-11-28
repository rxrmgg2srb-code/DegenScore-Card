import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/admin/users';
import { getAdminUsers } from '@/lib/admin';

jest.mock('@/lib/admin');

describe('/api/admin/users', () => {
  it('should return users list', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    (getAdminUsers as jest.Mock).mockResolvedValue([{ id: 1, wallet: 'test' }]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toHaveLength(1);
  });

  it('should require admin auth', async () => {
    // ...
  });

  it('should support pagination', async () => {
    // ...
  });

  it('should support search', async () => {
    // ...
  });

  it('should handle errors', async () => {
    // ...
  });

  it('should return user details', async () => {
    // ...
  });

  it('should log access', async () => {
    // ...
  });

  it('should only allow GET', async () => {
    // ...
  });

  it('should filter by status', async () => {
    // ...
  });

  it('should return counts', async () => {
    // ...
  });
});

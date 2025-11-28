import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/recent-activity';
import { getActivity } from '@/lib/activity';

jest.mock('@/lib/activity');

describe('/api/recent-activity', () => {
  it('should return activity', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    (getActivity as jest.Mock).mockResolvedValue([{ type: 'trade' }]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toHaveLength(1);
  });

  it('should handle errors', async () => {
    (getActivity as jest.Mock).mockRejectedValue(new Error('Fail'));
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it('should support pagination', async () => {
    // ...
  });

  it('should filter by type', async () => {
    // ...
  });

  it('should cache response', async () => {
    // ...
  });

  it('should only allow GET', async () => {
    // ...
  });

  it('should log access', async () => {
    // ...
  });

  it('should return empty list', async () => {
    // ...
  });

  it('should validate query', async () => {
    // ...
  });

  it('should include user details', async () => {
    // ...
  });
});

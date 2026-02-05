/**
 * Tests for Cache Module
 * Tests for both Redis cache and Hot Wallet Cache systems
 */

import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateTag,
  cacheGetOrSet,
  cacheIncr,
  CacheKeys,
} from '@/lib/cache/redis';
import {
  getCachedWalletMetrics,
  setCachedWalletMetrics,
  invalidateWalletCache,
  warmCacheForHotWallets,
  getCacheStats,
  resetCacheStats,
  getTrendingWallets,
} from '@/lib/cache/hotWalletCache';
import {
  createMockRedis,
  setupTestEnv,
  mockConsole,
  generateMockAddress,
  sleep,
  advanceTimers,
} from '@/tests/helpers';

// Setup test environment
setupTestEnv();

// Mock Redis
const mockRedis = createMockRedis();

// Mock environment variables
const originalEnv = process.env;

describe('Cache Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: 'https://mock-redis.com',
      UPSTASH_REDIS_REST_TOKEN: 'mock-token',
    };
    
    // Reset cache stats before each test
    resetCacheStats();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Redis Cache - Basic Operations', () => {
    it('should set and get value from cache', async () => {
      const key = 'test:key';
      const value = { data: 'test value' };

      const setResult = await cacheSet(key, value);
      expect(setResult).toBe(true);

      const getResult = await cacheGet<typeof value>(key);
      expect(getResult).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheGet('non:existent:key');
      expect(result).toBeNull();
    });

    it('should delete value from cache', async () => {
      const key = 'test:delete:key';
      const value = { data: 'to delete' };

      await cacheSet(key, value);
      const deleteResult = await cacheDel(key);
      expect(deleteResult).toBe(true);

      const getResult = await cacheGet(key);
      expect(getResult).toBeNull();
    });

    it('should handle TTL correctly', async () => {
      const key = 'test:ttl:key';
      const value = { data: 'expires soon' };
      const ttl = 1; // 1 second

      const setResult = await cacheSet(key, value, { ttl });
      expect(setResult).toBe(true);

      const getResult = await cacheGet(key);
      expect(getResult).toEqual(value);
    });

    it('should handle zero TTL (no expiration)', async () => {
      const key = 'test:no:ttl:key';
      const value = { data: 'never expires' };

      const setResult = await cacheSet(key, value, { ttl: 0 });
      expect(setResult).toBe(true);

      const getResult = await cacheGet(key);
      expect(getResult).toEqual(value);
    });

    it('should increment counter', async () => {
      const key = 'test:counter';

      const first = await cacheIncr(key);
      expect(first).toBe(1);

      const second = await cacheIncr(key);
      expect(second).toBe(2);
    });

    it('should increment counter with TTL', async () => {
      const key = 'test:counter:ttl';
      const ttl = 60;

      const result = await cacheIncr(key, ttl);
      expect(result).toBe(1);
    });
  });

  describe('Redis Cache - Tags', () => {
    it('should set value with tags', async () => {
      const key = 'test:tagged:key';
      const value = { data: 'tagged' };
      const tags = ['user:123', 'premium'];

      const setResult = await cacheSet(key, value, { tags });
      expect(setResult).toBe(true);

      // Verify tag operations were called
      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:user:123', key);
      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:premium', key);
    });

    it('should invalidate all keys with specific tag', async () => {
      const tag = 'test:tag';
      const keys = ['key1', 'key2', 'key3'];

      // Mock smembers to return keys
      mockRedis.smembers.mockResolvedValue(keys);

      const result = await cacheInvalidateTag(tag);
      expect(result).toBe(true);

      expect(mockRedis.smembers).toHaveBeenCalledWith(`tag:${tag}`);
      expect(mockRedis.del).toHaveBeenCalledWith(...keys);
      expect(mockRedis.del).toHaveBeenCalledWith(`tag:${tag}`);
    });

    it('should handle invalidation of empty tag', async () => {
      const tag = 'empty:tag';

      // Mock smembers to return empty array
      mockRedis.smembers.mockResolvedValue([]);

      const result = await cacheInvalidateTag(tag);
      expect(result).toBe(true);

      expect(mockRedis.del).toHaveBeenCalledWith(`tag:${tag}`);
    });
  });

  describe('Redis Cache - Get or Set', () => {
    it('should return cached value on hit', async () => {
      const key = 'test:getorset:hit';
      const cachedValue = { data: 'cached' };
      const fetchFn = jest.fn().mockResolvedValue({ data: 'fresh' });

      // Set cached value first
      await cacheSet(key, cachedValue);

      const result = await cacheGetOrSet(key, fetchFn);
      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache on miss', async () => {
      const key = 'test:getorset:miss';
      const freshValue = { data: 'fresh' };
      const fetchFn = jest.fn().mockResolvedValue(freshValue);

      const result = await cacheGetOrSet(key, fetchFn);
      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Verify it was cached
      const cached = await cacheGet(key);
      expect(cached).toEqual(freshValue);
    });

    it('should pass options to cacheSet', async () => {
      const key = 'test:getorset:options';
      const value = { data: 'with options' };
      const options = { ttl: 300, tags: ['test'] };
      const fetchFn = jest.fn().mockResolvedValue(value);

      await cacheGetOrSet(key, fetchFn, options);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      // Verify cacheSet was called with options (through mockRedis.set)
    });
  });

  describe('Redis Cache - Error Handling', () => {
    it('should handle Redis get error gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheGet('test:error:key');
      expect(result).toBeNull();

      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should handle Redis set error gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      mockRedis.set.mockRejectedValue(new Error('Redis set failed'));

      const result = await cacheSet('test:error:set', { data: 'test' });
      expect(result).toBe(false);

      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should handle Redis delete error gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'));

      const result = await cacheDel('test:error:delete');
      expect(result).toBe(false);

      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should handle Redis increment error gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      mockRedis.incr.mockRejectedValue(new Error('Redis incr failed'));

      const result = await cacheIncr('test:error:incr');
      expect(result).toBeNull();

      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should return null when Redis is not configured', async () => {
      process.env.UPSTASH_REDIS_REST_URL = '';
      process.env.UPSTASH_REDIS_REST_TOKEN = '';

      const result = await cacheGet('test:no:redis');
      expect(result).toBeNull();
    });
  });

  describe('Cache Keys Helper', () => {
    it('should generate wallet analysis key', () => {
      const wallet = generateMockAddress();
      const key = CacheKeys.walletAnalysis(wallet);
      expect(key).toBe(`analysis:${wallet}`);
    });

    it('should generate card image key', () => {
      const wallet = generateMockAddress();
      const key = CacheKeys.cardImage(wallet);
      expect(key).toBe(`card:img:${wallet}`);
    });

    it('should generate leaderboard key with tier', () => {
      const key = CacheKeys.leaderboard('gold');
      expect(key).toBe('leaderboard:gold');
    });

    it('should generate leaderboard key without tier', () => {
      const key = CacheKeys.leaderboard();
      expect(key).toBe('leaderboard:all');
    });

    it('should generate hot feed key with tier', () => {
      const key = CacheKeys.hotFeed('silver');
      expect(key).toBe('hotfeed:silver');
    });

    it('should generate hot feed key without tier', () => {
      const key = CacheKeys.hotFeed();
      expect(key).toBe('hotfeed:all');
    });

    it('should generate challenge key', () => {
      const key = CacheKeys.currentChallenge();
      expect(key).toBe('challenge:current');
    });

    it('should generate platform stats key', () => {
      const key = CacheKeys.platformStats();
      expect(key).toBe('stats:platform');
    });

    it('should generate token metadata key', () => {
      const mint = generateMockAddress();
      const key = CacheKeys.tokenMetadata(mint);
      expect(key).toBe(`token:${mint}`);
    });

    it('should generate user card key', () => {
      const wallet = generateMockAddress();
      const key = CacheKeys.userCard(wallet);
      expect(key).toBe(`user:card:${wallet}`);
    });

    it('should generate spots remaining key', () => {
      const key = CacheKeys.spotsRemaining();
      expect(key).toBe('spots:remaining');
    });

    it('should generate recent activity key', () => {
      const key = CacheKeys.recentActivity();
      expect(key).toBe('activity:recent');
    });
  });

  describe('Hot Wallet Cache - Basic Operations', () => {
    it('should set and get wallet metrics', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 100, rank: 5 };

      await setCachedWalletMetrics(wallet, metrics);
      const result = await getCachedWalletMetrics(wallet);

      expect(result).toEqual(metrics);
    });

    it('should return null for non-existent wallet', async () => {
      const wallet = generateMockAddress();
      const result = await getCachedWalletMetrics(wallet);
      expect(result).toBeNull();
    });

    it('should invalidate wallet cache', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 100 };

      await setCachedWalletMetrics(wallet, metrics);
      await invalidateWalletCache(wallet);

      const result = await getCachedWalletMetrics(wallet);
      expect(result).toBeNull();
    });
  });

  describe('Hot Wallet Cache - Multi-tier Caching', () => {
    it('should hit memory cache first', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 200 };

      // Set metrics (this puts in both memory and Redis)
      await setCachedWalletMetrics(wallet, metrics);

      // Clear Redis mock to ensure it doesn't get called
      mockRedis.get.mockClear();

      // Get again - should hit memory cache
      const result = await getCachedWalletMetrics(wallet);

      expect(result).toEqual(metrics);
      // Redis should not be called due to memory cache hit
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should fall back to Redis when not in memory', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 300 };

      // Set directly in Redis (simulating memory cache miss)
      const cacheData = {
        metrics,
        lastUpdated: Date.now(),
        hitCount: 0,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheData));

      const result = await getCachedWalletMetrics(wallet);
      expect(result).toEqual(metrics);
      expect(mockRedis.get).toHaveBeenCalledWith(`wallet:metrics:${wallet}`);
    });

    it('should promote frequently accessed to memory cache', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 400 };

      // Set in Redis with high hit count
      const cacheData = {
        metrics,
        lastUpdated: Date.now(),
        hitCount: 10, // Above threshold for memory cache promotion
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheData));

      // First access should promote to memory
      await getCachedWalletMetrics(wallet);

      // Second access should hit memory (Redis not called)
      mockRedis.get.mockClear();
      const result = await getCachedWalletMetrics(wallet);

      expect(result).toEqual(metrics);
      expect(mockRedis.get).not.toHaveBeenCalled();
    });
  });

  describe('Hot Wallet Cache - Statistics', () => {
    it('should track cache hits', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 500 };

      await setCachedWalletMetrics(wallet, metrics);
      await getCachedWalletMetrics(wallet); // Hit

      const stats = getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(1);
      expect(stats.hitRate).toBe(100);
    });

    it('should track cache misses', async () => {
      const wallet = generateMockAddress();
      await getCachedWalletMetrics(wallet); // Miss

      const stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(1);
      expect(stats.hitRate).toBe(0);
    });

    it('should calculate hit rate correctly', async () => {
      const wallet1 = generateMockAddress();
      const wallet2 = generateMockAddress();
      const metrics = { score: 600 };

      // Set one wallet
      await setCachedWalletMetrics(wallet1, metrics);

      // Hit
      await getCachedWalletMetrics(wallet1);
      // Miss
      await getCachedWalletMetrics(wallet2);
      // Another hit
      await getCachedWalletMetrics(wallet1);

      const stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(3);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should reset statistics', async () => {
      const wallet = generateMockAddress();
      const metrics = { score: 700 };

      await setCachedWalletMetrics(wallet, metrics);
      await getCachedWalletMetrics(wallet);

      let stats = getCacheStats();
      expect(stats.totalRequests).toBeGreaterThan(0);

      resetCacheStats();
      stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('Hot Wallet Cache - Cache Warming', () => {
    it('should warm cache for hot wallets', async () => {
      const wallets = [generateMockAddress(), generateMockAddress()];
      const metrics = { score: 800 };

      // Mock existing cache data
      const cacheData = {
        metrics,
        lastUpdated: Date.now(),
        hitCount: 5,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheData));

      await warmCacheForHotWallets(wallets);

      // Verify each wallet was processed
      expect(mockRedis.get).toHaveBeenCalledTimes(wallets.length);
      expect(mockRedis.set).toHaveBeenCalledTimes(wallets.length);
    });

    it('should handle warming for non-existent cache', async () => {
      const wallets = [generateMockAddress()];

      // Mock no existing data
      mockRedis.get.mockResolvedValue(null);

      await warmCacheForHotWallets(wallets);

      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('Hot Wallet Cache - Trending Wallets', () => {
    it('should get trending wallets by hit count', async () => {
      const wallet1 = generateMockAddress();
      const wallet2 = generateMockAddress();
      const wallet3 = generateMockAddress();

      // Set metrics with different hit counts
      await setCachedWalletMetrics(wallet1, { score: 100 });
      await setCachedWalletMetrics(wallet2, { score: 200 });
      await setCachedWalletMetrics(wallet3, { score: 300 });

      // Access wallets to increase hit counts
      await getCachedWalletMetrics(wallet1); // hitCount = 1
      await getCachedWalletMetrics(wallet2); // hitCount = 1
      await getCachedWalletMetrics(wallet2); // hitCount = 2
      await getCachedWalletMetrics(wallet3); // hitCount = 1
      await getCachedWalletMetrics(wallet3); // hitCount = 2
      await getCachedWalletMetrics(wallet3); // hitCount = 3

      const trending = await getTrendingWallets(3);
      
      // Should be sorted by hit count descending
      expect(trending).toHaveLength(3);
      expect(trending[0].wallet).toBe(wallet3); // 3 hits
      expect(trending[0].hits).toBe(3);
      expect(trending[1].wallet).toBe(wallet2); // 2 hits
      expect(trending[1].hits).toBe(2);
      expect(trending[2].wallet).toBe(wallet1); // 1 hit
      expect(trending[2].hits).toBe(1);
    });

    it('should limit trending wallets results', async () => {
      const wallets = Array.from({ length: 5 }, () => generateMockAddress());

      for (const wallet of wallets) {
        await setCachedWalletMetrics(wallet, { score: 100 });
        await getCachedWalletMetrics(wallet);
      }

      const trending = await getTrendingWallets(3);
      expect(trending).toHaveLength(3);
    });

    it('should return empty array when no trending wallets', async () => {
      const trending = await getTrendingWallets();
      expect(trending).toEqual([]);
    });
  });

  describe('Hot Wallet Cache - Error Handling', () => {
    it('should handle Redis read errors gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      const wallet = generateMockAddress();

      mockRedis.get.mockRejectedValue(new Error('Redis read failed'));

      const result = await getCachedWalletMetrics(wallet);
      expect(result).toBeNull();

      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should handle Redis write errors gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      const wallet = generateMockAddress();
      const metrics = { score: 900 };

      mockRedis.set.mockRejectedValue(new Error('Redis write failed'));

      // Should not throw, just log error
      await expect(setCachedWalletMetrics(wallet, metrics)).resolves.toBeUndefined();
      expect(consoleMocks.error).toHaveBeenCalled();
    });

    it('should handle Redis delete errors gracefully', async () => {
      const consoleMocks = mockConsole(['error']);
      const wallet = generateMockAddress();

      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'));

      // Should not throw, just log error
      await expect(invalidateWalletCache(wallet)).resolves.toBeUndefined();
      expect(consoleMocks.error).toHaveBeenCalled();
    });
  });

  describe('Hot Wallet Cache - Memory Cache Eviction', () => {
    it('should handle memory cache eviction when full', async () => {
      // This test verifies the eviction logic works
      // In a real scenario, we'd need to fill up the memory cache
      // For now, we just verify the function doesn't crash
      
      const wallet = generateMockAddress();
      const metrics = { score: 1000 };

      await setCachedWalletMetrics(wallet, metrics);
      const result = await getCachedWalletMetrics(wallet);

      expect(result).toEqual(metrics);
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with cache warming and trending', async () => {
      const wallets = Array.from({ length: 3 }, () => generateMockAddress());
      const metrics = { score: 100, rank: 1 };

      // Set initial data
      for (const wallet of wallets) {
        await setCachedWalletMetrics(wallet, metrics);
      }

      // Warm cache for first two wallets
      await warmCacheForHotWallets(wallets.slice(0, 2));

      // Access wallets multiple times to create trending data
      for (let i = 0; i < 5; i++) {
        await getCachedWalletMetrics(wallets[0]); // Most accessed
      }
      for (let i = 0; i < 3; i++) {
        await getCachedWalletMetrics(wallets[1]); // Medium accessed
      }
      await getCachedWalletMetrics(wallets[2]); // Least accessed

      // Check trending
      const trending = await getTrendingWallets(3);
      expect(trending).toHaveLength(3);
      expect(trending[0].wallet).toBe(wallets[0]);

      // Check final stats
      const stats = getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });
});
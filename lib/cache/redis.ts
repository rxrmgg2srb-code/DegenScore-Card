import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// Cliente de Upstash Redis (gratis: 10k comandos/día)
// Si excede límite, cambiar a Redis Cloud (30MB gratis)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Verificar si Redis está configurado
const isRedisEnabled = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

export interface CacheOptions {
  ttl?: number; // Time to live en segundos
  tags?: string[]; // Tags para invalidación en grupo
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisEnabled) {
    logger.warn('Redis not configured, cache disabled');
    return null;
  }

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null; // Fail gracefully
  }
}

/**
 * Set value in cache
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!isRedisEnabled) {
    return false;
  }

  try {
    const { ttl = 3600 } = options; // Default 1 hora

    if (ttl > 0) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }

    // Agregar a tags si se especifican (para invalidación por grupo)
    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await redis.sadd(`tag:${tag}`, key);
        // Las tags expiran más tiempo que el cache
        await redis.expire(`tag:${tag}`, ttl * 2);
      }
    }

    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
}

/**
 * Delete from cache
 */
export async function cacheDel(key: string): Promise<boolean> {
  if (!isRedisEnabled) {
    return false;
  }

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Redis del error:', error);
    return false;
  }
}

/**
 * Invalidate all keys with a specific tag
 */
export async function cacheInvalidateTag(tag: string): Promise<boolean> {
  if (!isRedisEnabled) {
    return false;
  }

  try {
    const keys = await redis.smembers(`tag:${tag}`);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
      await redis.del(`tag:${tag}`);
    }
    return true;
  } catch (error) {
    logger.error('Redis invalidate tag error:', error);
    return false;
  }
}

/**
 * Get or compute: Intenta obtener del cache, si no existe, ejecuta la función y cachea el resultado
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Intentar obtener del cache
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en cache, ejecutar función
  const value = await fetchFn();

  // Cachear resultado
  await cacheSet(key, value, options);

  return value;
}

/**
 * Incrementar contador (útil para rate limiting adicional)
 */
export async function cacheIncr(
  key: string,
  ttl?: number
): Promise<number | null> {
  if (!isRedisEnabled) {
    return null;
  }

  try {
    const value = await redis.incr(key);
    if (ttl) {
      await redis.expire(key, ttl);
    }
    return value;
  } catch (error) {
    logger.error('Redis incr error:', error);
    return null;
  }
}

/**
 * Helper para generar keys consistentes
 */
export const CacheKeys = {
  // Wallet analysis
  walletAnalysis: (wallet: string) => `analysis:${wallet}`,

  // Card image
  cardImage: (wallet: string) => `card:img:${wallet}`,

  // Leaderboard
  leaderboard: (tier?: string) => (tier ? `leaderboard:${tier}` : 'leaderboard:all'),

  // Hot feed
  hotFeed: (tier?: string) => (tier ? `hotfeed:${tier}` : 'hotfeed:all'),

  // Challenge
  currentChallenge: () => 'challenge:current',

  // Stats
  platformStats: () => 'stats:platform',

  // Token metadata from Helius
  tokenMetadata: (mint: string) => `token:${mint}`,

  // User card data
  userCard: (wallet: string) => `user:card:${wallet}`,

  // Spots remaining (FOMO)
  spotsRemaining: () => 'spots:remaining',

  // Recent activity
  recentActivity: () => 'activity:recent',
};

export default redis;

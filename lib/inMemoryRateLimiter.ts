/**
 * 🚦 In-Memory Rate Limiter (Fallback when Redis is unavailable)
 *
 * Simple but effective in-memory rate limiting for single-instance deployments
 * or as a fallback when Redis is down.
 *
 * Features:
 * - Sliding window algorithm (same as Redis implementation)
 * - Automatic cleanup of expired entries
 * - LRU eviction to prevent memory leaks
 * - Thread-safe for Node.js event loop
 */

import { logger } from './logger';

interface RateLimitEntry {
  timestamps: number[]; // Array of request timestamps
  lastCleanup: number; // Last time we cleaned old timestamps
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxKeys = 10000; // Prevent memory leaks
  private readonly cleanupInterval = 60000; // Clean up every minute

  constructor() {
    // Periodic cleanup to prevent memory leaks
    setInterval(() => this.cleanup(), this.cleanupInterval);
    logger.info('[InMemoryRateLimiter] Initialized with fallback rate limiting');
  }

  /**
   * Check and record a rate limit attempt
   * Returns: { allowed: boolean, remaining: number }
   */
  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create entry
    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [], lastCleanup: now };
      this.store.set(key, entry);
    }

    // Clean old timestamps if needed (every 10 seconds to avoid excessive work)
    if (now - entry.lastCleanup > 10000) {
      entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
      entry.lastCleanup = now;
    } else {
      // Just filter for this check
      entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
    }

    const currentCount = entry.timestamps.length;
    const allowed = currentCount < limit;

    if (allowed) {
      entry.timestamps.push(now);
    }

    const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));
    const reset = now + windowMs;

    // LRU eviction if we have too many keys
    if (this.store.size > this.maxKeys) {
      this.evictOldest();
    }

    return { allowed, remaining, reset };
  }

  /**
   * Remove a specific key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
    logger.info('[InMemoryRateLimiter] Cleared all entries');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      keys: this.store.size,
      maxKeys: this.maxKeys,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find entries that haven't been accessed in 5 minutes
    this.store.forEach((entry, key) => {
      if (now - entry.lastCleanup > 300000) {
        expiredKeys.push(key);
      }
    });

    // Delete expired entries
    expiredKeys.forEach(key => this.store.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug(`[InMemoryRateLimiter] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * LRU eviction - remove oldest entries when hitting max capacity
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.store.forEach((entry, key) => {
      const lastAccess = entry.timestamps[entry.timestamps.length - 1] || 0;
      if (lastAccess < oldestTime) {
        oldestTime = lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey !== null) {
      this.store.delete(oldestKey);
      const displayKey = oldestKey.length > 50 ? oldestKey.substring(0, 50) + '...' : oldestKey;
      logger.debug(`[InMemoryRateLimiter] Evicted oldest key (LRU): ${displayKey}`);
    }
  }
}

// Singleton instance
export const inMemoryRateLimiter = new InMemoryRateLimiter();

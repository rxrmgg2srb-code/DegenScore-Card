/**
 * 🚦 External API Request Throttler
 *
 * Prevents overwhelming external APIs (RugCheck, DexScreener, Birdeye, etc.)
 * with too many concurrent requests which causes 429 Rate Limit errors.
 *
 * Features:
 * - Per-API request queuing with separate concurrency limits
 * - Automatic request spacing (minimum delay between requests)
 * - Priority queue support
 * - Timeout handling
 * - Metrics and monitoring per API
 */

import { logger } from './logger';

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  addedAt: number;
  timeout?: number;
}

interface ThrottlerStats {
  queueLength: number;
  activeRequests: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
}

class ApiRequestThrottler {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private lastRequestTime = 0;
  private totalRequests = 0;
  private totalErrors = 0;

  constructor(
    private readonly apiName: string,
    private readonly maxConcurrent: number,
    private readonly minDelay: number, // ms between requests
    private readonly defaultTimeout: number = 30000
  ) {
    logger.debug(`[ApiThrottler:${apiName}] Initialized`, {
      maxConcurrent,
      minDelay,
      defaultTimeout,
    });
  }

  async execute<T>(
    requestFn: () => Promise<T>,
    options: { priority?: number; timeout?: number } = {}
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        execute: requestFn,
        resolve,
        reject,
        priority: options.priority || 5,
        addedAt: Date.now(),
        timeout: options.timeout || this.defaultTimeout,
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      setTimeout(() => this.processQueue(), this.minDelay - timeSinceLastRequest);
      return;
    }

    this.queue.sort((a, b) => a.priority - b.priority);

    const request = this.queue.shift();
    if (!request) return;

    const queueTime = Date.now() - request.addedAt;
    if (request.timeout && queueTime > request.timeout) {
      request.reject(new Error(`[${this.apiName}] Request timed out in queue after ${queueTime}ms`));
      this.processQueue();
      return;
    }

    this.activeRequests++;
    this.lastRequestTime = Date.now();
    this.totalRequests++;

    const timeoutHandle = request.timeout
      ? setTimeout(() => {
          request.reject(new Error(`[${this.apiName}] Request execution timed out after ${request.timeout}ms`));
        }, request.timeout)
      : null;

    try {
      const result = await request.execute();
      if (timeoutHandle) clearTimeout(timeoutHandle);
      request.resolve(result);
    } catch (error) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      this.totalErrors++;
      request.reject(error as Error);
    } finally {
      this.activeRequests--;
      setTimeout(() => this.processQueue(), this.minDelay);
    }
  }

  getStats(): ThrottlerStats {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: this.totalRequests > 0 ? (this.totalErrors / this.totalRequests) * 100 : 0,
    };
  }

  clearQueue(): void {
    const cleared = this.queue.length;
    this.queue.forEach(req => req.reject(new Error(`[${this.apiName}] Queue cleared`)));
    this.queue = [];
    logger.warn(`[ApiThrottler:${this.apiName}] Queue cleared`, { cleared });
  }
}

// ============================================================================
// THROTTLER INSTANCES FOR EACH EXTERNAL API
// ============================================================================

// RugCheck - Conservative limits (free tier, unknown rate limits)
export const rugCheckThrottler = new ApiRequestThrottler(
  'RugCheck',
  2,    // Max 2 concurrent requests
  500   // 500ms between requests (2 req/sec max)
);

// DexScreener - More permissive (public API with generous limits)
export const dexScreenerThrottler = new ApiRequestThrottler(
  'DexScreener',
  3,    // Max 3 concurrent requests
  300   // 300ms between requests (3.3 req/sec max)
);

// Birdeye - Conservative without API key, more permissive with key
const hasBirdeyeKey = !!process.env.BIRDEYE_API_KEY;
export const birdeyeThrottler = new ApiRequestThrottler(
  'Birdeye',
  hasBirdeyeKey ? 5 : 2,  // More concurrent with API key
  hasBirdeyeKey ? 200 : 600  // Faster requests with API key
);

// Solscan - Conservative limits
export const solscanThrottler = new ApiRequestThrottler(
  'Solscan',
  2,    // Max 2 concurrent requests
  500   // 500ms between requests
);

// Jupiter - Public API, moderate limits
export const jupiterThrottler = new ApiRequestThrottler(
  'Jupiter',
  3,    // Max 3 concurrent requests
  400   // 400ms between requests (2.5 req/sec max)
);

// CoinGecko - Public API, conservative limits
export const coinGeckoThrottler = new ApiRequestThrottler(
  'CoinGecko',
  2,    // Max 2 concurrent requests
  1000  // 1000ms between requests (1 req/sec max for free tier)
);

// ============================================================================
// CONVENIENCE WRAPPER FUNCTIONS
// ============================================================================

export async function throttledRugCheckCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return rugCheckThrottler.execute(requestFn, options);
}

export async function throttledDexScreenerCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return dexScreenerThrottler.execute(requestFn, options);
}

export async function throttledBirdeyeCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return birdeyeThrottler.execute(requestFn, options);
}

export async function throttledSolscanCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return solscanThrottler.execute(requestFn, options);
}

export async function throttledJupiterCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return jupiterThrottler.execute(requestFn, options);
}

export async function throttledCoinGeckoCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return coinGeckoThrottler.execute(requestFn, options);
}

// ============================================================================
// STATS AGGREGATION
// ============================================================================

export function getAllApiStats(): Record<string, ThrottlerStats> {
  return {
    rugCheck: rugCheckThrottler.getStats(),
    dexScreener: dexScreenerThrottler.getStats(),
    birdeye: birdeyeThrottler.getStats(),
    solscan: solscanThrottler.getStats(),
    jupiter: jupiterThrottler.getStats(),
    coinGecko: coinGeckoThrottler.getStats(),
  };
}

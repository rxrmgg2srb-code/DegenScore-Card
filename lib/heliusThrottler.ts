/**
 * 🚦 Helius API Request Throttler
 *
 * Prevents overwhelming Helius API with too many concurrent requests
 * which causes 429 Rate Limit errors.
 *
 * Features:
 * - Request queuing with concurrency limit
 * - Automatic request spacing (minimum delay between requests)
 * - Priority queue support
 * - Timeout handling
 * - Metrics and monitoring
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

class HeliusRequestThrottler {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private lastRequestTime = 0;
  private totalRequests = 0;
  private totalErrors = 0;

  // Configuration
  private readonly maxConcurrent: number;
  private readonly minDelay: number; // Minimum ms between requests
  private readonly defaultTimeout: number;

  constructor(
    maxConcurrent = 5, // Max 5 concurrent requests to Helius
    minDelay = 200, // 200ms minimum between requests (5 req/sec max)
    defaultTimeout = 30000 // 30 second timeout
  ) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
    this.defaultTimeout = defaultTimeout;

    logger.info('[HeliusThrottler] Initialized', {
      maxConcurrent,
      minDelay,
      defaultTimeout,
    });
  }

  /**
   * Execute a request through the throttler
   */
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

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    // Check if we can process more requests
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Check if we need to wait before next request
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      setTimeout(() => this.processQueue(), this.minDelay - timeSinceLastRequest);
      return;
    }

    // Sort queue by priority (lower number = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority);

    // Get next request
    const request = this.queue.shift();
    if (!request) return;

    // Check if request has timed out while in queue
    const queueTime = Date.now() - request.addedAt;
    if (request.timeout && queueTime > request.timeout) {
      request.reject(new Error(`Request timed out in queue after ${queueTime}ms`));
      this.processQueue();
      return;
    }

    // Execute request
    this.activeRequests++;
    this.lastRequestTime = Date.now();
    this.totalRequests++;

    // Create timeout handler
    const timeoutHandle = request.timeout
      ? setTimeout(() => {
          request.reject(new Error(`Request execution timed out after ${request.timeout}ms`));
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
      // Process next request
      setTimeout(() => this.processQueue(), this.minDelay);
    }
  }

  /**
   * Get current queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: this.totalRequests > 0 ? (this.totalErrors / this.totalRequests) * 100 : 0,
    };
  }

  /**
   * Clear the queue (emergency use only)
   */
  clearQueue() {
    const cleared = this.queue.length;
    this.queue.forEach(req => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    logger.warn('[HeliusThrottler] Queue cleared', { cleared });
  }
}

// Singleton instance
export const heliusThrottler = new HeliusRequestThrottler();

/**
 * Wrap a Helius API call with throttling
 * Usage: const result = await throttledHeliusCall(() => fetch(...));
 */
export async function throttledHeliusCall<T>(
  requestFn: () => Promise<T>,
  options: { priority?: number; timeout?: number } = {}
): Promise<T> {
  return heliusThrottler.execute(requestFn, options);
}

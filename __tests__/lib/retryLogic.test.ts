import { CircuitBreaker, retry } from '@/lib/retryLogic';

describe('retryLogic', () => {
    describe('CircuitBreaker', () => {
        it('should execute successfully when under threshold', async () => {
            const breaker = new CircuitBreaker(3, 1000);
            const mockFn = jest.fn().mockResolvedValue('success');

            const result = await breaker.execute(mockFn);

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should open circuit after threshold failures', async () => {
            const breaker = new CircuitBreaker(2, 1000);
            const mockFn = jest.fn().mockRejectedValue(new Error('fail'));

            await expect(breaker.execute(mockFn)).rejects.toThrow();
            await expect(breaker.execute(mockFn)).rejects.toThrow();
            await expect(breaker.execute(mockFn)).rejects.toThrow('Circuit breaker is open');
        });

        it('should reset after timeout', async () => {
            jest.useFakeTimers();
            const breaker = new CircuitBreaker(1, 100);
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success');

            await expect(breaker.execute(mockFn)).rejects.toThrow('fail');

            jest.advanceTimersByTime(150);

            const result = await breaker.execute(mockFn);
            expect(result).toBe('success');

            jest.useRealTimers();
        });
    });

    describe('retry', () => {
        it('should succeed on first try', async () => {
            const mockFn = jest.fn().mockResolvedValue('success');

            const result = await retry(mockFn);

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure', async () => {
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const result = await retry(mockFn, { maxRetries: 3 });

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(3);
        });

        it('should throw after max retries', async () => {
            const mockFn = jest.fn().mockRejectedValue(new Error('persistent fail'));

            await expect(retry(mockFn, { maxRetries: 3 })).rejects.toThrow('persistent fail');
            expect(mockFn).toHaveBeenCalledTimes(4); // 1 + 3 retries
        });

        it('should respect retryable status codes', async () => {
            const error = new Error('Server error') as any;
            error.statusCode = 500;

            const mockFn = jest.fn().mockRejectedValue(error);

            await expect(retry(mockFn, {
                maxRetries: 2,
                retryableStatusCodes: [500],
            })).rejects.toThrow();

            expect(mockFn).toHaveBeenCalledTimes(3);
        });

        it('should not retry non-retryable status codes', async () => {
            const error = new Error('Not found') as any;
            error.statusCode = 404;

            const mockFn = jest.fn().mockRejectedValue(error);

            await expect(retry(mockFn, {
                maxRetries: 3,
                retryableStatusCodes: [500],
            })).rejects.toThrow();

            expect(mockFn).toHaveBeenCalledTimes(1); // No retries
        });

        it('should apply exponential backoff', async () => {
            jest.useFakeTimers();

            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const promise = retry(mockFn, {
                maxRetries: 3,
                initialDelay: 100,
                backoffMultiplier: 2,
            });

            // Should wait 100ms before first retry
            jest.advanceTimersByTime(99);
            expect(mockFn).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(1);
            await Promise.resolve(); // Let promise settle

            // Should wait 200ms before second retry
            jest.advanceTimersByTime(199);
            expect(mockFn).toHaveBeenCalledTimes(2);

            jest.advanceTimersByTime(1);
            await promise;
            expect(mockFn).toHaveBeenCalledTimes(3);

            jest.useRealTimers();
        });
    });
});

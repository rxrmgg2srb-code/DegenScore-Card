import { logger } from '@/lib/logger';

describe('logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have info method', () => {
        logger.info('test message');
        expect(logger.info).toHaveBeenCalled();
    });

    it('should have error method', () => {
        logger.error('error message');
        expect(logger.error).toHaveBeenCalled();
    });

    it('should have warn method', () => {
        logger.warn('warning message');
        expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
        logger.info('message', { data: 'test' });
        expect(logger.info).toHaveBeenCalledWith('message', { data: 'test' });
    });

    it('should log errors with stack traces', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error);
        expect(logger.error).toHaveBeenCalledWith('Error occurred', error);
    });
});

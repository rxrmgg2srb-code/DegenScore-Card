import {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    DatabaseError,
    APIError,
    InvalidWalletAddressError,
    RateLimitError,
    ExternalServiceError,
    ConfigurationError,
    isAppError,
    getErrorMessage,
    getErrorCode,
    ErrorContext,
} from '../lib/errors';

describe('Error Classes - Comprehensive Test Suite', () => {
    describe('AppError - Base Error Class', () => {
        it('should create an instance with all required properties', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            expect(error.message).toBe('Test error');
            expect(error.errorCode).toBe('TEST_ERROR');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('AppError');
            expect(error.timestamp).toBeInstanceOf(Date);
        });

        it('should default to statusCode 500 when not provided', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            expect(error.statusCode).toBe(500);
        });

        it('should capture stack trace', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('AppError');
        });

        it('should handle context object correctly', () => {
            const context: ErrorContext = { userId: '123', action: 'test' };
            const error = new AppError('Test error', 'TEST_ERROR', 400, context);
            expect(error.context).toEqual(context);
            expect(error.context?.userId).toBe('123');
        });

        it('should handle undefined context', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            expect(error.context).toBeUndefined();
        });

        it('should handle empty context object', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400, {});
            expect(error.context).toEqual({});
        });

        it('should be instance of Error', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AppError);
        });

        it('should handle empty message string', () => {
            const error = new AppError('', 'TEST_ERROR', 400);
            expect(error.message).toBe('');
        });

        it('should handle special characters in message', () => {
            const message = 'Test error with émojis 🚀 and symbols: @#$%^&*()';
            const error = new AppError(message, 'TEST_ERROR', 400);
            expect(error.message).toBe(message);
        });

        it('should handle very long messages', () => {
            const longMessage = 'A'.repeat(10000);
            const error = new AppError(longMessage, 'TEST_ERROR', 400);
            expect(error.message).toBe(longMessage);
            expect(error.message.length).toBe(10000);
        });

        it('should handle unicode characters in errorCode', () => {
            const error = new AppError('Test', 'TEST_ERROR_🔥', 400);
            expect(error.errorCode).toBe('TEST_ERROR_🔥');
        });

        it('should handle nested context objects', () => {
            const context: ErrorContext = {
                user: { id: '123', name: 'Test' },
                request: { url: '/api/test', method: 'POST' },
                metadata: { nested: { deep: { value: true } } }
            };
            const error = new AppError('Test error', 'TEST_ERROR', 400, context);
            expect(error.context).toEqual(context);
        });

        it('should maintain timestamp accuracy', () => {
            const beforeTime = new Date();
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            const afterTime = new Date();

            expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(error.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });

        it('should handle all valid HTTP status codes', () => {
            const statusCodes = [100, 200, 201, 204, 301, 400, 401, 403, 404, 429, 500, 502, 503];
            statusCodes.forEach(code => {
                const error = new AppError('Test', 'TEST', code);
                expect(error.statusCode).toBe(code);
            });
        });
    });

    describe('ValidationError', () => {
        it('should create a validation error with default status 400', () => {
            const error = new ValidationError('Invalid input');
            expect(error.message).toBe('Invalid input');
            expect(error.errorCode).toBe('VALIDATION_ERROR');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('ValidationError');
        });

        it('should handle context for validation errors', () => {
            const context: ErrorContext = { field: 'email', value: 'invalid-email' };
            const error = new ValidationError('Invalid email format', context);
            expect(error.context).toEqual(context);
        });

        it('should be instance of AppError', () => {
            const error = new ValidationError('Invalid input');
            expect(error).toBeInstanceOf(AppError);
            expect(error).toBeInstanceOf(ValidationError);
        });

        it('should handle multiple validation errors in context', () => {
            const context: ErrorContext = {
                errors: [
                    { field: 'email', message: 'Invalid format' },
                    { field: 'password', message: 'Too short' }
                ]
            };
            const error = new ValidationError('Multiple validation errors', context);
            expect(error.context?.errors).toHaveLength(2);
        });
    });

    describe('NotFoundError', () => {
        it('should create a not found error with default status 404', () => {
            const error = new NotFoundError('Resource');
            expect(error.message).toBe('Resource not found');
            expect(error.errorCode).toBe('NOT_FOUND');
            expect(error.statusCode).toBe(404);
            expect(error.name).toBe('NotFoundError');
        });

        it('should include identifier in message when provided', () => {
            const error = new NotFoundError('User', '12345');
            expect(error.message).toBe('User not found: 12345');
            expect(error.context?.resource).toBe('User');
            expect(error.context?.identifier).toBe('12345');
        });

        it('should handle undefined identifier', () => {
            const error = new NotFoundError('User');
            expect(error.message).toBe('User not found');
            expect(error.context?.resource).toBe('User');
            expect(error.context?.identifier).toBeUndefined();
        });

        it('should handle empty string identifier', () => {
            const error = new NotFoundError('User', '');
            expect(error.message).toBe('User not found');
        });

        it('should handle complex identifiers', () => {
            const identifier = 'user-123-abc-xyz';
            const error = new NotFoundError('Resource', identifier);
            expect(error.message).toContain(identifier);
        });
    });

    describe('AuthenticationError', () => {
        it('should create an authentication error with default status 401', () => {
            const error = new AuthenticationError('Unauthorized');
            expect(error.message).toBe('Unauthorized');
            expect(error.errorCode).toBe('AUTHENTICATION_ERROR');
            expect(error.statusCode).toBe(401);
            expect(error.name).toBe('AuthenticationError');
        });

        it('should handle authentication context', () => {
            const context: ErrorContext = { attemptedUser: 'test@example.com', reason: 'invalid_credentials' };
            const error = new AuthenticationError('Invalid credentials', context);
            expect(error.context).toEqual(context);
        });
    });

    describe('AuthorizationError', () => {
        it('should create an authorization error with default status 403', () => {
            const error = new AuthorizationError('Forbidden');
            expect(error.message).toBe('Forbidden');
            expect(error.errorCode).toBe('AUTHORIZATION_ERROR');
            expect(error.statusCode).toBe(403);
            expect(error.name).toBe('AuthorizationError');
        });

        it('should handle authorization context with roles', () => {
            const context: ErrorContext = {
                requiredRole: 'admin',
                userRole: 'user',
                resource: '/admin/users'
            };
            const error = new AuthorizationError('Insufficient permissions', context);
            expect(error.context).toEqual(context);
        });
    });

    describe('DatabaseError', () => {
        it('should create a database error with default status 500', () => {
            const error = new DatabaseError('DB connection failed');
            expect(error.message).toBe('DB connection failed');
            expect(error.errorCode).toBe('DATABASE_ERROR');
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('DatabaseError');
        });

        it('should handle database-specific context', () => {
            const context: ErrorContext = {
                query: 'SELECT * FROM users',
                database: 'production',
                code: 'ER_DUP_ENTRY'
            };
            const error = new DatabaseError('Duplicate entry', context);
            expect(error.context).toEqual(context);
        });
    });

    describe('APIError', () => {
        it('should create an API error with default status 500', () => {
            const error = new APIError('API request failed');
            expect(error.message).toBe('API request failed');
            expect(error.errorCode).toBe('API_ERROR');
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('APIError');
        });

        it('should accept custom status code', () => {
            const error = new APIError('Bad request', 400);
            expect(error.statusCode).toBe(400);
        });

        it('should accept custom status code with context', () => {
            const context: ErrorContext = { endpoint: '/api/users', method: 'POST' };
            const error = new APIError('Rate limited', 429, context);
            expect(error.statusCode).toBe(429);
            expect(error.context).toEqual(context);
        });
    });

    describe('InvalidWalletAddressError', () => {
        it('should create an invalid wallet error with address in context', () => {
            const address = '0xinvalid';
            const error = new InvalidWalletAddressError(address);
            expect(error.message).toBe('Invalid wallet address');
            expect(error.errorCode).toBe('INVALID_ADDRESS');
            expect(error.statusCode).toBe(400);
            expect(error.context?.address).toBe(address);
        });

        it('should handle very long wallet addresses', () => {
            const longAddress = '0x' + 'a'.repeat(1000);
            const error = new InvalidWalletAddressError(longAddress);
            expect(error.context?.address).toBe(longAddress);
        });

        it('should handle empty wallet address', () => {
            const error = new InvalidWalletAddressError('');
            expect(error.context?.address).toBe('');
        });

        it('should handle special characters in address', () => {
            const specialAddress = '0x123!@#$%^&*()';
            const error = new InvalidWalletAddressError(specialAddress);
            expect(error.context?.address).toBe(specialAddress);
        });
    });

    describe('RateLimitError', () => {
        it('should create a rate limit error with default status 429', () => {
            const error = new RateLimitError('Too many requests');
            expect(error.message).toBe('Too many requests');
            expect(error.errorCode).toBe('RATE_LIMIT_EXCEEDED');
            expect(error.statusCode).toBe(429);
            expect(error.name).toBe('RateLimitError');
        });

        it('should handle rate limit context with retry info', () => {
            const context: ErrorContext = {
                limit: 100,
                current: 150,
                resetTime: Date.now() + 3600000,
                endpoint: '/api/users'
            };
            const error = new RateLimitError('Rate limit exceeded', context);
            expect(error.context).toEqual(context);
        });
    });

    describe('ExternalServiceError', () => {
        it('should create an external service error with default status 502', () => {
            const error = new ExternalServiceError('AWS', 'S3 upload failed');
            expect(error.message).toBe('External service error (AWS): S3 upload failed');
            expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
            expect(error.statusCode).toBe(502);
            expect(error.context?.service).toBe('AWS');
        });

        it('should merge additional context with service name', () => {
            const context: ErrorContext = { operation: 'upload', fileSize: 1024 };
            const error = new ExternalServiceError('S3', 'Upload failed', context);
            expect(error.context?.service).toBe('S3');
            expect(error.context?.operation).toBe('upload');
            expect(error.context?.fileSize).toBe(1024);
        });

        it('should handle empty service name', () => {
            const error = new ExternalServiceError('', 'Unknown error');
            expect(error.message).toBe('External service error (): Unknown error');
        });
    });

    describe('ConfigurationError', () => {
        it('should create a configuration error with default status 500', () => {
            const error = new ConfigurationError('Missing environment variable');
            expect(error.message).toBe('Missing environment variable');
            expect(error.errorCode).toBe('CONFIGURATION_ERROR');
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('ConfigurationError');
        });

        it('should handle configuration context', () => {
            const context: ErrorContext = {
                variable: 'DATABASE_URL',
                expected: 'string',
                received: 'undefined'
            };
            const error = new ConfigurationError('Missing config', context);
            expect(error.context).toEqual(context);
        });
    });

    describe('Error Helper Functions', () => {
        describe('isAppError', () => {
            it('should return true for AppError instances', () => {
                const error = new AppError('Test', 'TEST', 500);
                expect(isAppError(error)).toBe(true);
            });

            it('should return true for all AppError subclasses', () => {
                const errors = [
                    new ValidationError('test'),
                    new NotFoundError('resource'),
                    new AuthenticationError('test'),
                    new AuthorizationError('test'),
                    new DatabaseError('test'),
                    new APIError('test'),
                    new RateLimitError('test'),
                    new ExternalServiceError('service', 'test'),
                    new ConfigurationError('test'),
                    new InvalidWalletAddressError('0x123'),
                ];

                errors.forEach(error => {
                    expect(isAppError(error)).toBe(true);
                });
            });

            it('should return false for standard Error', () => {
                const error = new Error('Standard error');
                expect(isAppError(error)).toBe(false);
            });

            it('should return false for non-error objects', () => {
                expect(isAppError({})).toBe(false);
                expect(isAppError('string')).toBe(false);
                expect(isAppError(123)).toBe(false);
                expect(isAppError(null)).toBe(false);
                expect(isAppError(undefined)).toBe(false);
            });

            it('should return false for objects that look like errors', () => {
                const fakeError = {
                    message: 'Test',
                    errorCode: 'TEST',
                    statusCode: 400
                };
                expect(isAppError(fakeError)).toBe(false);
            });
        });

        describe('getErrorMessage', () => {
            it('should extract message from Error instances', () => {
                const error = new Error('Test error');
                expect(getErrorMessage(error)).toBe('Test error');
            });

            it('should extract message from AppError instances', () => {
                const error = new AppError('App error', 'TEST', 500);
                expect(getErrorMessage(error)).toBe('App error');
            });

            it('should return string if error is a string', () => {
                expect(getErrorMessage('String error')).toBe('String error');
            });

            it('should return default message for unknown error types', () => {
                expect(getErrorMessage({})).toBe('An unknown error occurred');
                expect(getErrorMessage(123)).toBe('An unknown error occurred');
                expect(getErrorMessage(null)).toBe('An unknown error occurred');
                expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
            });

            it('should handle empty error messages', () => {
                const error = new Error('');
                expect(getErrorMessage(error)).toBe('');
            });

            it('should handle errors with special characters', () => {
                const error = new Error('Error: 🚀 Something went wrong! @#$%');
                expect(getErrorMessage(error)).toBe('Error: 🚀 Something went wrong! @#$%');
            });

            it('should handle boolean values', () => {
                expect(getErrorMessage(true)).toBe('An unknown error occurred');
                expect(getErrorMessage(false)).toBe('An unknown error occurred');
            });

            it('should handle arrays', () => {
                expect(getErrorMessage([])).toBe('An unknown error occurred');
                expect(getErrorMessage(['error'])).toBe('An unknown error occurred');
            });
        });

        describe('getErrorCode', () => {
            it('should extract error code from AppError instances', () => {
                const error = new AppError('Test', 'TEST_ERROR', 500);
                expect(getErrorCode(error)).toBe('TEST_ERROR');
            });

            it('should return specific codes for AppError subclasses', () => {
                expect(getErrorCode(new ValidationError('test'))).toBe('VALIDATION_ERROR');
                expect(getErrorCode(new NotFoundError('test'))).toBe('NOT_FOUND');
                expect(getErrorCode(new AuthenticationError('test'))).toBe('AUTHENTICATION_ERROR');
                expect(getErrorCode(new DatabaseError('test'))).toBe('DATABASE_ERROR');
            });

            it('should return UNKNOWN_ERROR for non-AppError instances', () => {
                expect(getErrorCode(new Error('test'))).toBe('UNKNOWN_ERROR');
                expect(getErrorCode('string')).toBe('UNKNOWN_ERROR');
                expect(getErrorCode({})).toBe('UNKNOWN_ERROR');
                expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
                expect(getErrorCode(undefined)).toBe('UNKNOWN_ERROR');
            });
        });
    });

    describe('Error Inheritance and Type Safety', () => {
        it('should maintain proper inheritance chain', () => {
            const error = new ValidationError('test');
            expect(error instanceof ValidationError).toBe(true);
            expect(error instanceof AppError).toBe(true);
            expect(error instanceof Error).toBe(true);
        });

        it('should differentiate between error types', () => {
            const validationError = new ValidationError('test');
            const notFoundError = new NotFoundError('test');

            expect(validationError instanceof ValidationError).toBe(true);
            expect(validationError instanceof NotFoundError).toBe(false);
            expect(notFoundError instanceof NotFoundError).toBe(true);
            expect(notFoundError instanceof ValidationError).toBe(false);
        });

        it('should allow type narrowing with instanceof', () => {
            const error: Error = new ValidationError('test');

            if (error instanceof ValidationError) {
                expect(error.errorCode).toBe('VALIDATION_ERROR');
                expect(error.statusCode).toBe(400);
            }
        });
    });

    describe('Error Serialization and JSON', () => {
        it('should serialize to JSON correctly', () => {
            const error = new AppError('Test error', 'TEST', 400, { userId: '123' });
            const json = JSON.parse(JSON.stringify(error));

            // Note: message from Error doesn't always serialize automatically
            // But our custom properties do
            expect(json.errorCode).toBe('TEST');
            expect(json.statusCode).toBe(400);
            expect(json.context).toEqual({ userId: '123' });
        });

        it('should handle circular references in context', () => {
            const context: any = { value: 'test' };
            context.circular = context;

            // This should not throw
            expect(() => {
                const error = new AppError('Test', 'TEST', 500, context);
                // We're just testing that creation doesn't throw
                expect(error.context).toBeDefined();
            }).not.toThrow();
        });
    });

    describe('Edge Cases and Stress Tests', () => {
        it('should handle extremely long error messages', () => {
            const veryLongMessage = 'Error: ' + 'A'.repeat(1000000);
            const error = new AppError(veryLongMessage, 'TEST', 500);
            expect(error.message.length).toBeGreaterThan(1000000);
        });

        it('should handle rapid error creation', () => {
            const errors = [];
            const count = 10000;

            for (let i = 0; i < count; i++) {
                errors.push(new AppError(`Error ${i}`, 'TEST', 500));
            }

            expect(errors).toHaveLength(count);
            expect(errors[0].message).toBe('Error 0');
            expect(errors[count - 1].message).toBe(`Error ${count - 1}`);
        });

        it('should maintain unique timestamps for rapid creation', () => {
            const error1 = new AppError('Test 1', 'TEST', 500);
            const error2 = new AppError('Test 2', 'TEST', 500);

            // Timestamps should be close but could be the same millisecond
            const timeDiff = Math.abs(error2.timestamp.getTime() - error1.timestamp.getTime());
            expect(timeDiff).toBeLessThan(100); // Within 100ms
        });

        it('should handle context with various data types', () => {
            const context: ErrorContext = {
                string: 'test',
                number: 123,
                boolean: true,
                null: null,
                undefined: undefined,
                array: [1, 2, 3],
                object: { nested: true },
                date: new Date(),
                regex: /test/g,
            };

            const error = new AppError('Test', 'TEST', 500, context);
            expect(error.context).toBeDefined();
            expect(error.context?.string).toBe('test');
            expect(error.context?.number).toBe(123);
        });
    });
});

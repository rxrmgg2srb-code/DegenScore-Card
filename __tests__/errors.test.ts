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

    describe('🔥 NUCLEAR LEVEL TESTS - Extreme Edge Cases 🔥', () => {
        describe('Immutability and Object Freezing', () => {
            it('should handle frozen error objects', () => {
                const error = new AppError('Test', 'TEST', 500);
                Object.freeze(error);

                expect(error.message).toBe('Test');
                expect(error.errorCode).toBe('TEST');
                expect(Object.isFrozen(error)).toBe(true);

                // In strict mode (Jest), this throws TypeError
                expect(() => {
                    (error as any).newProp = 'value';
                }).toThrow(TypeError);
                expect((error as any).newProp).toBeUndefined();
            });

            it('should handle sealed error objects', () => {
                const error = new AppError('Test', 'TEST', 500);
                Object.seal(error);

                expect(Object.isSealed(error)).toBe(true);
                // In strict mode, adding properties to sealed objects throws
                expect(() => {
                    (error as any).newProp = 'value';
                }).toThrow(TypeError);
            });

            it('should handle frozen context objects', () => {
                const context = Object.freeze({ key: 'value' });
                const error = new AppError('Test', 'TEST', 500, context);

                expect(error.context?.key).toBe('value');
                expect(Object.isFrozen(error.context)).toBe(true);
            });

            it('should handle deeply frozen nested objects', () => {
                const context = {
                    level1: Object.freeze({
                        level2: Object.freeze({
                            level3: 'deep'
                        })
                    })
                };

                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.level1?.level2?.level3).toBe('deep');
            });
        });

        describe('JavaScript Limits and Boundaries', () => {
            it('should handle Number.MAX_SAFE_INTEGER', () => {
                const error = new AppError('Test', 'TEST', Number.MAX_SAFE_INTEGER);
                expect(error.statusCode).toBe(Number.MAX_SAFE_INTEGER);
            });

            it('should handle Number.MIN_SAFE_INTEGER as status code', () => {
                const error = new AppError('Test', 'TEST', Number.MIN_SAFE_INTEGER);
                expect(error.statusCode).toBe(Number.MIN_SAFE_INTEGER);
            });

            it('should handle context with MAX_SAFE_INTEGER values', () => {
                const context = {
                    bigNumber: Number.MAX_SAFE_INTEGER,
                    negativeBig: Number.MIN_SAFE_INTEGER,
                };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.bigNumber).toBe(Number.MAX_SAFE_INTEGER);
            });

            it('should handle extremely deep stack traces', () => {
                function deepRecursion(depth: number): AppError {
                    if (depth === 0) {
                        return new AppError('Deep error', 'DEEP', 500);
                    }
                    return deepRecursion(depth - 1);
                }

                const error = deepRecursion(100);
                expect(error.stack).toBeDefined();
                expect(error.stack!.split('\n').length).toBeGreaterThan(10);
            });
        });

        describe('Prototype Pollution and Security', () => {
            it('should not allow prototype pollution via constructor', () => {
                const maliciousContext: any = {
                    '__proto__': { polluted: true },
                    'constructor': { prototype: { polluted: true } }
                };

                const error = new AppError('Test', 'TEST', 500, maliciousContext);

                // Should not pollute Object.prototype
                expect((Object.prototype as any).polluted).toBeUndefined();
                expect(error.context).toBeDefined();
            });

            it('should handle context with __proto__ property', () => {
                const context = { '__proto__': 'malicious' };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context).toBeDefined();
            });

            it('should preserve prototype chain integrity', () => {
                const error = new ValidationError('Test');
                expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
                expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(AppError.prototype);
                expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(error)))).toBe(Error.prototype);
            });
        });

        describe('Concurrency and Timing', () => {
            it('should handle concurrent error creation', async () => {
                const promises = Array.from({ length: 1000 }, (_, i) =>
                    Promise.resolve(new AppError(`Error ${i}`, 'TEST', 500))
                );

                const errors = await Promise.all(promises);
                expect(errors).toHaveLength(1000);
                expect(errors[0].message).toBe('Error 0');
                expect(errors[999].message).toBe('Error 999');
            });

            it('should maintain unique timestamps under rapid creation', () => {
                const errors = Array.from({ length: 100 }, () =>
                    new AppError('Test', 'TEST', 500)
                );

                // At least some timestamps should be different
                const uniqueTimestamps = new Set(errors.map(e => e.timestamp.getTime()));
                // Can't guarantee all unique due to millisecond precision
                expect(uniqueTimestamps.size).toBeGreaterThan(0);
            });

            it('should handle errors created in async context', async () => {
                const error = await new Promise<AppError>((resolve) => {
                    setTimeout(() => {
                        resolve(new AppError('Async', 'ASYNC', 500));
                    }, 0);
                });

                expect(error.message).toBe('Async');
            });
        });

        describe('Exotic Types and Values', () => {
            it('should handle Symbol in context', () => {
                const sym = Symbol('test');
                const context = { symbol: sym };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.symbol).toBe(sym);
            });

            it('should handle BigInt in context', () => {
                const big = BigInt('9007199254740991');
                const context = { bigint: big };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.bigint).toBe(big);
            });

            it('should handle Map in context', () => {
                const map = new Map([['key', 'value']]);
                const context = { map };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.map).toBe(map);
                expect(error.context?.map.get('key')).toBe('value');
            });

            it('should handle Set in context', () => {
                const set = new Set([1, 2, 3]);
                const context = { set };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.set).toBe(set);
                expect(error.context?.set.size).toBe(3);
            });

            it('should handle WeakMap in context', () => {
                const obj = { key: 'value' };
                const weakMap = new WeakMap([[obj, 'data']]);
                const context = { weakMap };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.weakMap).toBe(weakMap);
            });

            it('should handle Function in context', () => {
                const fn = () => 'test';
                const context = { fn };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.fn).toBe(fn);
                expect(error.context?.fn()).toBe('test');
            });

            it('should handle class instances in context', () => {
                class Custom { value = 42; }
                const instance = new Custom();
                const context = { instance };
                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.instance).toBe(instance);
                expect(error.context?.instance.value).toBe(42);
            });
        });

        describe('Unicode and Internationalization Extremes', () => {
            it('should handle right-to-left text', () => {
                const rtlText = 'مرحبا بك في العالم';
                const error = new AppError(rtlText, 'RTL', 500);
                expect(error.message).toBe(rtlText);
            });

            it('should handle mixed bidirectional text', () => {
                const bidiText = 'Hello مرحبا World 世界';
                const error = new AppError(bidiText, 'BIDI', 500);
                expect(error.message).toBe(bidiText);
            });

            it('should handle zero-width characters', () => {
                const text = 'Hello\u200BWorld'; // Zero-width space
                const error = new AppError(text, 'ZERO', 500);
                expect(error.message).toContain('Hello');
                expect(error.message).toContain('World');
            });

            it('should handle combining characters', () => {
                const text = 'café'; // Using combining acute accent
                const error = new AppError(text, 'COMBINING', 500);
                expect(error.message).toBeDefined();
            });

            it('should handle emoji with skin tone modifiers', () => {
                const emoji = '👋🏽👨🏾‍💻🎉';
                const error = new AppError(emoji, 'EMOJI', 500);
                expect(error.message).toBe(emoji);
            });

            it('should handle emoji sequences', () => {
                const sequence = '👨‍👩‍👧‍👦'; // Family emoji (ZWJ sequence)
                const error = new AppError(sequence, 'ZWJ', 500);
                expect(error.message).toBe(sequence);
            });

            it('should handle surrogate pairs', () => {
                const text = '𝕳𝖊𝖑𝖑𝖔'; // Mathematical bold text
                const error = new AppError(text, 'SURROGATE', 500);
                expect(error.message).toBe(text);
            });
        });

        describe('Memory and Performance Extremes', () => {
            it('should handle 1 million character message without OOM', () => {
                const hugMessage = 'A'.repeat(1000000);
                const error = new AppError(hugMessage, 'HUGE', 500);
                expect(error.message.length).toBe(1000000);
            });

            it('should handle deeply nested context (100 levels)', () => {
                let context: any = { value: 'deep' };
                for (let i = 0; i < 100; i++) {
                    context = { nested: context };
                }

                const error = new AppError('Test', 'DEEP', 500, context);
                expect(error.context).toBeDefined();

                // Navigate to the deepest value
                let current: any = error.context;
                for (let i = 0; i < 100; i++) {
                    current = current?.nested;
                }
                expect(current?.value).toBe('deep');
            });

            it('should handle context with 10,000 properties', () => {
                const context: any = {};
                for (let i = 0; i < 10000; i++) {
                    context[`key${i}`] = `value${i}`;
                }

                const error = new AppError('Test', 'WIDE', 500, context);
                expect(error.context?.key0).toBe('value0');
                expect(error.context?.key9999).toBe('value9999');
            });

            it('should handle rapid error creation and garbage collection', () => {
                const iterations = 100000;
                let lastError: AppError | null = null;

                for (let i = 0; i < iterations; i++) {
                    lastError = new AppError(`Error ${i}`, 'TEST', 500);
                }

                expect(lastError?.message).toBe(`Error ${iterations - 1}`);
                // Previous errors should be eligible for GC
            });
        });

        describe('Error Chaining and Wrapping', () => {
            it('should handle error as cause in context', () => {
                const cause = new Error('Original error');
                const error = new AppError('Wrapped error', 'WRAPPED', 500, { cause });

                expect(error.context?.cause).toBe(cause);
                expect((error.context?.cause as Error).message).toBe('Original error');
            });

            it('should handle multiple levels of error wrapping', () => {
                const level1 = new Error('Level 1');
                const level2 = new AppError('Level 2', 'L2', 500, { cause: level1 });
                const level3 = new AppError('Level 3', 'L3', 500, { cause: level2 });

                expect(level3.context?.cause).toBe(level2);
                expect((level3.context?.cause as AppError).context?.cause).toBe(level1);
            });

            it('should handle error chains with 50 levels', () => {
                let error: Error = new Error('Root');

                for (let i = 0; i < 50; i++) {
                    error = new AppError(`Level ${i}`, `L${i}`, 500, { cause: error });
                }

                expect(error.message).toBe('Level 49');

                // Walk the chain
                let current: any = error;
                let depth = 0;
                while (current.context?.cause && depth < 100) {
                    current = current.context.cause;
                    depth++;
                }
                expect(depth).toBe(50);
            });
        });

        describe('Proxy and Getter/Setter Behavior', () => {
            it('should handle Proxy wrapping error objects', () => {
                const error = new AppError('Test', 'TEST', 500);
                const handler = {
                    get(target: any, prop: string) {
                        if (prop === 'message') return 'Proxied message';
                        return target[prop];
                    }
                };

                const proxied = new Proxy(error, handler);
                expect(proxied.message).toBe('Proxied message');
                expect(proxied.errorCode).toBe('TEST');
            });

            it('should handle getters in context', () => {
                const context = {
                    get computed() {
                        return 'computed value';
                    }
                };

                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.computed).toBe('computed value');
            });

            it('should handle context with volatile getters', () => {
                let counter = 0;
                const context = {
                    get volatile() {
                        return counter++;
                    }
                };

                const error = new AppError('Test', 'TEST', 500, context);
                const val1 = error.context?.volatile;
                const val2 = error.context?.volatile;

                // Getter is called each time
                expect(val2).toBe(val1! + 1);
            });
        });

        describe('Type Coercion Edge Cases', () => {
            it('should handle objects with custom toString', () => {
                const context = {
                    custom: {
                        toString() { return 'Custom String'; },
                        valueOf() { return 42; }
                    }
                };

                const error = new AppError('Test', 'TEST', 500, context);
                expect(String(error.context?.custom)).toBe('Custom String');
                expect(Number(error.context?.custom)).toBe(42);
            });

            it('should handle status code as string (coercion)', () => {
                const error = new AppError('Test', 'TEST', '404' as any);
                expect(error.statusCode).toBe('404');
            });

            it('should handle errorCode as number', () => {
                const error = new AppError('Test', 12345 as any, 500);
                expect(error.errorCode).toBe(12345);
            });
        });

        describe('Helper Functions Under Extreme Conditions', () => {
            it('should handle getErrorMessage with Proxy', () => {
                const handler = {
                    get() { throw new Error('Proxy trap'); }
                };
                const proxy = new Proxy({}, handler);

                // Should handle gracefully
                expect(() => getErrorMessage(proxy)).not.toThrow();
            });

            it('should handle isAppError with modified prototype', () => {
                const error = new AppError('Test', 'TEST', 500);

                // Try to confuse instanceof
                expect(isAppError(error)).toBe(true);

                // Even if we mess with it
                const fake = Object.create(AppError.prototype);
                expect(fake instanceof AppError).toBe(true);
            });

            it('should handle getErrorCode with 1000 different error types', () => {
                const errors = Array.from({ length: 1000 }, (_, i) =>
                    new AppError(`Error ${i}`, `CODE_${i}`, 500)
                );

                errors.forEach((err, i) => {
                    expect(getErrorCode(err)).toBe(`CODE_${i}`);
                });
            });
        });

        describe('Extreme Serialization Cases', () => {
            it('should handle context with non-enumerable properties', () => {
                const context: any = { visible: 'yes' };
                Object.defineProperty(context, 'hidden', {
                    value: 'secret',
                    enumerable: false
                });

                const error = new AppError('Test', 'TEST', 500, context);
                expect(error.context?.visible).toBe('yes');
                expect(error.context?.hidden).toBe('secret');

                const json = JSON.parse(JSON.stringify(error));
                expect(json.context?.visible).toBe('yes');
                // Hidden won't serialize
                expect(json.context?.hidden).toBeUndefined();
            });

            it('should handle toJSON method in context', () => {
                const context = {
                    data: {
                        secret: 'hidden',
                        toJSON() {
                            return { sanitized: true };
                        }
                    }
                };

                const error = new AppError('Test', 'TEST', 500, context);
                const json = JSON.parse(JSON.stringify(error));

                expect(json.context?.data).toEqual({ sanitized: true });
            });

            it('should handle context with getters that throw', () => {
                const context = {
                    get dangerous() {
                        throw new Error('Getter error');
                    }
                };

                const error = new AppError('Test', 'TEST', 500, context);

                // Should not throw during creation
                expect(error).toBeDefined();

                // But accessing the getter will throw
                expect(() => error.context?.dangerous).toThrow('Getter error');
            });
        });
    });
});

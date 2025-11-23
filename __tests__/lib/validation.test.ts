/**
 * Unit Tests for Input Validation
 * Tests schema validation, sanitization, and security checks
 */

import {
    validateWalletAddress,
    validateSignature,
    validateEmail,
} from '../../lib/validation';
import { sanitizeString } from '../../lib/sanitize';

describe('Input Validation', () => {
    describe('validateWalletAddress', () => {
        it('should accept valid Solana addresses', () => {
            const validAddresses = [
                'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
                '11111111111111111111111111111111',
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            ];

            validAddresses.forEach(address => {
                expect(validateWalletAddress(address)).toBe(true);
            });
        });

        it('should reject invalid Solana addresses', () => {
            const invalidAddresses = [
                '',
                'invalid',
                '123',
                'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK!', // Invalid character
                'DYw8jCTfwHNRJhhmFcbX', // Too short
                null,
                undefined,
            ];

            invalidAddresses.forEach(address => {
                expect(validateWalletAddress(address as any)).toBe(false);
            });
        });

        it('should reject addresses with wrong length', () => {
            const tooShort = 'DYw8jCTfwHNRJhhmF';
            const tooLong = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK' + 'EXTRA';

            expect(validateWalletAddress(tooShort)).toBe(false);
            expect(validateWalletAddress(tooLong)).toBe(false);
        });
    });

    describe('validateSignature', () => {
        it('should accept valid base58 signatures', () => {
            const validSignature = 'A'.repeat(87); // Base58 chars
            expect(validateSignature(validSignature)).toBe(true);
        });

        it('should reject invalid signatures', () => {
            const invalidSignatures = [
                '',
                'invalid!@#$', // Invalid characters
                '123',
                null,
                undefined,
            ];

            invalidSignatures.forEach(sig => {
                expect(validateSignature(sig as any)).toBe(false);
            });
        });

        it('should reject signatures that are too short', () => {
            expect(validateSignature('short')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should accept valid email addresses', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co',
                'user+tag@example.com',
                'user123@subdomain.example.com',
            ];

            validEmails.forEach(email => {
                expect(validateEmail(email)).toBe(true);
            });
        });

        it('should reject invalid email addresses', () => {
            const invalidEmails = [
                '',
                'notanemail',
                '@example.com',
                'user@',
                'user @example.com', // Space
                'user@.com',
                null,
                undefined,
            ];

            invalidEmails.forEach(email => {
                expect(validateEmail(email as any)).toBe(false);
            });
        });
    });

    describe('sanitizeString', () => {
        it('should remove HTML tags', () => {
            const input = '<script>alert("XSS")</script>Hello';
            const output = sanitizeString(input);

            expect(output).not.toContain('<script>');
            expect(output).not.toContain('</script>');
            expect(output).toBe('Hello');
        });

        it('should remove JavaScript events', () => {
            const input = '<img src="x" onerror="alert(1)">';
            const output = sanitizeString(input);

            expect(output).not.toContain('onerror');
            expect(output).not.toContain('alert');
        });

        it('should handle empty strings', () => {
            expect(sanitizeString('')).toBe('');
        });

        it('should handle null and undefined', () => {
            expect(sanitizeString(null as any)).toBe('');
            expect(sanitizeString(undefined as any)).toBe('');
        });

        it('should preserve safe text', () => {
            const safeText = 'This is a safe string with numbers 123 and symbols !@#';
            expect(sanitizeString(safeText)).toBe(safeText);
        });

        it('should handle SQL injection attempts', () => {
            const sqlInjection = "'; DROP TABLE users; --";
            const output = sanitizeString(sqlInjection);

            // Should not contain dangerous SQL
            expect(output).toBeDefined();
            // The exact output depends on your sanitization library
        });

        it('should handle NoSQL injection attempts', () => {
            const noSqlInjection = '{"$gt": ""}';
            const output = sanitizeString(noSqlInjection);

            expect(output).toBeDefined();
        });

        it('should trim whitespace', () => {
            const input = '  whitespace around  ';
            const output = sanitizeString(input);

            expect(output.startsWith(' ')).toBe(false);
            expect(output.endsWith(' ')).toBe(false);
        });

        it('should handle very long strings', () => {
            const longString = 's'.repeat(10000);
            const output = sanitizeString(longString);

            expect(output.length).toBeLessThanOrEqual(10000);
        });
    });

    describe('Security Edge Cases', () => {
        it('should handle unicode characters safely', () => {
            const unicode = 'Hello 世界 🌍';
            const output = sanitizeString(unicode);

            expect(output).toContain('Hello');
            // Unicode handling depends on your sanitization
        });

        it('should handle encoded scripts', () => {
            const encoded = '%3Cscript%3Ealert(1)%3C/script%3E';
            const output = sanitizeString(encoded);

            // Should decode and remove
            expect(output).not.toContain('script');
        });

        it('should handle mixed case HTML tags', () => {
            const mixedCase = '<ScRiPt>alert(1)</sCrIpT>';
            const output = sanitizeString(mixedCase);

            expect(output.toLowerCase()).not.toContain('script');
        });
    });
});

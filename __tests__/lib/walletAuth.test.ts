/**
 * Tests for Wallet Authentication System
 * Critical security functionality - Ed25519 signature verification and JWT
 */

import {
  generateAuthChallenge,
  verifyWalletSignature,
  isAuthChallengeValid,
  verifyAuthentication,
  generateSessionToken,
  verifySessionToken,
  WalletAuthResponse,
} from '../../lib/walletAuth';

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key-minimum-48-chars-for-security-compliance-testing-only';

describe('Wallet Authentication System', () => {
  describe('Challenge Generation', () => {
    it('should generate a valid auth challenge', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const challenge = generateAuthChallenge(walletAddress);

      expect(challenge).toHaveProperty('message');
      expect(challenge).toHaveProperty('timestamp');
      expect(challenge).toHaveProperty('nonce');
      expect(challenge.message).toContain(walletAddress);
      expect(challenge.message).toContain('DegenScore Card Authentication');
    });

    it('should include timestamp in challenge message', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const challenge = generateAuthChallenge(walletAddress);

      expect(challenge.message).toContain(challenge.timestamp.toString());
    });

    it('should include nonce in challenge message', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const challenge = generateAuthChallenge(walletAddress);

      expect(challenge.message).toContain(challenge.nonce);
    });

    it('should generate unique nonces for each challenge', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const challenge1 = generateAuthChallenge(walletAddress);
      const challenge2 = generateAuthChallenge(walletAddress);

      expect(challenge1.nonce).not.toBe(challenge2.nonce);
    });
  });

  describe('Timestamp Validation', () => {
    it('should accept recent timestamps (within 5 minutes)', () => {
      const recentTimestamp = Date.now() - 60000; // 1 minute ago
      expect(isAuthChallengeValid(recentTimestamp)).toBe(true);
    });

    it('should accept current timestamp', () => {
      const now = Date.now();
      expect(isAuthChallengeValid(now)).toBe(true);
    });

    it('should reject old timestamps (>5 minutes)', () => {
      const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      expect(isAuthChallengeValid(oldTimestamp)).toBe(false);
    });

    it('should reject future timestamps', () => {
      const futureTimestamp = Date.now() + 60000; // 1 minute in future
      expect(isAuthChallengeValid(futureTimestamp)).toBe(false);
    });

    it('should reject very old timestamps', () => {
      const veryOldTimestamp = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      expect(isAuthChallengeValid(veryOldTimestamp)).toBe(false);
    });
  });

  describe('Signature Verification', () => {
    it('should reject invalid signature format', () => {
      const invalidSignature = 'not-a-valid-base58-signature';
      const message = 'Test message';
      const publicKey = 'DemoWallet1111111111111111111111111111111111';

      const result = verifyWalletSignature(invalidSignature, message, publicKey);
      expect(result).toBe(false);
    });

    it('should reject empty signature', () => {
      const emptySignature = '';
      const message = 'Test message';
      const publicKey = 'DemoWallet1111111111111111111111111111111111';

      const result = verifyWalletSignature(emptySignature, message, publicKey);
      expect(result).toBe(false);
    });

    it('should reject invalid public key', () => {
      const signature = 'validbase58signature';
      const message = 'Test message';
      const invalidPublicKey = 'not-a-valid-public-key';

      const result = verifyWalletSignature(signature, message, invalidPublicKey);
      expect(result).toBe(false);
    });

    it('should handle verification errors gracefully', () => {
      // Test with malformed inputs that should not crash
      expect(() => {
        verifyWalletSignature('invalid', 'message', 'invalid-key');
      }).not.toThrow();
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should reject expired authentication', () => {
      const authResponse: WalletAuthResponse = {
        publicKey: 'DemoWallet1111111111111111111111111111111111',
        signature: 'validbase58signature',
        message: 'Test message with DemoWallet1111111111111111111111111111111111',
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago
      };

      const result = verifyAuthentication(authResponse);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should reject message without public key', () => {
      const authResponse: WalletAuthResponse = {
        publicKey: 'DemoWallet1111111111111111111111111111111111',
        signature: 'validbase58signature',
        message: 'Test message without wallet address',
        timestamp: Date.now(),
      };

      const result = verifyAuthentication(authResponse);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should include descriptive error messages', () => {
      const authResponse: WalletAuthResponse = {
        publicKey: 'DemoWallet1111111111111111111111111111111111',
        signature: 'invalid',
        message: 'Test message',
        timestamp: Date.now() - (10 * 60 * 1000),
      };

      const result = verifyAuthentication(authResponse);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('JWT Session Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(walletAddress);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should throw error if JWT_SECRET is too short', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'short';

      expect(() => {
        generateSessionToken('DemoWallet1111111111111111111111111111111111');
      }).toThrow('at least 32 characters');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        generateSessionToken('DemoWallet1111111111111111111111111111111111');
      }).toThrow('JWT_SECRET must be set');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should generate different tokens for different wallets', () => {
      const wallet1 = 'Wallet11111111111111111111111111111111111111';
      const wallet2 = 'Wallet22222222222222222222222222222222222222';

      const token1 = generateSessionToken(wallet1);
      const token2 = generateSessionToken(wallet2);

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens on each call (unique nonce)', () => {
      const wallet = 'DemoWallet1111111111111111111111111111111111';
      const token1 = generateSessionToken(wallet);
      const token2 = generateSessionToken(wallet);

      expect(token1).not.toBe(token2);
    });
  });

  describe('JWT Session Token Verification', () => {
    it('should verify valid token', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(walletAddress);
      const result = verifySessionToken(token);

      expect(result.valid).toBe(true);
      expect(result.wallet).toBe(walletAddress);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token', () => {
      const invalidToken = 'not.a.valid.token';
      const result = verifySessionToken(invalidToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty token', () => {
      const result = verifySessionToken('');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject token with wrong signature', () => {
      const walletAddress = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(walletAddress);
      
      // Tamper with the token
      const tamperedToken = token.slice(0, -10) + 'XXXXXXXXXX';
      const result = verifySessionToken(tamperedToken);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid token');
    });

    it('should fail gracefully if JWT_SECRET not configured', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const result = verifySessionToken('some.token.here');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not configured');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should extract correct wallet address from token', () => {
      const walletAddress = 'Wallet11111111111111111111111111111111111111';
      const token = generateSessionToken(walletAddress);
      const result = verifySessionToken(token);

      expect(result.wallet).toBe(walletAddress);
    });

    it('should handle multiple different wallets', () => {
      const wallets = [
        'Wallet11111111111111111111111111111111111111',
        'Wallet22222222222222222222222222222222222222',
        'Wallet33333333333333333333333333333333333333',
      ];

      wallets.forEach(wallet => {
        const token = generateSessionToken(wallet);
        const result = verifySessionToken(token);

        expect(result.valid).toBe(true);
        expect(result.wallet).toBe(wallet);
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('should reject token signed with different secret', () => {
      // This test ensures tokens from other systems are rejected
      const otherSecret = 'completely-different-secret-key-that-should-not-work-for-verification';
      const originalSecret = process.env.JWT_SECRET;
      
      process.env.JWT_SECRET = otherSecret;
      const tokenFromOtherSystem = generateSessionToken('Wallet11111111111111111111111111111111111111');
      
      process.env.JWT_SECRET = originalSecret;
      const result = verifySessionToken(tokenFromOtherSystem);

      expect(result.valid).toBe(false);
    });

    it('should handle very long wallet addresses', () => {
      const longWallet = 'W'.repeat(100);
      const challenge = generateAuthChallenge(longWallet);

      expect(challenge.message).toContain(longWallet);
    });

    it('should handle special characters in messages', () => {
      const message = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const publicKey = 'DemoWallet1111111111111111111111111111111111';

      // Should not crash
      expect(() => {
        verifyWalletSignature('signature', message, publicKey);
      }).not.toThrow();
    });

    it('should ensure JWT expiration is set', () => {
      const wallet = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(wallet);
      
      // Decode token payload (middle part)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload).toHaveProperty('exp');
      expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
    });

    it('should set JWT issuer correctly', () => {
      const wallet = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(wallet);
      
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.iss).toBe('degenscore-card');
    });

    it('should set JWT subject to wallet address', () => {
      const wallet = 'DemoWallet1111111111111111111111111111111111';
      const token = generateSessionToken(wallet);
      
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.sub).toBe(wallet);
    });
  });

  describe('Performance and Limits', () => {
    it('should generate tokens quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        generateSessionToken('Wallet11111111111111111111111111111111111111');
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in <1 second
    });

    it('should verify tokens quickly', () => {
      const wallet = 'DemoWallet1111111111111111111111111111111111';
      const tokens = Array.from({ length: 100 }, () => generateSessionToken(wallet));
      
      const start = Date.now();
      tokens.forEach(token => verifySessionToken(token));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete in <1 second
    });
  });
});

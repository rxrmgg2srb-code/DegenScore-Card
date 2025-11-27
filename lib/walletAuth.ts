import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import redis from '@/lib/cache/redis'; // ✅ SECURITY: Redis for nonce tracking


/**
 * Wallet Authentication Utility
 * Provides cryptographic verification of wallet ownership
 */

export interface WalletAuthChallenge {
  message: string;
  timestamp: number;
  nonce: string;
}

export interface WalletAuthResponse {
  publicKey: string;
  signature: string;
  message: string;
  timestamp: number;
  nonce: string; // ✅ SECURITY: Required for replay attack prevention
}

/**
 * Generate a challenge message for wallet signing
 */
export function generateAuthChallenge(walletAddress: string): WalletAuthChallenge {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);

  const message = `DegenScore Card Authentication

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

By signing this message, you prove ownership of this wallet.
This request will not trigger a blockchain transaction or cost any gas fees.`;

  return {
    message,
    timestamp,
    nonce,
  };
}

/**
 * Verify a signed message from a Solana wallet
 */
export function verifyWalletSignature(
  signature: string,
  message: string,
  publicKeyString: string
): boolean {
  try {
    // Decode the signature and public key from base58
    const signatureUint8 = bs58.decode(signature);
    const publicKey = new PublicKey(publicKeyString);
    const messageUint8 = new TextEncoder().encode(message);

    // Verify the signature
    const verified = nacl.sign.detached.verify(
      messageUint8,
      signatureUint8,
      publicKey.toBytes()
    );

    return verified;
  } catch (error) {
    logger.error('Signature verification failed', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    return false;
  }
}

/**
 * Validate that the authentication challenge is recent (within 5 minutes)
 */
export function isAuthChallengeValid(timestamp: number): boolean {
  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = Date.now();
  const age = now - timestamp;

  return age >= 0 && age <= FIVE_MINUTES;
}

/**
 * Complete authentication flow verification
 * ✅ SECURITY: Now includes replay attack protection via Redis nonce tracking
 */
export async function verifyAuthentication(authResponse: WalletAuthResponse): Promise<{
  valid: boolean;
  error?: string;
}> {
  // ✅ SECURITY FIX: Check if nonce has been used (Replay Attack Protection)
  const nonceKey = `auth:nonce:${authResponse.nonce}`;

  if (redis) {
    try {
      const nonceExists = await redis.get(nonceKey);
      if (nonceExists) {
        logger.warn('Replay attack detected - nonce already used', {
          nonce: authResponse.nonce.slice(0, 8),
          wallet: authResponse.publicKey.slice(0, 8)
        });
        return { valid: false, error: 'Authentication challenge already used (replay attack detected)' };
      }
    } catch (error) {
      // If Redis is down, log but continue (graceful degradation)
      logger.error('Redis nonce check failed, continuing without replay protection', error instanceof Error ? error : undefined);
    }
  } else {
    logger.warn('Redis not configured, replay attack protection disabled');
  }

  // Check if timestamp is valid (not too old)
  if (!isAuthChallengeValid(authResponse.timestamp)) {
    return { valid: false, error: 'Authentication challenge expired' };
  }

  // Verify the signature
  const signatureValid = verifyWalletSignature(
    authResponse.signature,
    authResponse.message,
    authResponse.publicKey
  );

  if (!signatureValid) {
    return { valid: false, error: 'Invalid signature' };
  }

  // Verify the message contains the correct wallet address
  if (!authResponse.message.includes(authResponse.publicKey)) {
    return { valid: false, error: 'Message does not match public key' };
  }

  // ✅ SECURITY: Mark nonce as used with 5-minute TTL (matching challenge validity)
  if (redis) {
    try {
      await redis.set(nonceKey, 'used', { ex: 300 }); // 5 minutes = 300 seconds
      logger.info('Nonce stored successfully', { nonce: authResponse.nonce.slice(0, 8) });
    } catch (error) {
      logger.error('Failed to store nonce in Redis', error instanceof Error ? error : undefined);
      // Continue anyway - the auth is valid even if we can't prevent future replay
    }
  }

  return { valid: true };
}

/**
 * Generate a session token for authenticated users using JWT
 */
export function generateSessionToken(walletAddress: string): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }

  const payload = {
    wallet: walletAddress,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2),
  };

  // Generate JWT with 7-day expiration
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'degenscore-card',
    subject: walletAddress,
  });
}

/**
 * Verify JWT session token
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  wallet?: string;
  error?: string;
} {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    return { valid: false, error: 'JWT_SECRET not configured' };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'degenscore-card',
    }) as { wallet: string; timestamp: number; nonce: string; sub: string };

    // JWT handles expiration automatically, but double-check wallet
    if (!decoded.wallet || decoded.wallet !== decoded.sub) {
      return { valid: false, error: 'Invalid token payload' };
    }

    return { valid: true, wallet: decoded.wallet };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Session expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token signature' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

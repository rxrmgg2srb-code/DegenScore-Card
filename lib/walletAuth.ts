import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

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
    console.error('Signature verification failed:', error);
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
 */
export function verifyAuthentication(authResponse: WalletAuthResponse): {
  valid: boolean;
  error?: string;
} {
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

  return { valid: true };
}

/**
 * Generate a session token for authenticated users
 */
export function generateSessionToken(walletAddress: string): string {
  const payload = {
    wallet: walletAddress,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2),
  };

  // In production, use JWT with proper secret
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  wallet?: string;
  error?: string;
} {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check if token is still valid (24 hours)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - payload.timestamp > ONE_DAY) {
      return { valid: false, error: 'Session expired' };
    }

    return { valid: true, wallet: payload.wallet };
  } catch (error) {
    return { valid: false, error: 'Invalid session token' };
  }
}

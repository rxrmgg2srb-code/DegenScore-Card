import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

/**
 * Verifies that a message was signed by the owner of a wallet
 * @param walletAddress - The Solana wallet address (base58)
 * @param signature - The signature (base58)
 * @param message - The original message that was signed
 * @returns true if signature is valid
 */
export function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): boolean {
  try {
    // Decode the public key
    const publicKey = new PublicKey(walletAddress);
    const publicKeyBytes = publicKey.toBytes();

    // Decode the signature
    const signatureBytes = bs58.decode(signature);

    // Encode the message
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    return isValid;
  } catch (error) {
    console.error('Error verifying wallet signature:', error);
    return false;
  }
}

/**
 * Generates a challenge message for the user to sign
 * Includes timestamp to prevent replay attacks
 */
export function generateChallengeMessage(walletAddress: string): string {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(7);

  return `DegenScore Authentication

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

Sign this message to prove you own this wallet.
This will not cost any SOL.`;
}

/**
 * Validates that a challenge message is recent (< 5 minutes old)
 */
export function isChallengeFresh(message: string): boolean {
  try {
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) return false;

    const timestamp = parseInt(timestampMatch[1]);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return (now - timestamp) < fiveMinutes;
  } catch {
    return false;
  }
}

import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface ParsedTransaction {
  signature: string;
  timestamp: number;
  type: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  description?: string;
  fee: number;
  feePayer: string;
}

export interface HeliusTransaction {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
}

/**
 * Obtiene las transacciones parseadas de una wallet usando Helius
 * @param walletAddress - Dirección de la wallet
 * @param limit - Número máximo de transacciones a obtener (default 100)
 * @param before - Signature de la última transacción para paginación (opcional)
 */
export async function getWalletTransactions(
  walletAddress: string,
  limit: number = 100,
  before?: string
): Promise<ParsedTransaction[]> {
  try {
    let url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
    
    // Agregar parámetro de paginación si existe
    if (before) {
      url += `&before=${before}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status} ${response.statusText}`);
    }

    const transactions: HeliusTransaction[] = await response.json();
    
    return transactions.map(tx => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      nativeTransfers: tx.nativeTransfers,
      tokenTransfers: tx.tokenTransfers,
      description: tx.description,
      fee: tx.fee,
      feePayer: tx.feePayer,
    }));
  } catch (error) {
    console.error('Error fetching transactions from Helius:', error);
    throw error;
  }
}

/**
 * Obtiene información detallada de tokens usando Helius DAS API
 */
export async function getTokenMetadata(mintAddresses: string[]): Promise<Map<string, any>> {
  try {
    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    const requests = mintAddresses.map(mint => ({
      jsonrpc: '2.0',
      id: mint,
      method: 'getAsset',
      params: { id: mint },
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requests),
    });

    if (!response.ok) {
      throw new Error(`Helius DAS API error: ${response.status}`);
    }

    const results = await response.json();
    const metadataMap = new Map();

    if (Array.isArray(results)) {
      results.forEach((result: any) => {
        if (result.result) {
          metadataMap.set(result.id, {
            symbol: result.result.content?.metadata?.symbol || 'UNKNOWN',
            name: result.result.content?.metadata?.name || 'Unknown Token',
            image: result.result.content?.links?.image,
          });
        }
      });
    }

    return metadataMap;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return new Map();
  }
}

/**
 * Obtiene el balance actual de SOL de una wallet
 */
export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Valida si una dirección de wallet es válida
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

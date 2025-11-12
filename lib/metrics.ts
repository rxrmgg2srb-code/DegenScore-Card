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
 * Valida si una dirección es una wallet válida de Solana
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene las transacciones parseadas de una wallet usando Helius
 * MEJORADO: Ahora soporta paginación correcta
 */
export async function getWalletTransactions(
  walletAddress: string,
  limit: number = 100,
  before?: string
): Promise<ParsedTransaction[]> {
  try {
    if (!HELIUS_API_KEY || HELIUS_API_KEY === '') {
      throw new Error('HELIUS_API_KEY is not configured');
    }

    let url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
    
    // Agregar parámetro de paginación si existe
    if (before) {
      url += `&before=${before}`;
    }
    
    console.log(`📡 Fetching from Helius: ${limit} txs${before ? ' (paginated)' : ''}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Helius API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const transactions: HeliusTransaction[] = await response.json();
    
    console.log(`   ✓ Received ${transactions.length} transactions from Helius`);
    
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
    console.error('❌ Error fetching transactions from Helius:', error);
    throw error;
  }
}

/**
 * Obtiene TODAS las transacciones de una wallet con paginación automática
 * NUEVO: Función mejorada que obtiene hasta 10,000 transacciones
 */
export async function getAllWalletTransactions(
  walletAddress: string,
  maxTransactions: number = 10000
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let attempts = 0;
  const maxAttempts = Math.ceil(maxTransactions / 100);

  console.log(`📊 Fetching ALL transactions for wallet ${walletAddress.slice(0, 8)}...`);
  console.log(`   Max transactions to fetch: ${maxTransactions}`);

  while (attempts < maxAttempts) {
    try {
      const batch = await getWalletTransactions(walletAddress, 100, before);
      
      if (batch.length === 0) {
        console.log(`   ℹ️ No more transactions available`);
        break;
      }

      allTransactions.push(...batch);
      console.log(`   📈 Total fetched: ${allTransactions.length}`);

      // Si recibimos menos de 100, significa que no hay más
      if (batch.length < 100) {
        console.log(`   ℹ️ Received less than 100 txs, no more pages`);
        break;
      }

      // Usar el signature de la última transacción para la siguiente página
      before = batch[batch.length - 1].signature;
      attempts++;

      // Pequeño delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));

      // Si ya alcanzamos el máximo, parar
      if (allTransactions.length >= maxTransactions) {
        console.log(`   ℹ️ Reached maximum of ${maxTransactions} transactions`);
        break;
      }
    } catch (error) {
      console.error(`❌ Error fetching batch ${attempts}:`, error);
      // Si hay error, retornar lo que tenemos hasta ahora
      break;
    }
  }

  console.log(`✅ Total transactions fetched: ${allTransactions.length}`);
  return allTransactions;
}

/**
 * Obtiene una conexión RPC a Solana via Helius
 */
export function getConnection(): Connection {
  return new Connection(HELIUS_RPC_URL, 'confirmed');
}
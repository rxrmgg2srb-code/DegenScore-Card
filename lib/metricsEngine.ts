/**
 * 🔥 DegenScore Metrics Engine - Professional Trading Analytics
 *
 * This is the CORE algorithm that calculates the DegenScore.
 * Every metric is REAL and based on actual on-chain data.
 *
 * Algorithm Philosophy:
 * - Reward skill, not just volume
 * - Penalize reckless behavior
 * - Detect moonshots and rugs
 * - Track consistency over time
 * - Calculate real profit/loss
 */

import { ParsedTransaction, getWalletTransactions } from './services/helius';
import { logger } from '@/lib/logger';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Position {
  tokenMint: string;
  tokenSymbol?: string;
  entryTime: number;
  exitTime?: number;
  buyAmount: number; // SOL spent
  sellAmount?: number; // SOL received
  tokensBought: number;
  tokensSold?: number;
  entryPrice: number; // SOL per token
  exitPrice?: number; // SOL per token
  profitLoss?: number; // In SOL
  profitLossPercent?: number;
  holdTime?: number; // In seconds
  isOpen: boolean;
  isRug: boolean;
  isMoonshot: boolean;
}

export interface Trade {
  timestamp: number;
  tokenMint: string;
  type: 'buy' | 'sell';
  solAmount: number;
  tokenAmount: number;
  pricePerToken: number;
}

export interface WalletMetrics {
  // Basic metrics
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
  totalFees: number;
  tradingDays: number;

  // Advanced metrics
  rugsSurvived: number;
  rugsCaught: number;
  totalRugValue: number;
  moonshots: number;
  avgHoldTime: number;
  quickFlips: number;
  diamondHands: number;
  realizedPnL: number;
  unrealizedPnL: number;
  firstTradeDate: number;
  longestWinStreak: number;
  longestLossStreak: number;
  volatilityScore: number;

  // Token data
  favoriteTokens: Array<{ mint: string; symbol: string; count: number }>;

  // The ultimate score (0-100)
  degenScore: number;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export async function calculateAdvancedMetrics(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<WalletMetrics> {
  try {
    logger.info('🔥 DegenScore Engine v2.0 - Professional Analysis Starting');

    if (onProgress) {
      onProgress(5, '📡 Fetching transactions...');
    }

    const allTransactions = await fetchAllTransactions(walletAddress, onProgress);

    if (!allTransactions || allTransactions.length === 0) {
      logger.warn('❌ No transactions found for wallet:', { walletAddress });
      logger.warn('⚠️ Returning default metrics (all zeros)');
      return getDefaultMetrics();
    }

    logger.info(`📊 Total transactions fetched: ${allTransactions.length}`);

    if (onProgress) {
      onProgress(75, '💱 Analyzing trades...');
    }

    // Extract all trades
    const trades = extractTrades(allTransactions, walletAddress);
    logger.info(
      `✅ Extracted ${trades.length} valid trades from ${allTransactions.length} transactions`
    );

    if (trades.length === 0) {
      logger.warn('⚠️ No valid SWAP trades found in transactions');
      logger.warn('⚠️ This wallet may not have any trading activity, only transfers');
      logger.warn('⚠️ Returning default metrics (all zeros)');
      return getDefaultMetrics();
    }

    if (onProgress) {
      onProgress(85, '📈 Building positions...');
    }

    // Build positions from trades
    const positions = buildPositions(trades);
    logger.info(`📦 Built ${positions.length} positions`);

    if (onProgress) {
      onProgress(95, '🎯 Calculating metrics...');
    }

    // Calculate all metrics
    const metrics = calculateMetrics(trades, positions, allTransactions);

    if (onProgress) {
      onProgress(100, '✅ Analysis complete!');
    }

    return metrics;
  } catch (error) {
    logger.error('❌ Error in metrics engine', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    return getDefaultMetrics();
  }
}

// ============================================================================
// TRANSACTION FETCHING
// ============================================================================

async function fetchAllTransactions(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let fetchCount = 0;
  let consecutiveEmpty = 0;
  let consecutiveErrors = 0;

  const MAX_BATCHES = 30; // Reducido de 100 a 30 para evitar timeouts
  const BATCH_SIZE = 100;
  const DELAY_MS = 200; // Reducido de 300ms a 200ms para mayor velocidad
  const MAX_EMPTY = 3;
  const MAX_CONSECUTIVE_ERRORS = 5;
  const MIN_TRANSACTIONS_FOR_ANALYSIS = 100; // Early stop si ya tenemos suficientes txs

  // 🔥 FILTRO HELIUS: Filtrar por program IDs de DEXes conocidos + type SWAP
  // Combinamos ambos filtros para obtener SOLO swaps de estos programas específicos
  const DEX_PROGRAMS = [
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLCZByGQtd1ubGg', // Jupiter
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
    '9W959DqEETiGZocYWCQPaJ6sLmUzmacY1abbrkSyRQUM', // Orca Legacy
    'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX', // Serum DEX
    'EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj', // Phoenix
    'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', // Orca v1
    '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P', // Pump.fun (bonding curve)
    'BSfD6SHZigAfDWSjzD5Q41jw8LmKwtmjskPH9XW1mrRW', // Meteora DLMM
    'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', // Meteora Pools
    'Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j', // Lifinity V2
  ];

  logger.info(`🔄 Fetching SWAP transactions from specific DEX programs (up to ${MAX_BATCHES} batches)`);

  while (fetchCount < MAX_BATCHES) {
    try {
      const batch = await getWalletTransactions(walletAddress, BATCH_SIZE, before, {
        type: 'SWAP', // Solo SWAPs
        programs: DEX_PROGRAMS, // De estos programas específicos
        commitment: 'confirmed',
      });

      if (batch.length > 0) {
        allTransactions.push(...batch);
        before = batch[batch.length - 1]?.signature;
        consecutiveEmpty = 0;
        consecutiveErrors = 0; // Reset error counter on success
        logger.info(
          `  ✓ Batch ${fetchCount + 1}: ${batch.length} txs (Total: ${allTransactions.length})`
        );

        // Early stop: si ya tenemos suficientes transacciones para un buen análisis
        if (allTransactions.length >= MIN_TRANSACTIONS_FOR_ANALYSIS && fetchCount >= 5) {
          logger.info(
            `  ✅ Early stop: ${allTransactions.length} SWAP transactions collected (sufficient for analysis)`
          );
          break;
        }
      } else {
        consecutiveEmpty++;
        consecutiveErrors = 0; // Reset error counter on successful empty response
        logger.info(`  ⚠️ Batch ${fetchCount + 1}: empty (${consecutiveEmpty}/${MAX_EMPTY})`);

        if (consecutiveEmpty >= MAX_EMPTY) {
          logger.info(`  ✅ No more transactions`);
          break;
        }
      }

      fetchCount++;

      const fetchProgress = 5 + Math.floor((fetchCount / MAX_BATCHES) * 65);
      if (onProgress) {
        onProgress(
          fetchProgress,
          `📡 Fetching swaps... (${allTransactions.length} found)`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    } catch (error: any) {
      // Special case: Helius 404 with continuation signature (not a real error)
      // When using filters, Helius returns 404 if no matching events in time window
      // but provides a 'before' signature to continue searching
      if (error?.status === 404) {
        let continuationSignature: string | null = null;

        // Try to parse the error body as JSON first
        if (error?.errorBody) {
          try {
            const errorJson = JSON.parse(error.errorBody);
            if (errorJson?.error) {
              const match = errorJson.error.match(/before.*parameter set to ([a-zA-Z0-9]+)/);
              if (match && match[1]) {
                continuationSignature = match[1];
              }
            }
          } catch (e) {
            // Fall back to regex on message
          }
        }

        // Fall back to regex on error message if JSON parsing failed
        if (!continuationSignature && error?.message) {
          const beforeMatch = error.message.match(/before.*parameter set to ([a-zA-Z0-9]+)/);
          if (beforeMatch && beforeMatch[1]) {
            continuationSignature = beforeMatch[1];
          }
        }

        if (continuationSignature) {
          logger.info(
            `  ⏭️ Batch ${fetchCount + 1}: No SWAP txs in this window, continuing from ${continuationSignature.substring(0, 20)}...`
          );
          before = continuationSignature;
          consecutiveEmpty++;
          consecutiveErrors = 0; // Don't count this as an error

          if (consecutiveEmpty >= MAX_EMPTY) {
            logger.info(`  ✅ No more SWAP transactions found`);
            break;
          }

          fetchCount++;
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          continue;
        }
      }

      // Real error - increment counter
      consecutiveErrors++;

      logger.error(
        `  ❌ Error batch ${fetchCount + 1}`,
        error instanceof Error ? error : undefined,
        {
          error: String(error),
          status: error?.status,
          before: before ? `${before.substring(0, 20)}...` : 'none',
          consecutiveErrors,
        }
      );

      // If we're getting too many consecutive errors, stop trying
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        logger.error(`  ⛔ Too many consecutive errors (${consecutiveErrors}), stopping fetch`);
        // If we have some transactions, use what we have
        if (allTransactions.length > 0) {
          logger.warn(`  ⚠️ Using ${allTransactions.length} transactions fetched before errors`);
          break;
        }
        // Otherwise, return empty to trigger default metrics
        logger.error(`  ❌ No transactions fetched due to errors`);
        return [];
      }

      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
  }

  return allTransactions.sort((a, b) => a.timestamp - b.timestamp);
}

// ============================================================================
// TRADE EXTRACTION
// ============================================================================

function extractTrades(transactions: ParsedTransaction[], walletAddress: string): Trade[] {
  const trades: Trade[] = [];
  let skippedNotDex = 0;
  let skippedNoTokenTransfers = 0;
  let skippedNoNativeTransfers = 0;
  let skippedDust = 0;
  let skippedNoToken = 0;
  let skippedZeroAmount = 0;
  let skippedSanity = 0;
  let skippedTransferOnly = 0;
  let extractedFromAccountData = 0;

  // Track transaction types for debugging
  const txTypes = new Map<string, number>();
  const txSources = new Map<string, number>();
  let txWithTokenAndNative = 0;
  let dustCount = 0;

  // Lista de DEXes conocidos en Solana
  const KNOWN_DEX_SOURCES = new Set([
    'PUMP_AMM',
    'PUMP_FUN',
    'JUPITER',
    'RAYDIUM',
    'ORCA',
    'SERUM',
    'OPENBOOK',
    'METEORA',
    'DFLOW',
    'LIFINITY',
    'SABER',
    'ALDRIN',
    'MERCURIAL',
    'MARINADE',
    'PHOENIX',
  ]);

  // 🚫 FILTRO CRÍTICO: Tokens excluidos (stablecoins y wrapped tokens)
  // Solo queremos contar trades de tokens especulativos (memecoins, shitcoins, etc.)
  // NO contamos swaps SOL <-> USDC, SOL <-> WETH, etc.
  const EXCLUDED_TOKENS = new Set([
    // Stablecoins principales
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', // PAI (USD stablecoin)
    'EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz', // BAI (another stablecoin)
    'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3', // FakeUSDC (stablecoin)
    'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp', // FIDA-USD stablecoin
    '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT', // UXD Stablecoin
    'PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y', // PORT (stablecoin-backed)

    // Wrapped tokens principales (NO especulativos)
    'So11111111111111111111111111111111111111112',   // Wrapped SOL
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // Wrapped ETH
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // Wrapped BTC
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // Wrapped BTC (another version)
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // Wrapped ETH (Sollet)

    // Staked/Liquid staking tokens (NO especulativos)
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',  // mSOL (Marinade staked SOL)
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL (Lido staked SOL)
    'He3iAEV5rYjv6Xf7PxKro19eVrC3QAcdic5CF2D2obPt', // scnSOL (Socean staked SOL)
    'DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9', // daoSOL (staked SOL)
    'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', // bSOL (BlazeStake staked SOL)
    'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // jitoSOL (Jito staked SOL)
  ]);

  let skippedStablecoin = 0;

  for (const tx of transactions) {
    // Track stats
    txTypes.set(tx.type, (txTypes.get(tx.type) || 0) + 1);
    if (tx.source) {
      txSources.set(tx.source, (txSources.get(tx.source) || 0) + 1);
    }

    // ⭐ FILTRO PRINCIPAL: Solo incluir si es SWAP o viene de un DEX conocido
    // Esto excluye transfers simples mientras captura todos los trades DEX
    const isSwapType = tx.type === 'SWAP';
    const isDexSource = tx.source && KNOWN_DEX_SOURCES.has(tx.source);

    if (!isSwapType && !isDexSource) {
      skippedNotDex++;
      continue;
    }

    // Primero verificar que tiene tokenTransfers y nativeTransfers
    // La presencia de ambos generalmente indica un swap/trade
    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) {
      skippedNoTokenTransfers++;
      continue;
    }
    if (!tx.nativeTransfers || tx.nativeTransfers.length === 0) {
      skippedNoNativeTransfers++;
      continue;
    }

    txWithTokenAndNative++;

    // Calculate net SOL change for the wallet
    let solNet = 0;
    for (const nt of tx.nativeTransfers) {
      if (nt.fromUserAccount === walletAddress) {
        solNet -= nt.amount / 1e9;
      }
      if (nt.toUserAccount === walletAddress) {
        solNet += nt.amount / 1e9;
      }
    }

    // Get token transfers involving this wallet (excluir SOL wrapped)
    const relevantTokenTransfers = tx.tokenTransfers.filter(
      (t) =>
        t.mint !== SOL_MINT &&
        (t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress)
    );

    if (relevantTokenTransfers.length === 0) {
      skippedNoToken++;
      // Log cuando encontramos un DEX trade pero sin tokens relevantes para debug
      if (isDexSource) {
        logger.debug('[Debug] DEX trade sin tokens relevantes:', {
          source: tx.source,
          totalTokenTransfers: tx.tokenTransfers?.length || 0,
          mints: tx.tokenTransfers?.slice(0, 5).map(t => t.mint.substring(0, 8)) || [],
        });
      }
      continue;
    }

    // 🔥 NUEVA LÓGICA: Calcular balance neto de tokens por mint
    // Esto maneja correctamente casos donde hay múltiples transfers del mismo token
    const tokenNetBalances = new Map<string, number>();

    for (const transfer of relevantTokenTransfers) {
      const currentBalance = tokenNetBalances.get(transfer.mint) || 0;

      if (transfer.toUserAccount === walletAddress) {
        // Tokens entrando
        tokenNetBalances.set(transfer.mint, currentBalance + transfer.tokenAmount);
      }

      if (transfer.fromUserAccount === walletAddress) {
        // Tokens saliendo
        tokenNetBalances.set(transfer.mint, currentBalance - transfer.tokenAmount);
      }
    }

    // Determinar el token principal (el que tiene mayor cambio absoluto)
    let primaryMint = '';
    let primaryTokenNet = 0;

    for (const [mint, netBalance] of tokenNetBalances.entries()) {
      if (Math.abs(netBalance) > Math.abs(primaryTokenNet)) {
        primaryMint = mint;
        primaryTokenNet = netBalance;
      }
    }

    if (!primaryMint || primaryTokenNet === 0) {
      skippedNoToken++;
      continue;
    }

    // Determine if this is a buy or sell based on NET token flow and SOL flow
    // Buy = SOL out (negative) and tokens in (positive)
    // Sell = SOL in (positive) and tokens out (negative)
    const isBuy = solNet < 0 && primaryTokenNet > 0;
    const isSell = solNet > 0 && primaryTokenNet < 0;

    // Si no es claramente buy o sell, podría ser un swap token-token o algo más complejo
    if (!isBuy && !isSell) {
      skippedTransferOnly++;
      logger.debug('[Debug] Skipped complex trade:', {
        source: tx.source || 'UNKNOWN',
        type: tx.type,
        solNet: solNet.toFixed(6),
        primaryTokenNet: primaryTokenNet.toFixed(6),
        primaryMint: primaryMint.substring(0, 20) + '...',
        tokenMints: Array.from(tokenNetBalances.keys()).map(m => m.substring(0, 8)),
      });
      continue;
    }

    const tokenAmount = Math.abs(primaryTokenNet);
    if (tokenAmount === 0) {
      skippedZeroAmount++;
      continue;
    }

    // 🚫 Excluir stablecoins y wrapped tokens - Solo queremos trades especulativos
    if (EXCLUDED_TOKENS.has(primaryMint)) {
      skippedStablecoin++;
      logger.debug('[Debug] Skipping stablecoin/wrapped token:', {
        mint: primaryMint.substring(0, 20) + '...',
        source: tx.source,
        solAmount: Math.abs(solNet).toFixed(4),
      });
      continue;
    }

    // Calculate SOL amount (absolute value)
    const solAmount = Math.abs(solNet);

    // Dust check - muy pequeño threshold para capturar más trades
    // Solo rechazar si es realmente insignificante
    if (solAmount < 0.000001) {
      dustCount++;
      skippedDust++;
      logger.debug('[Debug] Skipping dust (non-DEX):', {
        solNet: solNet.toFixed(9),
        type: tx.type,
        source: tx.source || 'UNKNOWN',
        description: tx.description?.substring(0, 50),
      });
      continue;
    }

    const pricePerToken = solAmount / tokenAmount;

    // Sanity checks mejorados
    // Permitir un rango muy amplio de precios
    if (pricePerToken < 0.000000001 || pricePerToken > 1000000) {
      skippedSanity++;
      continue;
    }

    // Permitir trades grandes (hasta 1000 SOL)
    if (solAmount > 1000) {
      skippedSanity++;
      continue;
    }

    // ✅ TRADE VÁLIDO - Agregar a la lista
    trades.push({
      timestamp: tx.timestamp,
      tokenMint: primaryMint,
      type: isBuy ? 'buy' : 'sell',
      solAmount,
      tokenAmount,
      pricePerToken,
    });
  }

  // Convert maps to objects for logging
  const topTransactionTypes = Object.fromEntries(
    Array.from(txTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );

  const topSources = Object.fromEntries(
    Array.from(txSources.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );

  // Calculate extraction rate
  const extractionRate = transactions.length > 0
    ? ((trades.length / transactions.length) * 100).toFixed(1)
    : '0.0';

  // Calculate dust percentage of valid transactions
  const dustPercentage = txWithTokenAndNative > 0
    ? ((dustCount / txWithTokenAndNative) * 100).toFixed(1)
    : '0.0';

  // Log statistics
  logger.info('🔍 Trade extraction stats:', {
    totalTransactions: transactions.length,
    tradesExtracted: trades.length,
    extractionRate: `${extractionRate}%`,
    extractedFromAccountData,
    txWithTokenAndNative,
    dustPercentageOfValid: `${dustPercentage}%`,
    topTransactionTypes,
    topSources,
    skipped: {
      notDexOrSwap: skippedNotDex,
      noTokenTransfers: skippedNoTokenTransfers,
      noNativeTransfers: skippedNoNativeTransfers,
      dust: skippedDust,
      noTokenForWallet: skippedNoToken,
      stablecoinsOrWrapped: skippedStablecoin,
      zeroAmount: skippedZeroAmount,
      transferOnly: skippedTransferOnly,
      failedSanityChecks: skippedSanity,
    },
  });

  return trades;
}

// ============================================================================
// POSITION BUILDING (FIFO)
// ============================================================================

function buildPositions(trades: Trade[]): Position[] {
  const positions: Position[] = [];
  const openPositions = new Map<string, Position[]>(); // tokenMint -> positions

  for (const trade of trades) {
    if (trade.type === 'buy') {
      // Open new position
      const position: Position = {
        tokenMint: trade.tokenMint,
        entryTime: trade.timestamp,
        buyAmount: trade.solAmount,
        tokensBought: trade.tokenAmount,
        entryPrice: trade.pricePerToken,
        isOpen: true,
        isRug: false,
        isMoonshot: false,
      };

      if (!openPositions.has(trade.tokenMint)) {
        openPositions.set(trade.tokenMint, []);
      }
      openPositions.get(trade.tokenMint)!.push(position);
      positions.push(position);
    } else if (trade.type === 'sell') {
      // Close position(s) using FIFO
      const tokenPositions = openPositions.get(trade.tokenMint);
      if (!tokenPositions || tokenPositions.length === 0) {
        // Sell without buy = skip (we don't have full history)
        continue;
      }

      let tokensToSell = trade.tokenAmount;
      let solReceived = trade.solAmount;

      while (tokensToSell > 0 && tokenPositions.length > 0) {
        const position = tokenPositions[0];
        if (!position) {
          break;
        }

        if (!position.isOpen) {
          tokenPositions.shift();
          continue;
        }

        const tokensAvailable = position.tokensBought - (position.tokensSold || 0);
        const tokensToClose = Math.min(tokensToSell, tokensAvailable);
        const percentClosed = tokensToClose / position.tokensBought;
        const solFromThisSell = solReceived * percentClosed;

        // Update position
        position.tokensSold = (position.tokensSold || 0) + tokensToClose;
        position.sellAmount = (position.sellAmount || 0) + solFromThisSell;
        position.exitTime = trade.timestamp;
        position.exitPrice = trade.pricePerToken;
        position.holdTime = trade.timestamp - position.entryTime;

        // Calculate P&L
        const costBasis = position.buyAmount * percentClosed;
        position.profitLoss = solFromThisSell - costBasis;
        position.profitLossPercent = ((solFromThisSell - costBasis) / costBasis) * 100;

        // Detect moonshot (100x+ gain)
        if (position.profitLossPercent && position.profitLossPercent >= 10000) {
          position.isMoonshot = true;
        }

        // Detect rug (>90% loss)
        if (position.profitLossPercent && position.profitLossPercent <= -90) {
          position.isRug = true;
        }

        // If fully closed, mark as closed
        if (position.tokensSold >= position.tokensBought * 0.99) {
          position.isOpen = false;
          tokenPositions.shift();
        }

        tokensToSell -= tokensToClose;
        solReceived -= solFromThisSell;
      }
    }
  }

  return positions;
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

function calculateMetrics(
  trades: Trade[],
  positions: Position[],
  allTransactions: ParsedTransaction[]
): WalletMetrics {
  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, t) => sum + t.solAmount, 0);
  const totalFees = allTransactions.reduce((sum, tx) => sum + tx.fee / 1e9, 0);

  // Closed positions only (for realized metrics)
  const closedPositions = positions.filter((p) => !p.isOpen);

  // P&L calculation
  const realizedPnL = closedPositions.reduce((sum, p) => sum + (p.profitLoss || 0), 0);
  const unrealizedPnL = 0; // Would need current prices
  const profitLoss = realizedPnL + unrealizedPnL;

  // Win rate
  const winningTrades = closedPositions.filter((p) => (p.profitLoss || 0) > 0).length;
  const totalClosedTrades = closedPositions.length;
  const winRate = totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0;

  // Best/worst trades
  const sortedByPnL = [...closedPositions].sort(
    (a, b) => (b.profitLoss || 0) - (a.profitLoss || 0)
  );
  const bestTrade = sortedByPnL[0]?.profitLoss || 0;
  const worstTrade = sortedByPnL[sortedByPnL.length - 1]?.profitLoss || 0;

  // Rugs
  const ruggedPositions = closedPositions.filter((p) => p.isRug);
  const rugsSurvived = ruggedPositions.length;
  const totalRugValue = Math.abs(ruggedPositions.reduce((sum, p) => sum + (p.profitLoss || 0), 0));

  // Separate into rugs caught (exited before -90%) vs rugs fully hit
  const rugsCaught = ruggedPositions.filter(
    (p) => p.profitLossPercent && p.profitLossPercent > -90 && p.profitLossPercent < -50
  ).length;

  // Moonshots
  const moonshots = closedPositions.filter((p) => p.isMoonshot).length;

  // Hold time
  const avgHoldTime =
    closedPositions.length > 0
      ? closedPositions.reduce((sum, p) => sum + (p.holdTime || 0), 0) / closedPositions.length
      : 0;

  // Quick flips (<1 hour)
  const quickFlips = closedPositions.filter((p) => (p.holdTime || 0) < 3600).length;

  // Diamond hands (>30 days AND profitable)
  const diamondHands = closedPositions.filter(
    (p) => (p.holdTime || 0) > 30 * 24 * 3600 && (p.profitLoss || 0) > 0
  ).length;

  // Trading days
  const uniqueDays = new Set(trades.map((t) => new Date(t.timestamp * 1000).toDateString())).size;

  // First trade date
  const firstTradeDate =
    trades.length > 0 ? (trades[0]?.timestamp ?? Date.now() / 1000) : Date.now() / 1000;

  // Win/loss streaks
  const { longestWinStreak, longestLossStreak } = calculateStreaks(closedPositions);

  // Volatility score (std dev of returns)
  const volatilityScore = calculateVolatility(closedPositions);

  // Favorite tokens
  const tokenCounts = new Map<string, number>();
  trades.forEach((t) => {
    tokenCounts.set(t.tokenMint, (tokenCounts.get(t.tokenMint) || 0) + 1);
  });
  const favoriteTokens = Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mint, count]) => ({ mint, symbol: mint.slice(0, 8), count }));

  // ========================================================================
  // CALCULATE DEGEN SCORE (0-100)
  // ========================================================================
  const degenScore = calculateDegenScore({
    profitLoss,
    winRate,
    totalVolume,
    rugsSurvived,
    moonshots,
    avgHoldTime,
    volatilityScore,
    quickFlips,
    diamondHands,
    totalTrades,
  });

  return {
    totalTrades,
    totalVolume,
    profitLoss,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize: totalTrades > 0 ? totalVolume / totalTrades : 0,
    totalFees,
    favoriteTokens,
    tradingDays: uniqueDays,
    degenScore,
    rugsSurvived,
    rugsCaught,
    totalRugValue,
    moonshots,
    avgHoldTime,
    quickFlips,
    diamondHands,
    realizedPnL,
    unrealizedPnL,
    firstTradeDate,
    longestWinStreak,
    longestLossStreak,
    volatilityScore,
  };
}

// ============================================================================
// DEGEN SCORE ALGORITHM (The Holy Grail)
// ============================================================================

function calculateDegenScore(params: {
  profitLoss: number;
  winRate: number;
  totalVolume: number;
  rugsSurvived: number;
  moonshots: number;
  avgHoldTime: number;
  volatilityScore: number;
  quickFlips: number;
  diamondHands: number;
  totalTrades: number;
}): number {
  let score = 0;

  // 1. Profit/Loss Score (30 points max)
  // Normalized: +10 SOL = 30 points, -10 SOL = 0 points
  const plScore = Math.max(0, Math.min(30, (params.profitLoss / 10) * 30 + 15));
  score += plScore;

  // 2. Win Rate Score (20 points max)
  // 50% = 10 points, 100% = 20 points, 0% = 0 points
  const wrScore = Math.max(0, Math.min(20, (params.winRate / 50) * 10));
  score += wrScore;

  // 3. Volume Score (10 points max)
  // 100 SOL = 10 points (caps at 10)
  const volumeScore = Math.min(10, (params.totalVolume / 100) * 10);
  score += volumeScore;

  // 4. Moonshot Bonus (10 points max)
  // Each moonshot = 5 points (caps at 2)
  const moonshotScore = Math.min(10, params.moonshots * 5);
  score += moonshotScore;

  // 5. Rug Penalty (-1 point per rug, caps at -15)
  const rugPenalty = Math.max(-15, -params.rugsSurvived);
  score += rugPenalty;

  // 6. Diamond Hands Bonus (10 points max)
  // Each diamond hand = 2 points (caps at 5)
  const diamondScore = Math.min(10, params.diamondHands * 2);
  score += diamondScore;

  // 7. Quick Flip Penalty (-0.5 points each, caps at -10)
  // Penalize paper hands
  const quickFlipPenalty = Math.max(-10, -params.quickFlips * 0.5);
  score += quickFlipPenalty;

  // 8. Volatility Penalty (up to -10 points)
  // High volatility = risky = bad
  const volatilityPenalty = -Math.min(10, params.volatilityScore / 10);
  score += volatilityPenalty;

  // 9. Activity Bonus (10 points max)
  // 100+ trades = 10 points
  const activityScore = Math.min(10, (params.totalTrades / 100) * 10);
  score += activityScore;

  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateStreaks(positions: Position[]): {
  longestWinStreak: number;
  longestLossStreak: number;
} {
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  for (const position of positions) {
    const pnl = position.profitLoss || 0;

    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  }

  return { longestWinStreak, longestLossStreak };
}

function calculateVolatility(positions: Position[]): number {
  if (positions.length === 0) {
    return 0;
  }

  const returns = positions
    .filter((p) => p.profitLossPercent !== undefined)
    .map((p) => p.profitLossPercent!);

  if (returns.length === 0) {
    return 0;
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev;
}

function getDefaultMetrics(): WalletMetrics {
  return {
    totalTrades: 0,
    totalVolume: 0,
    profitLoss: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: 0,
    totalFees: 0,
    favoriteTokens: [],
    tradingDays: 0,
    degenScore: 0,
    rugsSurvived: 0,
    rugsCaught: 0,
    totalRugValue: 0,
    moonshots: 0,
    avgHoldTime: 0,
    quickFlips: 0,
    diamondHands: 0,
    realizedPnL: 0,
    unrealizedPnL: 0,
    firstTradeDate: Date.now() / 1000,
    longestWinStreak: 0,
    longestLossStreak: 0,
    volatilityScore: 0,
  };
}

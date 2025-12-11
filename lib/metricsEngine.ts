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

  // Enhanced P&L metrics (new)
  totalExpenses?: number; // Total SOL spent on buys
  totalIncome?: number; // Total SOL received from sells
  netBalance?: number; // Income - Expenses
  netBalanceAfterFees?: number; // Net after fees
  topGainers?: Array<{ mint: string; pnl: number; roi: number }>;
  topLosers?: Array<{ mint: string; pnl: number; roi: number }>;

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
  const seenSignatures = new Set<string>();

  const BATCH_SIZE = 100;
  const DELAY_MS = 50;
  const MAX_CONSECUTIVE_ERRORS = 5;
  const TIME_LIMIT_MS = 55000;
  const startTime = Date.now();
  const TWELVE_MONTHS_AGO = Date.now() / 1000 - (365 * 24 * 60 * 60);

  // 🔥 ESTRATEGIA HÍBRIDA:
  // 1. Primero fetch SWAP transactions (máximo 500) - estos son los trades
  // 2. Luego fetch transacciones regulares (máximo 3000) para complementar
  // Esto asegura que wallets con mucho spam no pierdan sus trades

  logger.info(`🔄 Fetching wallet transactions with HYBRID strategy`);

  // ========== FASE 1: Fetch SWAPs ===========
  if (onProgress) {
    onProgress(5, '📡 Fetching SWAP transactions...');
  }

  let swapBefore: string | undefined;
  let swapCount = 0;
  let consecutiveErrors = 0;

  for (let batch = 0; batch < 10; batch++) { // Max 1000 SWAPs
    if (Date.now() - startTime > TIME_LIMIT_MS / 2) break;

    try {
      const swaps = await getWalletTransactions(walletAddress, BATCH_SIZE, swapBefore, 'SWAP');

      if (swaps.length === 0) break;

      for (const tx of swaps) {
        if (!seenSignatures.has(tx.signature) && tx.timestamp >= TWELVE_MONTHS_AGO) {
          seenSignatures.add(tx.signature);
          allTransactions.push(tx);
          swapCount++;
        }
      }

      swapBefore = swaps[swaps.length - 1]?.signature;
      consecutiveErrors = 0;

      logger.info(`  ✓ SWAP batch ${batch + 1}: ${swaps.length} (Total SWAPs: ${swapCount})`);

      if (swaps.length < BATCH_SIZE) break; // No more SWAPs

      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (error: any) {
      consecutiveErrors++;
      if (consecutiveErrors >= 3) break;
      if (error?.status === 404) break; // No more pagination
      await new Promise(r => setTimeout(r, 200));
    }
  }

  logger.info(`📊 Phase 1 complete: ${swapCount} SWAP transactions found`);

  // ========== FASE 2: Fetch transacciones regulares ===========
  if (onProgress) {
    onProgress(35, `📡 Fetching regular transactions... (${swapCount} SWAPs found)`);
  }

  let regularBefore: string | undefined;
  let regularCount = 0;
  consecutiveErrors = 0;
  const MAX_REGULAR = 5000; // Aumentado para cubrir más historial

  for (let batch = 0; batch < 50; batch++) { // Max 5000 regular
    if (Date.now() - startTime > TIME_LIMIT_MS) {
      logger.warn(`⚠️ Time limit reached. Stopping fetch.`);
      break;
    }

    if (regularCount >= MAX_REGULAR) {
      logger.info(`  ✅ Regular transaction limit reached (${MAX_REGULAR})`);
      break;
    }

    try {
      const txs = await getWalletTransactions(walletAddress, BATCH_SIZE, regularBefore);

      if (txs.length === 0) break;

      // Check 12-month limit
      const oldestTxTimestamp = txs[txs.length - 1]?.timestamp;
      if (oldestTxTimestamp && oldestTxTimestamp < TWELVE_MONTHS_AGO) {
        const recentTxs = txs.filter(tx => tx.timestamp >= TWELVE_MONTHS_AGO);
        for (const tx of recentTxs) {
          if (!seenSignatures.has(tx.signature)) {
            seenSignatures.add(tx.signature);
            allTransactions.push(tx);
            regularCount++;
          }
        }
        logger.info(`  ⏱️ Reached 12-month limit`);
        break;
      }

      for (const tx of txs) {
        if (!seenSignatures.has(tx.signature)) {
          seenSignatures.add(tx.signature);
          allTransactions.push(tx);
          regularCount++;
        }
      }

      regularBefore = txs[txs.length - 1]?.signature;
      consecutiveErrors = 0;

      if (batch % 10 === 0) {
        logger.info(`  ✓ Regular batch ${batch + 1}: ${txs.length} (Total: ${allTransactions.length})`);
      }

      // Progress update
      if (onProgress) {
        const progress = 35 + Math.min(35, Math.floor((regularCount / MAX_REGULAR) * 35));
        onProgress(progress, `📡 Fetching history... (${allTransactions.length} txs)`);
      }

      await new Promise(r => setTimeout(r, DELAY_MS / 5)); // Faster for regulars
    } catch (error: any) {
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        logger.error(`⛔ Too many errors, stopping fetch`);
        break;
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  logger.info(`📊 Fetch complete: ${allTransactions.length} total (${swapCount} SWAPs + ${regularCount} regular)`);

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

  // 🚫 Tokens excluidos: Solo stablecoins y wrapped tokens
  // Queremos contar TODOS los tokens especulativos (memecoins, shitcoins, etc.)
  const EXCLUDED_TOKENS = new Set([
    // Stablecoins
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', // PAI (USD stablecoin)
    'EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz', // BAI (another stablecoin)
    'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3', // FakeUSDC (stablecoin)

    // Wrapped tokens principales
    'So11111111111111111111111111111111111111112',   // Wrapped SOL
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // Wrapped ETH
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // Wrapped BTC
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // Wrapped BTC (another version)
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // Wrapped ETH (Sollet)

    // Staked/Liquid staking tokens
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',  // mSOL (Marinade staked SOL)
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL (Lido staked SOL)
    'He3iAEV5rYjv6Xf7PxKro19eVrC3QAcdic5CF2D2obPt', // scnSOL (Socean staked SOL)
    'DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9', // daoSOL (staked SOL)
  ]);

  let skippedStablecoin = 0;

  for (const tx of transactions) {
    // Track stats
    txTypes.set(tx.type, (txTypes.get(tx.type) || 0) + 1);
    if (tx.source) {
      txSources.set(tx.source, (txSources.get(tx.source) || 0) + 1);
    }

    // ⭐ FILTRO: Excluir BURN - no son ventas reales
    if (tx.type === 'BURN') {
      skippedNotDex++;
      continue;
    }

    // ⭐ NUEVO FILTRO: Aceptar cualquier transacción con tokenTransfers + nativeTransfers
    // La lógica posterior determinará si es un trade válido
    // Esto captura trades que no están marcados como "SWAP" o de un DEX conocido

    // Primero verificar que tiene tokenTransfers
    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) {
      skippedNoTokenTransfers++;
      continue;
    }

    // 🔥 FIX: Muchos DEXs (Jupiter, Raydium) usan WSOL sin nativeTransfers directos
    // Verificar si hay WSOL en tokenTransfers como indicador de swap
    const WSOL_MINT = 'So11111111111111111111111111111111111111112';
    const hasWsolInTransfers = tx.tokenTransfers.some(t => t.mint === WSOL_MINT);

    // Permitir transacciones con nativeTransfers O con WSOL en tokenTransfers
    const hasNativeTransfers = tx.nativeTransfers && tx.nativeTransfers.length > 0;
    if (!hasNativeTransfers && !hasWsolInTransfers) {
      skippedNoNativeTransfers++;
      continue;
    }

    txWithTokenAndNative++;

    // Calculate net SOL change for the wallet
    // MEJORADO: Intentar usar accountData primero para mayor precisión
    let solNet = 0;

    // Try using accountData for more accurate values (includes actual swap amounts)
    if (tx.accountData && tx.accountData.length > 0) {
      const walletAccountData = tx.accountData.find((acc: any) => acc.account === walletAddress);
      if (walletAccountData && walletAccountData.nativeBalanceChange) {
        solNet = walletAccountData.nativeBalanceChange / 1e9;
      }
    }

    // Fallback to nativeTransfers if accountData not available or didn't provide a change
    if (solNet === 0 && tx.nativeTransfers) {
      for (const nt of tx.nativeTransfers) {
        if (nt.fromUserAccount === walletAddress) {
          solNet -= nt.amount / 1e9;
        }
        if (nt.toUserAccount === walletAddress) {
          solNet += nt.amount / 1e9;
        }
      }
    }

    // Get token transfers involving this wallet
    // NOTE: We now INCLUDE WSOL here because we handle it separately later
    const relevantTokenTransfers = tx.tokenTransfers.filter(
      (t) => (t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress)
    );

    if (relevantTokenTransfers.length === 0) {
      skippedNoToken++;
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

    // Combine Native SOL + WSOL for effective SOL flow
    // WSOL_MINT ya está definido arriba

    let wsolNet = 0;
    if (tokenNetBalances.has(WSOL_MINT)) {
      wsolNet = tokenNetBalances.get(WSOL_MINT) || 0;
      if (wsolNet !== 0) {
        logger.info('🔥 WSOL DETECTED!', {
          wsolNet: wsolNet.toFixed(6),
          solNet: solNet.toFixed(6),
          signature: tx.signature?.substring(0, 12)
        });
      }
      // Remove WSOL from token balances so it's not treated as the traded token
      tokenNetBalances.delete(WSOL_MINT);
    }

    // Effective SOL = Native SOL + Wrapped SOL + Stablecoins (converted)
    // TODO: Add stablecoin support if needed, but user confirmed only SOL trades
    const effectiveSolNet = solNet + wsolNet;

    // Get primary mint (excluding WSOL which is now part of SOL flow)
    let primaryMint = '';
    let primaryTokenNet = 0;

    for (const [mint, netBalance] of tokenNetBalances.entries()) {
      // Skip excluded tokens (stablecoins, etc) from being the primary traded token
      if (EXCLUDED_TOKENS.has(mint)) continue;

      if (Math.abs(netBalance) > Math.abs(primaryTokenNet)) {
        primaryMint = mint;
        primaryTokenNet = netBalance;
      }
    }

    if (!primaryMint || primaryTokenNet === 0) {
      skippedNoToken++;
      continue;
    }

    // Determine if this is a buy or sell based on NET token flow and EFFECTIVE SOL flow
    // Buy = SOL out (negative) and tokens in (positive)
    // Sell = SOL in (positive) and tokens out (negative)

    // Tolerancia para casos edge
    const TOLERANCE = 0.0001;

    let isBuy = effectiveSolNet < -TOLERANCE && primaryTokenNet > 0;
    let isSell = effectiveSolNet > TOLERANCE && primaryTokenNet < 0;

    // 🔥 FIX: Ser más permisivo con la detección de trades
    const hasSignificantTokenFlow = Math.abs(primaryTokenNet) > 1; // Al menos 1 token
    const hasSignificantSolFlow = Math.abs(effectiveSolNet) > 0.001; // Al menos 0.001 SOL

    // Si no podemos determinar claramente el tipo por SOL flow
    if (!isBuy && !isSell && hasSignificantTokenFlow) {
      // Estrategia 1: Inferir del tipo de transacción
      const isSwapType = tx.type === 'SWAP' || tx.type === 'SWAP_AGGREGATOR' ||
        tx.source === 'JUPITER' || tx.source === 'RAYDIUM';

      // Estrategia 2: Inferir del flujo de tokens cuando hay WSOL pero no solNet claro
      const hasWsolFlow = Math.abs(wsolNet) > 0.001;

      if (isSwapType || hasWsolFlow || hasSignificantSolFlow) {
        // Inferir del flujo de tokens: tokens entrando = compra, saliendo = venta
        const inferredBuy = primaryTokenNet > 0;
        const inferredSell = primaryTokenNet < 0;

        if (inferredBuy || inferredSell) {
          logger.debug('[Debug] Inferred trade from token flow:', {
            type: inferredBuy ? 'buy' : 'sell',
            solNet: effectiveSolNet.toFixed(6),
            wsolNet: wsolNet.toFixed(6),
            tokenNet: primaryTokenNet.toFixed(6),
            mint: primaryMint.substring(0, 12),
            source: tx.source || tx.type,
          });

          isBuy = inferredBuy;
          isSell = inferredSell;
        }
      }
    }

    // Si aún no podemos clasificar, skip
    if (!isBuy && !isSell) {
      skippedTransferOnly++;
      continue;
    }

    const tokenAmount = Math.abs(primaryTokenNet);



    // Calculate SOL amount (absolute value of EFFECTIVE SOL)
    const solAmount = Math.abs(effectiveSolNet);

    // Dust check - filtrar trades muy pequeños que distorsionan P&L
    // 0.001 SOL = ~$0.13 USD es el mínimo razonable para un trade real
    if (solAmount < 0.001) {
      dustCount++;
      skippedDust++;
      logger.debug('[Debug] Skipping dust trade:', {
        solAmount: solAmount.toFixed(9),
        tokenMint: primaryMint.substring(0, 12),
        type: isBuy ? 'buy' : 'sell',
        source: tx.source || 'UNKNOWN',
      });
      continue;
    }

    const pricePerToken = solAmount / tokenAmount;

    // Sanity checks mejorados y relajados
    // Permitir un rango muy amplio de precios para memecoins con muchos ceros
    if (pricePerToken < 0.000000000000001 || pricePerToken > 10000000) {
      skippedSanity++;
      continue;
    }

    // Permitir trades grandes (hasta 10,000 SOL para ballenas)
    if (solAmount > 10000) {
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
  } // End of transaction loop

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
      const totalSolReceived = trade.solAmount;

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

        // 🔥 FIX: Distribuir SOL proporcionalmente basado en tokens vendidos
        // solFromThisSell = (tokens vendidos de esta posición / total tokens en venta) * total SOL recibido
        const solFromThisSell = (tokensToClose / trade.tokenAmount) * totalSolReceived;

        // Update position
        position.tokensSold = (position.tokensSold || 0) + tokensToClose;
        position.sellAmount = (position.sellAmount || 0) + solFromThisSell;
        position.exitTime = trade.timestamp;
        position.exitPrice = trade.pricePerToken;
        position.holdTime = trade.timestamp - position.entryTime;

        // Calculate P&L
        // costBasis = costo proporcional de los tokens que estamos cerrando
        const percentOfPositionClosed = tokensToClose / position.tokensBought;
        const costBasis = position.buyAmount * percentOfPositionClosed;
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

  // P&L calculation (Cash Flow Method)
  // This is more accurate for total wallet P&L as it includes all inflows/outflows
  const totalSolSpent = trades.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.solAmount, 0);
  const totalSolReceived = trades.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.solAmount, 0);

  // Realized PnL based on Cash Flow
  const realizedPnL = totalSolReceived - totalSolSpent;
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
    trades.length > 0
      ? Math.min(...trades.map((t) => t.timestamp))
      : Date.now() / 1000;

  // Streaks
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  for (const pos of closedPositions.sort((a, b) => a.exitTime! - b.exitTime!)) {
    if ((pos.profitLoss || 0) > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }
  }

  // Volatility Score (0-100)
  // Based on variance of P&L %
  const pnlPercents = closedPositions.map((p) => p.profitLossPercent || 0);
  const avgPnlPercent =
    pnlPercents.length > 0
      ? pnlPercents.reduce((sum, p) => sum + p, 0) / pnlPercents.length
      : 0;
  const variance =
    pnlPercents.length > 0
      ? pnlPercents.reduce((sum, p) => sum + Math.pow(p - avgPnlPercent, 2), 0) /
      pnlPercents.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = Math.min(100, Math.max(0, stdDev / 10)); // Normalize somewhat arbitrary

  // Favorite Tokens
  const tokenCounts = new Map<string, number>();
  const tokenSymbols = new Map<string, string>();

  for (const t of trades) {
    tokenCounts.set(t.tokenMint, (tokenCounts.get(t.tokenMint) || 0) + 1);
    // We don't have symbols here yet, would need metadata fetch
    // For now, use mint as symbol fallback
    if (!tokenSymbols.has(t.tokenMint)) {
      tokenSymbols.set(t.tokenMint, t.tokenMint.substring(0, 4));
    }
  }

  const favoriteTokens = Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mint, count]) => ({
      mint,
      symbol: tokenSymbols.get(mint) || 'UNK',
      count,
    }));

  // Enhanced P&L metrics
  const topGainers = closedPositions
    .filter(p => (p.profitLoss || 0) > 0)
    .sort((a, b) => (b.profitLoss || 0) - (a.profitLoss || 0))
    .slice(0, 5)
    .map(p => ({
      mint: p.tokenMint,
      pnl: p.profitLoss || 0,
      roi: p.profitLossPercent || 0
    }));

  const topLosers = closedPositions
    .filter(p => (p.profitLoss || 0) < 0)
    .sort((a, b) => (a.profitLoss || 0) - (b.profitLoss || 0))
    .slice(0, 5)
    .map(p => ({
      mint: p.tokenMint,
      pnl: p.profitLoss || 0,
      roi: p.profitLossPercent || 0
    }));

  // Calculate DegenScore (0-100)
  // This is a proprietary formula based on the metrics above
  let score = 50; // Base score

  // 1. Profitability (+/- 20)
  if (winRate > 60) score += 10;
  if (winRate > 70) score += 10;
  if (winRate < 40) score -= 10;
  if (winRate < 30) score -= 10;

  // 2. P&L (+/- 20)
  if (profitLoss > 10) score += 10; // > 10 SOL profit
  if (profitLoss > 100) score += 10; // > 100 SOL profit
  if (profitLoss < -10) score -= 10;
  if (profitLoss < -50) score -= 10;

  // 3. Experience (+/- 10)
  if (totalTrades > 100) score += 5;
  if (totalTrades > 1000) score += 5;
  if (totalTrades < 10) score -= 5;

  // 4. Diamond Hands (+/- 10)
  if (diamondHands > 0) score += 5;
  if (diamondHands > 5) score += 5;
  if (quickFlips > totalClosedTrades * 0.8) score -= 5; // Too many quick flips

  // 5. Rug Resilience (+/- 10)
  if (rugsCaught > 0) score += 5; // Smart enough to exit
  if (rugsSurvived > 5) score -= 5; // Getting rugged too often

  // 6. Moonshots (+/- 10)
  if (moonshots > 0) score += 10;

  // Clamp score
  score = Math.max(1, Math.min(100, score));

  return {
    totalTrades,
    totalVolume,
    profitLoss,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize: totalVolume / totalTrades || 0,
    totalFees,
    tradingDays: uniqueDays,

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
    longestWinStreak: maxWinStreak,
    longestLossStreak: maxLossStreak,
    volatilityScore,

    favoriteTokens,
    degenScore: Math.round(score),

    // New fields
    totalExpenses: totalSolSpent,
    totalIncome: totalSolReceived,
    netBalance: profitLoss,
    netBalanceAfterFees: profitLoss - totalFees,
    topGainers,
    topLosers
  };
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
    tradingDays: 0,
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
    favoriteTokens: [],
    degenScore: 0,
  };
}

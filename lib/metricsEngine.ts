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
import { getAllSwapActivities, SolscanDefiActivity } from './services/solscan';
import { logger } from '@/lib/logger';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const WSOL_MINT = 'So11111111111111111111111111111111111111112'; // Wrapped SOL

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
    logger.info('🔥 DegenScore Engine v3.0 - Solscan DeFi Activities');

    if (onProgress) {
      onProgress(5, '📡 Fetching DeFi activities...');
    }

    // Try Solscan first (cleaner, more accurate data)
    let trades = await fetchTradesFromSolscan(walletAddress, onProgress);

    // Fallback to Helius if Solscan returns no data
    if (trades.length === 0) {
      logger.warn('⚠️ No trades from Solscan, falling back to Helius transaction parsing...');

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

      // Extract all trades from Helius transactions
      trades = extractTrades(allTransactions, walletAddress);
      logger.info(
        `✅ Extracted ${trades.length} valid trades from ${allTransactions.length} transactions`
      );

      if (trades.length === 0) {
        logger.warn('⚠️ No valid SWAP trades found in transactions');
        logger.warn('⚠️ This wallet may not have any trading activity, only transfers');
        logger.warn('⚠️ Returning default metrics (all zeros)');
        return getDefaultMetrics();
      }
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

    // Calculate all metrics (note: for Solscan path, we use empty array for transactions)
    const metrics = calculateMetrics(trades, positions, []);

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

  const MAX_BATCHES = 100; // Reducido de 100 a 30 para evitar timeouts
  const BATCH_SIZE = 100;
  const DELAY_MS = 300; // Reducido de 100ms a 50ms para ser más rápido
  const MAX_EMPTY = 3;
  const MAX_CONSECUTIVE_ERRORS = 5; // Stop if we get 5 errors in a row

  logger.info(`🔄 Fetching up to ${MAX_BATCHES} batches (${BATCH_SIZE} each)`);

  while (fetchCount < MAX_BATCHES) {
    try {
      const batch = await getWalletTransactions(walletAddress, BATCH_SIZE, before);

      if (batch.length > 0) {
        allTransactions.push(...batch);
        before = batch[batch.length - 1]?.signature;
        consecutiveEmpty = 0;
        consecutiveErrors = 0; // Reset error counter on success
        logger.info(
          `  ✓ Batch ${fetchCount + 1}: ${batch.length} txs (Total: ${allTransactions.length})`
        );
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
          `📡 Batch ${fetchCount}/${MAX_BATCHES}... (${allTransactions.length} txs)`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    } catch (error: any) {
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
// SOLSCAN DEFI ACTIVITIES EXTRACTION
// ============================================================================

/**
 * Fetch trades from Solscan DeFi Activities API
 * This provides clean, structured swap data instead of parsing raw transactions
 */
async function fetchTradesFromSolscan(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Trade[]> {
  try {
    logger.info('🔥 Fetching DeFi activities from Solscan...');

    if (onProgress) {
      onProgress(10, '📡 Fetching DeFi activities...');
    }

    // Fetch all swap activities (up to 10 pages = 400 swaps)
    const activities = await getAllSwapActivities(walletAddress, 10);

    if (!activities || activities.length === 0) {
      logger.warn('❌ No DeFi activities found from Solscan');
      return [];
    }

    logger.info(`📊 Fetched ${activities.length} DeFi activities from Solscan`);

    if (onProgress) {
      onProgress(50, '💱 Parsing swap data...');
    }

    // Extract trades from activities
    const trades = extractTradesFromSolscan(activities, walletAddress);

    logger.info(`✅ Extracted ${trades.length} trades from Solscan DeFi activities`);

    return trades;
  } catch (error) {
    logger.error('❌ Error fetching from Solscan:', error instanceof Error ? error : undefined, {
      error: String(error),
    });
    return [];
  }
}

/**
 * Extract trades from Solscan DeFi Activities
 */
function extractTradesFromSolscan(
  activities: SolscanDefiActivity[],
  _walletAddress: string
): Trade[] {
  const trades: Trade[] = [];

  for (const activity of activities) {
    if (!activity.routers || activity.routers.length === 0) {
      continue;
    }

    // Process each router in the swap
    for (const router of activity.routers) {
      const fromToken = router.from_token;
      const toToken = router.to_token;
      const fromAmount = router.from_amount;
      const toAmount = router.to_amount;

      // Determine if this is a buy or sell based on SOL/WSOL involvement
      const fromIsSol = fromToken.address === SOL_MINT || fromToken.address === WSOL_MINT;
      const toIsSol = toToken.address === SOL_MINT || toToken.address === WSOL_MINT;

      let trade: Trade | null = null;

      if (fromIsSol && !toIsSol) {
        // SOL -> Token = BUY
        trade = {
          timestamp: activity.time,
          tokenMint: toToken.address,
          type: 'buy',
          solAmount: fromAmount / Math.pow(10, fromToken.decimals),
          tokenAmount: toAmount / Math.pow(10, toToken.decimals),
          pricePerToken: 0, // Will calculate below
        };
      } else if (!fromIsSol && toIsSol) {
        // Token -> SOL = SELL
        trade = {
          timestamp: activity.time,
          tokenMint: fromToken.address,
          type: 'sell',
          solAmount: toAmount / Math.pow(10, toToken.decimals),
          tokenAmount: fromAmount / Math.pow(10, fromToken.decimals),
          pricePerToken: 0, // Will calculate below
        };
      }

      if (trade) {
        // Calculate price per token
        if (trade.tokenAmount > 0) {
          trade.pricePerToken = trade.solAmount / trade.tokenAmount;
        }

        // Basic validation
        if (trade.solAmount > 0 && trade.tokenAmount > 0 && trade.pricePerToken > 0) {
          trades.push(trade);
        }
      }
    }
  }

  return trades;
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

    // Determine if this is a buy or sell based on direction of token flow
    // Buy = tokens come IN to wallet
    // Sell = tokens go OUT of wallet
    const tokensIn = relevantTokenTransfers.filter((t) => t.toUserAccount === walletAddress);
    const tokensOut = relevantTokenTransfers.filter((t) => t.fromUserAccount === walletAddress);

    const isBuy = tokensIn.length > 0 && tokensOut.length === 0;
    const isSell = tokensOut.length > 0 && tokensIn.length === 0;

    // Si no es claramente buy o sell, podría ser un trade complejo, skip por ahora
    if (!isBuy && !isSell) {
      // Podría ser un swap token-token o algo más complejo
      skippedTransferOnly++;
      logger.debug('[Debug] Skipped transferOnly:', {
        source: tx.source || 'UNKNOWN',
        type: tx.type,
        isBuy,
        isSell,
        solNet: solNet.toFixed(6),
        tokensInCount: tokensIn.length,
        tokensOutCount: tokensOut.length,
        relevantTokensCount: relevantTokenTransfers.length,
      });
      continue;
    }

    // Get the primary token transfer
    const tokenTransfer = isBuy ? tokensIn[0] : tokensOut[0];
    if (!tokenTransfer) {
      continue;
    }

    const tokenAmount = tokenTransfer.tokenAmount;
    if (tokenAmount === 0) {
      skippedZeroAmount++;
      continue;
    }

    // 🚫 Excluir stablecoins y wrapped tokens - Solo queremos trades especulativos
    if (EXCLUDED_TOKENS.has(tokenTransfer.mint)) {
      skippedStablecoin++;
      logger.debug('[Debug] Skipping stablecoin/wrapped token:', {
        mint: tokenTransfer.mint.substring(0, 20) + '...',
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
      tokenMint: tokenTransfer.mint,
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

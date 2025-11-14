// VERSIÓN OPTIMIZADA - 3-5x MÁS RÁPIDA
import { ParsedTransaction, getWalletTransactions } from './services/helius';

// ============================================================================
// INTERFACES
// ============================================================================

export interface WalletMetrics {
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
  totalFees: number;
  favoriteTokens: Array<{ mint: string; symbol: string; count: number }>;
  tradingDays: number;
  degenScore: number;
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
}

interface SimpleSwap {
  timestamp: number;
  tokenMint: string;
  type: 'buy' | 'sell';
  solAmount: number;
  tokenAmount: number;
}

interface TokenPosition {
  mint: string;
  buys: SimpleSwap[];
  sells: SimpleSwap[];
  totalBought: number;
  totalSpent: number;
  firstBuyTime: number;
  lastSellTime: number;
  highestValue: number;
  currentValue: number;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Simple in-memory cache (5 minutos)
const analysisCache = new Map<string, { data: WalletMetrics; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ============================================================================
// FUNCIÓN PRINCIPAL OPTIMIZADA
// ============================================================================

export async function calculateAdvancedMetrics(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<WalletMetrics> {
  try {
    // Check cache first
    const cached = analysisCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('✅ Returning cached analysis');
      if (onProgress) onProgress(100, '✅ Loaded from cache!');
      return cached.data;
    }

    console.log('📊 Starting optimized analysis...');

    if (onProgress) onProgress(5, '🚀 Starting fast analysis...');

    const allTransactions = await fetchAllTransactionsOptimized(walletAddress, onProgress);

    if (!allTransactions || allTransactions.length === 0) {
      return getDefaultMetrics();
    }

    console.log(`✅ Found ${allTransactions.length} transactions`);

    if (onProgress) onProgress(88, '💱 Parsing swaps...');

    const simpleSwaps = extractSimpleSwaps(allTransactions, walletAddress);

    console.log(`✅ Found ${simpleSwaps.length} swaps`);

    if (onProgress) onProgress(93, '📊 Calculating all metrics...');

    const metrics = calculateCompleteMetrics(simpleSwaps, allTransactions);

    // Cache results
    analysisCache.set(walletAddress, { data: metrics, timestamp: Date.now() });

    if (onProgress) onProgress(100, '🎉 Analysis complete!');

    return metrics;
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return getDefaultMetrics();
  }
}

// ============================================================================
// FETCH OPTIMIZADO - 3-5x MÁS RÁPIDO
// ============================================================================

async function fetchAllTransactionsOptimized(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let fetchCount = 0;
  const MAX_BATCHES = 50; // Reducido de 100
  const BATCH_SIZE = 1000; // Aumentado de 100 (Helius soporta hasta 1000)
  const DELAY_MS = 100; // Reducido de 500ms
  let consecutiveEmpty = 0;

  console.log(`📊 Fetching with optimized settings (1000/batch, 100ms delay)`);

  while (fetchCount < MAX_BATCHES) {
    try {
      const batch = await getWalletTransactions(walletAddress, BATCH_SIZE, before);

      console.log(`  Batch ${fetchCount + 1}: got ${batch.length} transactions`);

      if (batch.length === 0) {
        consecutiveEmpty++;
        // Early exit si no hay más transacciones
        if (consecutiveEmpty >= 2) {
          console.log('✅ No more transactions, stopping early');
          break;
        }
      } else {
        consecutiveEmpty = 0;
        allTransactions.push(...batch);
        before = batch[batch.length - 1].signature;
      }

      fetchCount++;

      // Progress: 5% - 85%
      const fetchProgress = 5 + Math.floor((fetchCount / MAX_BATCHES) * 80);
      if (onProgress) {
        onProgress(
          fetchProgress,
          `📡 Batch ${fetchCount}/${MAX_BATCHES}... (${allTransactions.length} txs)`
        );
      }

      // Delay más corto
      if (batch.length > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }

    } catch (error) {
      console.error(`  ❌ Error on batch ${fetchCount + 1}:`, error);
      fetchCount++;
      continue;
    }
  }

  console.log(`✅ Fetched ${allTransactions.length} transactions in ${fetchCount} batches`);

  return allTransactions.sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.signature.localeCompare(b.signature);
  });
}

// ============================================================================
// EXTRAER SWAPS (IGUAL QUE ANTES)
// ============================================================================

function extractSimpleSwaps(
  transactions: ParsedTransaction[],
  walletAddress: string
): SimpleSwap[] {
  const swaps: SimpleSwap[] = [];

  for (const tx of transactions) {
    if (tx.type !== 'SWAP' && !tx.description?.toLowerCase().includes('swap')) {
      continue;
    }

    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) continue;
    if (!tx.nativeTransfers || tx.nativeTransfers.length === 0) continue;

    let solNet = 0;
    for (const nt of tx.nativeTransfers) {
      if (nt.fromUserAccount === walletAddress) {
        solNet += nt.amount / 1e9;
      }
      if (nt.toUserAccount === walletAddress) {
        solNet -= nt.amount / 1e9;
      }
    }

    if (Math.abs(solNet) < 0.001) continue;

    const tokenTransfers = tx.tokenTransfers.filter(t =>
      t.mint !== SOL_MINT &&
      (t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress)
    );

    if (tokenTransfers.length === 0) continue;

    const tokenTransfer = tokenTransfers[0];

    const isBuy = solNet > 0;
    const tokenAmount = isBuy
      ? tokenTransfers.find(t => t.toUserAccount === walletAddress)?.tokenAmount || 0
      : tokenTransfers.find(t => t.fromUserAccount === walletAddress)?.tokenAmount || 0;

    if (tokenAmount === 0) continue;

    const pricePerToken = Math.abs(solNet) / tokenAmount;

    if (pricePerToken > 1 || pricePerToken < 0.0000001) {
      console.warn(`⚠️  Ignoring suspicious swap: ${pricePerToken.toFixed(10)} SOL per token`);
      continue;
    }

    if (Math.abs(solNet) > 50) {
      console.warn(`⚠️  Ignoring large swap: ${Math.abs(solNet).toFixed(2)} SOL`);
      continue;
    }

    swaps.push({
      timestamp: tx.timestamp,
      tokenMint: tokenTransfer.mint,
      type: isBuy ? 'buy' : 'sell',
      solAmount: Math.abs(solNet),
      tokenAmount,
    });
  }

  return swaps;
}

// ============================================================================
// CALCULAR MÉTRICAS COMPLETAS (TODAS LAS QUE FALTABAN)
// ============================================================================

function calculateCompleteMetrics(
  swaps: SimpleSwap[],
  transactions: ParsedTransaction[]
): WalletMetrics {
  const totalTrades = swaps.length;
  const totalVolume = swaps.reduce((sum, s) => sum + s.solAmount, 0);

  // Agrupar por token
  const tokenPositions = new Map<string, TokenPosition>();
  for (const swap of swaps) {
    if (!tokenPositions.has(swap.tokenMint)) {
      tokenPositions.set(swap.tokenMint, {
        mint: swap.tokenMint,
        buys: [],
        sells: [],
        totalBought: 0,
        totalSpent: 0,
        firstBuyTime: 0,
        lastSellTime: 0,
        highestValue: 0,
        currentValue: 0,
      });
    }
    const position = tokenPositions.get(swap.tokenMint)!;

    if (swap.type === 'buy') {
      position.buys.push(swap);
      if (position.firstBuyTime === 0) {
        position.firstBuyTime = swap.timestamp;
      }
    } else {
      position.sells.push(swap);
      position.lastSellTime = swap.timestamp;
    }
  }

  // Calcular métricas avanzadas
  let totalPnL = 0;
  const completedTrades: {
    pnl: number;
    timestamp: number;
    holdTime: number;
    tokenMint: string;
  }[] = [];

  let rugsSurvived = 0;
  let rugsCaught = 0;
  let totalRugValue = 0;
  let quickFlips = 0;
  let diamondHands = 0;
  const pnlHistory: number[] = [];

  for (const [mint, position] of tokenPositions) {
    position.buys.sort((a, b) => a.timestamp - b.timestamp);
    position.sells.sort((a, b) => a.timestamp - b.timestamp);

    let totalBought = 0;
    let totalSpent = 0;

    for (const buy of position.buys) {
      totalBought += buy.tokenAmount;
      totalSpent += buy.solAmount;
    }

    for (const sell of position.sells) {
      if (totalBought > 0) {
        const proportion = Math.min(sell.tokenAmount / totalBought, 1);
        const costBasis = totalSpent * proportion;
        const pnl = sell.solAmount - costBasis;

        if (Math.abs(pnl) <= 20) {
          totalPnL += pnl;

          // Calcular hold time
          const buyTime = position.buys[0].timestamp;
          const sellTime = sell.timestamp;
          const holdTime = sellTime - buyTime;

          completedTrades.push({
            pnl,
            timestamp: sell.timestamp,
            holdTime,
            tokenMint: mint,
          });

          pnlHistory.push(pnl);

          // Quick flips (< 1 hora)
          if (holdTime < 3600) {
            quickFlips++;
          }

          // Diamond hands (> 7 días)
          if (holdTime > 7 * 24 * 3600) {
            diamondHands++;
          }

          // Detectar rugs (pérdida > 90% del cost basis)
          const lossPercent = (pnl / costBasis) * 100;
          if (lossPercent < -90) {
            rugsCaught++;
            totalRugValue += Math.abs(pnl);
          } else if (lossPercent < -50 && pnl < -1) {
            // Sobrevivió a un posible rug
            rugsSurvived++;
          }

        } else {
          console.warn(`⚠️  Ignoring unrealistic P&L: ${pnl.toFixed(2)} SOL`);
        }

        totalBought -= sell.tokenAmount;
        totalSpent *= (1 - proportion);
      }
    }
  }

  // Calcular métricas básicas
  const wins = completedTrades.filter(t => t.pnl > 0).length;
  const losses = completedTrades.filter(t => t.pnl < 0).length;
  const winRate = completedTrades.length > 0
    ? (wins / completedTrades.length) * 100
    : 0;

  const bestTrade = completedTrades.length > 0
    ? Math.max(...completedTrades.map(t => t.pnl))
    : 0;

  const worstTrade = completedTrades.length > 0
    ? Math.min(...completedTrades.map(t => t.pnl))
    : 0;

  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee / 1e9, 0);

  // Average hold time
  const avgHoldTime = completedTrades.length > 0
    ? completedTrades.reduce((sum, t) => sum + t.holdTime, 0) / completedTrades.length
    : 0;

  // Volatility score (0-100 basado en desviación estándar de P&L)
  let volatilityScore = 0;
  if (pnlHistory.length > 1) {
    const mean = pnlHistory.reduce((a, b) => a + b, 0) / pnlHistory.length;
    const variance = pnlHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pnlHistory.length;
    const stdDev = Math.sqrt(variance);
    // Normalizar a 0-100
    volatilityScore = Math.min(Math.round(stdDev * 10), 100);
  }

  const uniqueDays = new Set(
    swaps.map(s => new Date(s.timestamp * 1000).toISOString().split('T')[0])
  ).size;

  const tokenCounts = new Map<string, number>();
  swaps.forEach(s => {
    tokenCounts.set(s.tokenMint, (tokenCounts.get(s.tokenMint) || 0) + 1);
  });

  const favoriteTokens = Array.from(tokenCounts.entries())
    .map(([mint, count]) => ({ mint, symbol: 'TOKEN', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const firstTradeDate = swaps.length > 0 ? swaps[0].timestamp : Date.now() / 1000;

  // Win/loss streaks
  let currentWinStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentLossStreak = 0;

  completedTrades.sort((a, b) => a.timestamp - b.timestamp);

  for (const trade of completedTrades) {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  }

  const moonshots = completedTrades.filter(t => t.pnl > 0 && t.pnl > 5).length;

  const degenScore = calculateDegenScore({
    totalTrades,
    totalVolume,
    profitLoss: totalPnL,
    winRate,
    tradingDays: uniqueDays,
    moonshots,
    volatilityScore,
    quickFlips,
    diamondHands,
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZED METRICS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Swaps: ${totalTrades}`);
  console.log(`Completed Trades: ${completedTrades.length}`);
  console.log(`Total Volume: ${totalVolume.toFixed(2)} SOL`);
  console.log(`P&L: ${totalPnL.toFixed(2)} SOL`);
  console.log(`Win Rate: ${winRate.toFixed(1)}%`);
  console.log(`Avg Hold Time: ${(avgHoldTime / 3600).toFixed(1)} hours`);
  console.log(`Quick Flips: ${quickFlips}`);
  console.log(`Diamond Hands: ${diamondHands}`);
  console.log(`Volatility Score: ${volatilityScore}`);
  console.log(`Rugs Survived: ${rugsSurvived}`);
  console.log(`Rugs Caught: ${rugsCaught} (${totalRugValue.toFixed(2)} SOL lost)`);
  console.log(`Moonshots: ${moonshots}`);
  console.log('='.repeat(60) + '\n');

  return {
    totalTrades,
    totalVolume,
    profitLoss: totalPnL,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize,
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
    realizedPnL: totalPnL,
    unrealizedPnL: 0,
    firstTradeDate,
    longestWinStreak,
    longestLossStreak,
    volatilityScore,
  };
}

// ============================================================================
// DEGEN SCORE MEJORADO
// ============================================================================

function calculateDegenScore(metrics: any): number {
  let score = 0;

  // Volume score (max 25)
  if (metrics.totalVolume > 1000) score += 25;
  else if (metrics.totalVolume > 500) score += 20;
  else if (metrics.totalVolume > 100) score += 15;
  else if (metrics.totalVolume > 50) score += 10;
  else score += Math.min(metrics.totalVolume / 5, 10);

  // Win rate score (max 20)
  score += Math.min(metrics.winRate / 5, 20);

  // P&L score (max 20)
  if (metrics.profitLoss > 50) score += 20;
  else if (metrics.profitLoss > 20) score += 15;
  else if (metrics.profitLoss > 5) score += 10;
  else if (metrics.profitLoss > 0) score += 5;
  else score += Math.max(-5, metrics.profitLoss / 5);

  // Activity score (max 10)
  score += Math.min(metrics.totalTrades / 20, 10);

  // Consistency score (max 5)
  score += Math.min(metrics.tradingDays / 4, 5);

  // Moonshots bonus (max 10)
  score += Math.min(metrics.moonshots * 2, 10);

  // Quick flips penalty (too much gambling)
  if (metrics.quickFlips > metrics.totalTrades * 0.5) {
    score -= 5;
  }

  // Diamond hands bonus
  if (metrics.diamondHands > 5) {
    score += 5;
  }

  // Volatility penalty
  if (metrics.volatilityScore > 70) {
    score -= 3;
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
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

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

export function formatSOL(amount: number, decimals: number = 2): string {
  return `${formatNumber(amount, decimals)} SOL`;
}

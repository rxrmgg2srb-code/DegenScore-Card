// DESPUÉS (Ruta correcta)
import { getWalletTransactions } from './services/helius';

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

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// ============================================================================
// FUNCIÓN PRINCIPAL - CON CALLBACK DE PROGRESO
// ============================================================================

export async function calculateAdvancedMetrics(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<WalletMetrics> {
  try {
    console.log('📊 Fetching transactions...');
    
    if (onProgress) onProgress(5, '🔍 Starting analysis...');
    
    const allTransactions = await fetchAllTransactions(walletAddress, onProgress);
    
    if (!allTransactions || allTransactions.length === 0) {
      return getDefaultMetrics();
    }

    console.log(`✅ Found ${allTransactions.length} transactions`);

    if (onProgress) onProgress(88, '💱 Parsing swaps...');
    
    console.log('💱 Parsing SIMPLE swaps only...');
    const simpleSwaps = extractSimpleSwaps(allTransactions, walletAddress);
    
    console.log(`✅ Found ${simpleSwaps.length} simple swaps`);

    if (onProgress) onProgress(93, '📊 Calculating metrics...');
    
    const metrics = calculateConservativeMetrics(simpleSwaps, allTransactions);
    
    if (onProgress) onProgress(100, '🎉 Analysis complete!');
    
    return metrics;
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return getDefaultMetrics();
  }
}

// ============================================================================
// OBTENER TRANSACCIONES CON PROGRESO DINÁMICO
// ============================================================================

async function fetchAllTransactions(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let fetchCount = 0;
  const FIXED_FETCH_LIMIT = 100;

  console.log(`📊 Fetching EXACTLY ${FIXED_FETCH_LIMIT} batches (no early exit)`);

  // FORZAR 100 batches - NO PARAR ANTES
  while (fetchCount < FIXED_FETCH_LIMIT) {
    try {
      const batch = await getWalletTransactions(walletAddress, 100, before);
      
      console.log(`  Batch ${fetchCount + 1}/${FIXED_FETCH_LIMIT}: got ${batch.length} transactions`);

      if (batch.length > 0) {
        allTransactions.push(...batch);
        before = batch[batch.length - 1].signature;
      }
      
      fetchCount++;
      
      // 📊 ACTUALIZAR PROGRESO (5% - 85% = 80% del progreso total)
      const fetchProgress = 5 + Math.floor((fetchCount / FIXED_FETCH_LIMIT) * 80);
      if (onProgress) {
        onProgress(
          fetchProgress, 
          `📡 Processing batch ${fetchCount}/${FIXED_FETCH_LIMIT}... (${allTransactions.length} txs found)`
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  ❌ Error on batch ${fetchCount + 1}:`, error);
      fetchCount++;
      continue;
    }
  }

  console.log(`✅ Completed ALL ${FIXED_FETCH_LIMIT} batches`);
  console.log(`✅ Total transactions collected: ${allTransactions.length}`);

  // ORDENAMIENTO DETERMINISTA
  return allTransactions.sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.signature.localeCompare(b.signature);
  });
}

// ============================================================================
// EXTRAER SOLO SWAPS SIMPLES Y VERIFICABLES
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
// CALCULAR MÉTRICAS CONSERVADORAS
// ============================================================================

function calculateConservativeMetrics(
  swaps: SimpleSwap[],
  transactions: ParsedTransaction[]
): WalletMetrics {
  const totalTrades = swaps.length;
  const totalVolume = swaps.reduce((sum, s) => sum + s.solAmount, 0);

  const tokenSwaps = new Map<string, SimpleSwap[]>();
  for (const swap of swaps) {
    if (!tokenSwaps.has(swap.tokenMint)) {
      tokenSwaps.set(swap.tokenMint, []);
    }
    tokenSwaps.get(swap.tokenMint)!.push(swap);
  }

  let totalPnL = 0;
  const completedTrades: { pnl: number; timestamp: number }[] = [];

  for (const [mint, swapList] of tokenSwaps) {
    swapList.sort((a, b) => a.timestamp - b.timestamp);

    let totalBought = 0;
    let totalSpent = 0;

    for (const swap of swapList) {
      if (swap.type === 'buy') {
        totalBought += swap.tokenAmount;
        totalSpent += swap.solAmount;
      } else {
        if (totalBought > 0) {
          const proportion = Math.min(swap.tokenAmount / totalBought, 1);
          const costBasis = totalSpent * proportion;
          const pnl = swap.solAmount - costBasis;

          if (Math.abs(pnl) <= 20) {
            totalPnL += pnl;
            completedTrades.push({ pnl, timestamp: swap.timestamp });
          } else {
            console.warn(`⚠️  Ignoring unrealistic P&L: ${pnl.toFixed(2)} SOL`);
          }

          totalBought -= swap.tokenAmount;
          totalSpent *= (1 - proportion);
        }
      }
    }
  }

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
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 CONSERVATIVE METRICS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Swaps Analyzed: ${totalTrades}`);
  console.log(`Completed Trades: ${completedTrades.length}`);
  console.log(`Total Volume: ${totalVolume.toFixed(2)} SOL`);
  console.log(`Estimated P&L: ${totalPnL.toFixed(2)} SOL`);
  console.log(`Win Rate: ${winRate.toFixed(1)}%`);
  console.log(`Best Trade: ${bestTrade.toFixed(2)} SOL`);
  console.log(`Worst Trade: ${worstTrade.toFixed(2)} SOL`);
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
    rugsSurvived: 0,
    rugsCaught: 0,
    totalRugValue: 0,
    moonshots,
    avgHoldTime: 0,
    quickFlips: 0,
    diamondHands: 0,
    realizedPnL: totalPnL,
    unrealizedPnL: 0,
    firstTradeDate,
    longestWinStreak,
    longestLossStreak,
    volatilityScore: 0,
  };
}

// ============================================================================
// DEGEN SCORE
// ============================================================================

function calculateDegenScore(metrics: any): number {
  let score = 0;

  if (metrics.totalVolume > 1000) score += 25;
  else if (metrics.totalVolume > 500) score += 20;
  else if (metrics.totalVolume > 100) score += 15;
  else if (metrics.totalVolume > 50) score += 10;
  else score += Math.min(metrics.totalVolume / 5, 10);

  score += Math.min(metrics.winRate / 5, 20);

  if (metrics.profitLoss > 50) score += 20;
  else if (metrics.profitLoss > 20) score += 15;
  else if (metrics.profitLoss > 5) score += 10;
  else if (metrics.profitLoss > 0) score += 5;
  else score += Math.max(-5, metrics.profitLoss / 5);

  score += Math.min(metrics.totalTrades / 20, 10);
  score += Math.min(metrics.tradingDays / 4, 5);

  score += Math.min(metrics.moonshots * 2, 10);

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
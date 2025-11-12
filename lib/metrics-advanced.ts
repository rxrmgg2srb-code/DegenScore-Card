import { ParsedTransaction, getWalletTransactions } from './helius';

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

interface SwapEvent {
  timestamp: number;
  signature: string;
  tokenIn: {
    mint: string;
    amount: number;
    decimals: number;
  };
  tokenOut: {
    mint: string;
    amount: number;
    decimals: number;
  };
  solSpent: number;    // SOL gastado (negativo = recibido)
  realizedPnL: number; // P&L de este swap específico
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

export async function calculateAdvancedMetrics(
  walletAddress: string
): Promise<WalletMetrics> {
  try {
    console.log('📊 Fetching all transactions for wallet...');
    const allTransactions = await fetchAllTransactions(walletAddress);
    
    if (!allTransactions || allTransactions.length === 0) {
      return getDefaultMetrics();
    }

    console.log(`✅ Found ${allTransactions.length} total transactions`);

    // Analizar swaps individuales con datos precisos
    console.log('💱 Parsing swap events...');
    const swapEvents = await parseSwapEvents(allTransactions, walletAddress);
    
    console.log(`✅ Found ${swapEvents.length} swap events`);

    // Calcular métricas desde swaps
    const metrics = calculateMetricsFromSwaps(swapEvents, allTransactions);
    
    return metrics;
  } catch (error) {
    console.error('Error calculating advanced metrics:', error);
    return getDefaultMetrics();
  }
}

// ============================================================================
// OBTENER TODAS LAS TRANSACCIONES
// ============================================================================

async function fetchAllTransactions(
  walletAddress: string
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let fetchCount = 0;
  const maxFetches = 100;

  console.log(`📊 Starting transaction fetch for ${walletAddress.slice(0, 8)}...`);

  while (fetchCount < maxFetches) {
    try {
      const batch = await getWalletTransactions(walletAddress, 100, before);
      
      if (batch.length === 0) {
        console.log(`  ✓ No more transactions available`);
        break;
      }

      allTransactions.push(...batch);
      console.log(`  Fetched ${allTransactions.length} transactions...`);
      
      before = batch[batch.length - 1].signature;
      fetchCount++;
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (allTransactions.length >= 10000) {
        console.log(`  ℹ️ Reached maximum of 10,000 transactions`);
        break;
      }
    } catch (error) {
      console.error(`  ❌ Error fetching batch ${fetchCount}:`, error);
      break;
    }
  }

  console.log(`✅ Total transactions fetched: ${allTransactions.length}`);
  return allTransactions.sort((a, b) => a.timestamp - b.timestamp);
}

// ============================================================================
// PARSEAR SWAPS CON DATOS REALES
// ============================================================================

async function parseSwapEvents(
  transactions: ParsedTransaction[],
  walletAddress: string
): Promise<SwapEvent[]> {
  const swapEvents: SwapEvent[] = [];

  for (const tx of transactions) {
    // Solo procesar SWAPs
    if (tx.type !== 'SWAP' && !tx.description?.toLowerCase().includes('swap')) {
      continue;
    }

    if (!tx.tokenTransfers || tx.tokenTransfers.length < 2) {
      continue;
    }

    // Identificar qué token enviaste (IN) y cuál recibiste (OUT)
    const tokensSent = tx.tokenTransfers.filter(
      t => t.fromUserAccount === walletAddress
    );
    const tokensReceived = tx.tokenTransfers.filter(
      t => t.toUserAccount === walletAddress
    );

    if (tokensSent.length === 0 || tokensReceived.length === 0) {
      continue;
    }

    // En un swap típico: envías 1 token, recibes 1 token
    const tokenOut = tokensReceived[0]; // Lo que recibiste
    const tokenIn = tokensSent[0];      // Lo que enviaste

    // Calcular SOL involucrado
    let solSpent = 0;
    if (tx.nativeTransfers) {
      for (const nt of tx.nativeTransfers) {
        if (nt.fromUserAccount === walletAddress) {
          solSpent += nt.amount / 1e9; // SOL gastado (positivo)
        }
        if (nt.toUserAccount === walletAddress) {
          solSpent -= nt.amount / 1e9; // SOL recibido (negativo)
        }
      }
    }

    swapEvents.push({
      timestamp: tx.timestamp,
      signature: tx.signature,
      tokenIn: {
        mint: tokenIn.mint,
        amount: tokenIn.tokenAmount,
        decimals: 9, // Asumimos 9 por defecto
      },
      tokenOut: {
        mint: tokenOut.mint,
        amount: tokenOut.tokenAmount,
        decimals: 9,
      },
      solSpent,
      realizedPnL: 0, // Lo calculamos después
    });
  }

  // Calcular P&L por par de swaps (compra -> venta del mismo token)
  calculatePnLForSwaps(swapEvents);

  return swapEvents;
}

// ============================================================================
// CALCULAR P&L REAL
// ============================================================================

function calculatePnLForSwaps(swaps: SwapEvent[]): void {
  // Agrupar por token
  const tokenSwaps = new Map<string, SwapEvent[]>();

  for (const swap of swaps) {
    // Determinar qué token es el "principal" (no SOL)
    const mainToken = swap.tokenOut.mint !== SOL_MINT 
      ? swap.tokenOut.mint 
      : swap.tokenIn.mint;

    if (!tokenSwaps.has(mainToken)) {
      tokenSwaps.set(mainToken, []);
    }
    tokenSwaps.get(mainToken)!.push(swap);
  }

  // Para cada token, calcular P&L
  for (const [tokenMint, tokenSwapList] of tokenSwaps) {
    // Ordenar por timestamp
    tokenSwapList.sort((a, b) => a.timestamp - b.timestamp);

    let totalSolSpent = 0;
    let totalTokensAcquired = 0;

    for (const swap of tokenSwapList) {
      const isBuy = swap.tokenOut.mint === tokenMint;
      
      if (isBuy) {
        // Comprando el token con SOL
        totalSolSpent += swap.solSpent;
        totalTokensAcquired += swap.tokenOut.amount;
        swap.realizedPnL = 0; // No hay P&L en compra
      } else {
        // Vendiendo el token por SOL
        const tokensSold = swap.tokenIn.amount;
        const solReceived = -swap.solSpent; // Negativo porque recibimos

        // Calcular qué porción vendimos
        if (totalTokensAcquired > 0) {
          const proportion = tokensSold / totalTokensAcquired;
          const costBasis = totalSolSpent * proportion;
          swap.realizedPnL = solReceived - costBasis;

          // Actualizar inventario
          totalTokensAcquired -= tokensSold;
          totalSolSpent *= (1 - proportion);
        } else {
          // Vendimos sin tener (raro, pero puede pasar)
          swap.realizedPnL = solReceived;
        }
      }
    }
  }
}

// ============================================================================
// CALCULAR MÉTRICAS DESDE SWAPS
// ============================================================================

function calculateMetricsFromSwaps(
  swaps: SwapEvent[],
  transactions: ParsedTransaction[]
): WalletMetrics {
  // Total trades
  const totalTrades = swaps.length;

  // Volume (suma de todo el SOL que cambió de manos)
  const totalVolume = swaps.reduce((sum, s) => sum + Math.abs(s.solSpent), 0);

  // P&L (suma de todos los P&L realizados)
  const profitLoss = swaps.reduce((sum, s) => sum + s.realizedPnL, 0);

  // Filtrar solo ventas (tienen P&L)
  const sales = swaps.filter(s => s.realizedPnL !== 0);
  
  const wins = sales.filter(s => s.realizedPnL > 0).length;
  const losses = sales.filter(s => s.realizedPnL < 0).length;
  const winRate = sales.length > 0 ? (wins / sales.length) * 100 : 0;

  // Best/Worst trade (de las ventas reales)
  const bestTrade = sales.length > 0
    ? Math.max(...sales.map(s => s.realizedPnL))
    : 0;
  
  const worstTrade = sales.length > 0
    ? Math.min(...sales.map(s => s.realizedPnL))
    : 0;

  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;

  // Fees
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee / 1e9, 0);

  // Trading days
  const uniqueDays = new Set(
    swaps.map(s => new Date(s.timestamp * 1000).toISOString().split('T')[0])
  ).size;

  // Tokens más tradeados
  const tokenCounts = new Map<string, number>();
  swaps.forEach(s => {
    const token = s.tokenOut.mint !== SOL_MINT ? s.tokenOut.mint : s.tokenIn.mint;
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });

  const favoriteTokens = Array.from(tokenCounts.entries())
    .map(([mint, count]) => ({ mint, symbol: 'TOKEN', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Métricas avanzadas (simplificadas por ahora)
  const firstTradeDate = swaps.length > 0 ? swaps[0].timestamp : Date.now() / 1000;

  // Win streaks
  let currentWinStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentLossStreak = 0;

  for (const sale of sales) {
    if (sale.realizedPnL > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (sale.realizedPnL < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  }

  // Degen Score
  const degenScore = calculateDegenScore({
    totalTrades,
    totalVolume,
    profitLoss,
    winRate,
    tradingDays: uniqueDays,
  });

  console.log(`💰 Final P&L: ${profitLoss.toFixed(2)} SOL`);
  console.log(`🎯 Win Rate: ${winRate.toFixed(1)}%`);
  console.log(`📊 Best: ${bestTrade.toFixed(2)} / Worst: ${worstTrade.toFixed(2)}`);

  return {
    totalTrades,
    totalVolume,
    profitLoss,
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
    moonshots: 0,
    avgHoldTime: 0,
    quickFlips: 0,
    diamondHands: 0,
    realizedPnL: profitLoss,
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

  if (metrics.profitLoss > 100) score += 20;
  else if (metrics.profitLoss > 50) score += 15;
  else if (metrics.profitLoss > 10) score += 10;
  else if (metrics.profitLoss > 0) score += 5;
  else score += Math.max(-5, metrics.profitLoss / 10);

  score += Math.min(metrics.totalTrades / 20, 5);
  score += Math.min(metrics.tradingDays / 4, 5);

  return Math.round(Math.min(Math.max(score, 0), 100));
}

// ============================================================================
// HELPERS
// ============================================================================

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
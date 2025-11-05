import { ParsedTransaction } from './helius';

export interface WalletMetrics {
  totalTrades: number;
  totalVolume: number; // in SOL
  profitLoss: number; // in SOL
  winRate: number; // percentage
  bestTrade: number; // in SOL
  worstTrade: number; // in SOL
  avgTradeSize: number; // in SOL
  totalFees: number; // in SOL
  favoriteTokens: Array<{ mint: string; count: number }>;
  tradingDays: number;
  degenScore: number; // 0-100
}

interface Trade {
  type: 'buy' | 'sell';
  amount: number;
  token: string;
  timestamp: number;
  pnl?: number;
}

/**
 * Calcula todas las métricas de trading para una wallet
 */
export function calculateMetrics(transactions: ParsedTransaction[]): WalletMetrics {
  if (!transactions || transactions.length === 0) {
    return getDefaultMetrics();
  }

  const trades = extractTrades(transactions);
  const swapTransactions = transactions.filter(tx => 
    tx.type === 'SWAP' || 
    tx.description?.toLowerCase().includes('swap') ||
    tx.tokenTransfers && tx.tokenTransfers.length >= 2
  );

  const totalVolume = calculateTotalVolume(swapTransactions);
  const profitLoss = calculateProfitLoss(trades);
  const { winRate, bestTrade, worstTrade } = calculateWinMetrics(trades);
  const favoriteTokens = calculateFavoriteTokens(transactions);
  const totalFees = transactions.reduce((sum, tx) => sum + (tx.fee / 1e9), 0);
  const tradingDays = calculateTradingDays(transactions);
  const avgTradeSize = swapTransactions.length > 0 ? totalVolume / swapTransactions.length : 0;

  const degenScore = calculateDegenScore({
    totalTrades: swapTransactions.length,
    totalVolume,
    profitLoss,
    winRate,
    tradingDays,
    avgTradeSize,
  });

  return {
    totalTrades: swapTransactions.length,
    totalVolume,
    profitLoss,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize,
    totalFees,
    favoriteTokens: favoriteTokens.slice(0, 5), // Top 5
    tradingDays,
    degenScore,
  };
}

/**
 * Extrae trades individuales de las transacciones
 */
function extractTrades(transactions: ParsedTransaction[]): Trade[] {
  const trades: Trade[] = [];

  transactions.forEach(tx => {
    if (!tx.tokenTransfers || tx.tokenTransfers.length < 2) return;

    // Identificar si es compra o venta basado en SOL transfer
    const hasNativeTransfer = tx.nativeTransfers && tx.nativeTransfers.length > 0;
    
    tx.tokenTransfers.forEach(transfer => {
      if (transfer.tokenAmount > 0) {
        trades.push({
          type: hasNativeTransfer ? 'buy' : 'sell',
          amount: transfer.tokenAmount,
          token: transfer.mint,
          timestamp: tx.timestamp,
        });
      }
    });
  });

  return trades;
}

/**
 * Calcula el volumen total en SOL
 */
function calculateTotalVolume(transactions: ParsedTransaction[]): number {
  let volume = 0;

  transactions.forEach(tx => {
    if (tx.nativeTransfers) {
      tx.nativeTransfers.forEach(transfer => {
        volume += transfer.amount / 1e9; // lamports to SOL
      });
    }
  });

  return volume;
}

/**
 * Calcula P&L aproximado basado en flujos de SOL
 */
function calculateProfitLoss(trades: Trade[]): number {
  // Simplificación: comparar trades de compra vs venta del mismo token
  const tokenBalances = new Map<string, number>();

  trades.forEach(trade => {
    const current = tokenBalances.get(trade.token) || 0;
    if (trade.type === 'buy') {
      tokenBalances.set(trade.token, current - trade.amount);
    } else {
      tokenBalances.set(trade.token, current + trade.amount);
    }
  });

  // Suma total (positivo = ganancia, negativo = pérdida)
  let totalPnL = 0;
  tokenBalances.forEach(balance => {
    totalPnL += balance;
  });

  return totalPnL / 1e9; // Convertir a SOL
}

/**
 * Calcula win rate y mejores/peores trades
 */
function calculateWinMetrics(trades: Trade[]): {
  winRate: number;
  bestTrade: number;
  worstTrade: number;
} {
  if (trades.length === 0) {
    return { winRate: 0, bestTrade: 0, worstTrade: 0 };
  }

  // Agrupar trades por token para calcular P&L individual
  const tokenTrades = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const existing = tokenTrades.get(trade.token) || [];
    existing.push(trade);
    tokenTrades.set(trade.token, existing);
  });

  let wins = 0;
  let losses = 0;
  let bestTrade = 0;
  let worstTrade = 0;

  tokenTrades.forEach(tokenTradeList => {
    const pnl = tokenTradeList.reduce((sum, t) => {
      return sum + (t.type === 'sell' ? t.amount : -t.amount);
    }, 0);

    if (pnl > 0) wins++;
    if (pnl < 0) losses++;

    bestTrade = Math.max(bestTrade, pnl / 1e9);
    worstTrade = Math.min(worstTrade, pnl / 1e9);
  });

  const totalPositions = wins + losses;
  const winRate = totalPositions > 0 ? (wins / totalPositions) * 100 : 0;

  return { winRate, bestTrade, worstTrade };
}

/**
 * Calcula tokens más tradeados
 */
function calculateFavoriteTokens(transactions: ParsedTransaction[]): Array<{ mint: string; count: number }> {
  const tokenCounts = new Map<string, number>();

  transactions.forEach(tx => {
    if (tx.tokenTransfers) {
      tx.tokenTransfers.forEach(transfer => {
        const current = tokenCounts.get(transfer.mint) || 0;
        tokenCounts.set(transfer.mint, current + 1);
      });
    }
  });

  return Array.from(tokenCounts.entries())
    .map(([mint, count]) => ({ mint, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calcula días únicos de trading
 */
function calculateTradingDays(transactions: ParsedTransaction[]): number {
  const uniqueDays = new Set<string>();

  transactions.forEach(tx => {
    const date = new Date(tx.timestamp * 1000);
    const dayKey = date.toISOString().split('T')[0];
    uniqueDays.add(dayKey);
  });

  return uniqueDays.size;
}

/**
 * Calcula el "Degen Score" (0-100)
 */
function calculateDegenScore(metrics: {
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  tradingDays: number;
  avgTradeSize: number;
}): number {
  let score = 0;

  // Volume (30 points max)
  if (metrics.totalVolume > 1000) score += 30;
  else if (metrics.totalVolume > 500) score += 25;
  else if (metrics.totalVolume > 100) score += 20;
  else if (metrics.totalVolume > 50) score += 15;
  else if (metrics.totalVolume > 10) score += 10;
  else score += Math.min(metrics.totalVolume, 10);

  // Win Rate (25 points max)
  score += Math.min(metrics.winRate / 4, 25);

  // Profitability (20 points max)
  if (metrics.profitLoss > 100) score += 20;
  else if (metrics.profitLoss > 50) score += 15;
  else if (metrics.profitLoss > 10) score += 10;
  else if (metrics.profitLoss > 0) score += 5;

  // Activity (15 points max)
  score += Math.min(metrics.totalTrades / 10, 10);
  score += Math.min(metrics.tradingDays / 2, 5);

  // Consistency (10 points max)
  if (metrics.avgTradeSize > 5 && metrics.avgTradeSize < 50) score += 10;
  else if (metrics.avgTradeSize > 1) score += 5;

  return Math.round(Math.min(score, 100));
}

/**
 * Retorna métricas por defecto cuando no hay datos
 */
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
  };
}

/**
 * Formatea número a formato legible (K, M, B)
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

/**
 * Formatea SOL con símbolo
 */
export function formatSOL(amount: number, decimals: number = 2): string {
  return `${formatNumber(amount, decimals)} SOL`;
}

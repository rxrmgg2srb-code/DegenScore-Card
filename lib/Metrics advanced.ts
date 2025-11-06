import { ParsedTransaction, getWalletTransactions } from './helius';

// ============================================================================
// INTERFACES
// ============================================================================

export interface WalletMetrics {
  // Métricas básicas
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
  
  // Métricas avanzadas (NUEVO)
  rugsSurvived: number;          // Tokens que fueron rug y vendió antes
  rugsCaught: number;            // Tokens que fueron rug y no vendió
  totalRugValue: number;         // SOL perdidos en rugs
  moonshots: number;             // Tokens con >10x ganancia
  avgHoldTime: number;           // Tiempo promedio de hold (horas)
  quickFlips: number;            // Trades < 1 hora
  diamondHands: number;          // Trades > 7 días
  realizedPnL: number;           // P&L real calculado con precios
  unrealizedPnL: number;         // P&L de posiciones abiertas
  firstTradeDate: number;        // Timestamp primer trade
  longestWinStreak: number;      // Racha más larga de wins
  longestLossStreak: number;     // Racha más larga de losses
  volatilityScore: number;       // Qué tan volátil es el trader (0-100)
}

interface TokenPosition {
  mint: string;
  symbol?: string;
  buyAmount: number;           // SOL gastado
  sellAmount: number;          // SOL recibido
  tokensBought: number;
  tokensSold: number;
  avgBuyPrice: number;         // Precio promedio de compra en SOL
  avgSellPrice: number;        // Precio promedio de venta en SOL
  firstBuyTimestamp: number;
  lastSellTimestamp?: number;
  isRugged: boolean;           // Si el token fue a 0
  ruggedBeforeSell: boolean;   // Si vendió antes del rug
  realizedPnL: number;         // P&L de lo vendido
  unrealizedPnL: number;       // P&L de lo que aún tiene
  holdTime: number;            // Tiempo de hold en horas
  isClosed: boolean;           // Si vendió todo
}

interface TradeHistoryEntry {
  timestamp: number;
  type: 'win' | 'loss';
  pnl: number;
  token: string;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Calcula TODAS las métricas de una wallet desde su primer trade
 */
export async function calculateAdvancedMetrics(
  walletAddress: string
): Promise<WalletMetrics> {
  try {
    // 1. Obtener TODAS las transacciones (no solo 100)
    console.log('📊 Fetching all transactions for wallet...');
    const allTransactions = await fetchAllTransactions(walletAddress);
    
    if (!allTransactions || allTransactions.length === 0) {
      return getDefaultMetrics();
    }

    console.log(`✅ Found ${allTransactions.length} total transactions`);

    // 2. Analizar posiciones por token
    console.log('💰 Analyzing token positions...');
    const positions = await analyzePositions(allTransactions, walletAddress);
    
    // 3. Detectar rugs
    console.log('🔍 Detecting rug pulls...');
    const rugAnalysis = await detectRugs(positions);
    
    // 4. Calcular métricas básicas
    const basicMetrics = calculateBasicMetrics(allTransactions, positions);
    
    // 5. Calcular métricas avanzadas
    const advancedMetrics = calculateAdvancedMetricsFromPositions(
      positions,
      rugAnalysis,
      allTransactions
    );
    
    // 6. Calcular DegenScore mejorado
    const degenScore = calculateAdvancedDegenScore({
      ...basicMetrics,
      ...advancedMetrics,
    });

    return {
      ...basicMetrics,
      ...advancedMetrics,
      degenScore,
    };
  } catch (error) {
    console.error('Error calculating advanced metrics:', error);
    return getDefaultMetrics();
  }
}

// ============================================================================
// OBTENER TODAS LAS TRANSACCIONES
// ============================================================================

/**
 * Obtiene TODAS las transacciones de una wallet (no solo 100)
 */
async function fetchAllTransactions(
  walletAddress: string
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let hasMore = true;
  let before: string | undefined;
  let fetchCount = 0;
  const maxFetches = 50; // Máximo 5000 transacciones (50 * 100)

  while (hasMore && fetchCount < maxFetches) {
    try {
      const batch = await getWalletTransactions(walletAddress, 100, before);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      allTransactions.push(...batch);
      
      // Para paginar, necesitamos el signature de la última tx
      before = batch[batch.length - 1].signature;
      fetchCount++;
      
      console.log(`  Fetched ${allTransactions.length} transactions...`);
      
      // Si recibimos menos de 100, ya no hay más
      if (batch.length < 100) {
        hasMore = false;
      }
      
      // Pequeño delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching transaction batch:', error);
      hasMore = false;
    }
  }

  // Ordenar por timestamp (más antiguos primero)
  return allTransactions.sort((a, b) => a.timestamp - b.timestamp);
}

// ============================================================================
// ANALIZAR POSICIONES
// ============================================================================

/**
 * Analiza todas las posiciones por token
 */
async function analyzePositions(
  transactions: ParsedTransaction[],
  walletAddress: string
): Promise<TokenPosition[]> {
  const positionsMap = new Map<string, TokenPosition>();

  for (const tx of transactions) {
    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) continue;

    // Detectar si es compra o venta
    const isBuy = tx.nativeTransfers?.some(
      transfer => transfer.fromUserAccount === walletAddress
    );
    const isSell = tx.nativeTransfers?.some(
      transfer => transfer.toUserAccount === walletAddress
    );

    for (const transfer of tx.tokenTransfers) {
      const mint = transfer.mint;
      
      // Ignorar transferencias donde no es el usuario
      if (
        transfer.fromUserAccount !== walletAddress &&
        transfer.toUserAccount !== walletAddress
      ) {
        continue;
      }

      // Inicializar posición si no existe
      if (!positionsMap.has(mint)) {
        positionsMap.set(mint, {
          mint,
          buyAmount: 0,
          sellAmount: 0,
          tokensBought: 0,
          tokensSold: 0,
          avgBuyPrice: 0,
          avgSellPrice: 0,
          firstBuyTimestamp: tx.timestamp,
          isRugged: false,
          ruggedBeforeSell: false,
          realizedPnL: 0,
          unrealizedPnL: 0,
          holdTime: 0,
          isClosed: false,
        });
      }

      const position = positionsMap.get(mint)!;

      // Calcular SOL gastado/recibido
      const solAmount = tx.nativeTransfers
        ?.filter(nt => 
          (isBuy && nt.fromUserAccount === walletAddress) ||
          (isSell && nt.toUserAccount === walletAddress)
        )
        .reduce((sum, nt) => sum + Math.abs(nt.amount), 0) || 0;
      
      const solInSOL = solAmount / 1e9;

      // Actualizar compra
      if (transfer.toUserAccount === walletAddress) {
        position.tokensBought += transfer.tokenAmount;
        position.buyAmount += solInSOL;
        
        if (!position.firstBuyTimestamp || tx.timestamp < position.firstBuyTimestamp) {
          position.firstBuyTimestamp = tx.timestamp;
        }
      }
      
      // Actualizar venta
      if (transfer.fromUserAccount === walletAddress) {
        position.tokensSold += transfer.tokenAmount;
        position.sellAmount += solInSOL;
        position.lastSellTimestamp = tx.timestamp;
      }
    }
  }

  // Calcular precios promedios y P&L
  const positions = Array.from(positionsMap.values()).map(pos => {
    // Precio promedio de compra
    pos.avgBuyPrice = pos.tokensBought > 0 ? pos.buyAmount / pos.tokensBought : 0;
    
    // Precio promedio de venta
    pos.avgSellPrice = pos.tokensSold > 0 ? pos.sellAmount / pos.tokensSold : 0;
    
    // P&L realizado (de lo vendido)
    pos.realizedPnL = pos.sellAmount - (pos.tokensSold * pos.avgBuyPrice);
    
    // P&L no realizado (de lo que aún tiene)
    const tokensHeld = pos.tokensBought - pos.tokensSold;
    pos.unrealizedPnL = tokensHeld > 0 
      ? -(tokensHeld * pos.avgBuyPrice) // Asumimos que vale 0 si no vendió todo
      : 0;
    
    // Cerrado si vendió todo o casi todo (>95%)
    pos.isClosed = pos.tokensSold >= pos.tokensBought * 0.95;
    
    // Hold time
    if (pos.lastSellTimestamp) {
      pos.holdTime = (pos.lastSellTimestamp - pos.firstBuyTimestamp) / 3600; // en horas
    }
    
    return pos;
  });

  return positions.filter(p => p.buyAmount > 0); // Solo posiciones con compras
}

// ============================================================================
// DETECCIÓN DE RUGS
// ============================================================================

interface RugAnalysis {
  rugsSurvived: number;
  rugsCaught: number;
  totalRugValue: number;
  ruggedTokens: string[];
}

/**
 * Detecta rugs basándose en:
 * 1. Token perdió >90% del valor
 * 2. Usuario no vendió a tiempo (o vendió tarde)
 */
async function detectRugs(positions: TokenPosition[]): Promise<RugAnalysis> {
  let rugsSurvived = 0;
  let rugsCaught = 0;
  let totalRugValue = 0;
  const ruggedTokens: string[] = [];

  for (const pos of positions) {
    // Un token se considera rug si:
    // - Usuario compró pero no vendió nada (o vendió muy poco)
    // - La pérdida no realizada es muy grande
    
    const soldPercentage = pos.tokensSold / pos.tokensBought;
    const totalPnL = pos.realizedPnL + pos.unrealizedPnL;
    
    // Si vendió menos del 20% y tiene pérdida > 80% del capital invertido
    if (soldPercentage < 0.2 && totalPnL < -pos.buyAmount * 0.8) {
      pos.isRugged = true;
      rugsCaught++;
      totalRugValue += Math.abs(pos.unrealizedPnL);
      ruggedTokens.push(pos.mint);
    }
    // Si vendió >50% pero con pérdida >70%, pero salvó algo
    else if (soldPercentage > 0.5 && totalPnL < -pos.buyAmount * 0.7) {
      pos.isRugged = true;
      pos.ruggedBeforeSell = true;
      rugsSurvived++;
      ruggedTokens.push(pos.mint);
    }
  }

  return {
    rugsSurvived,
    rugsCaught,
    totalRugValue,
    ruggedTokens,
  };
}

// ============================================================================
// MÉTRICAS BÁSICAS
// ============================================================================

function calculateBasicMetrics(
  transactions: ParsedTransaction[],
  positions: TokenPosition[]
) {
  const swapTxs = transactions.filter(tx => 
    tx.type === 'SWAP' || 
    tx.description?.toLowerCase().includes('swap')
  );

  const totalVolume = swapTxs.reduce((sum, tx) => {
    const solAmount = tx.nativeTransfers?.reduce(
      (s, nt) => s + Math.abs(nt.amount), 0
    ) || 0;
    return sum + solAmount / 1e9;
  }, 0);

  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee / 1e9, 0);

  const uniqueDays = new Set(
    transactions.map(tx => new Date(tx.timestamp * 1000).toISOString().split('T')[0])
  ).size;

  const tokenCounts = new Map<string, number>();
  transactions.forEach(tx => {
    tx.tokenTransfers?.forEach(transfer => {
      tokenCounts.set(
        transfer.mint,
        (tokenCounts.get(transfer.mint) || 0) + 1
      );
    });
  });

  const favoriteTokens = Array.from(tokenCounts.entries())
    .map(([mint, count]) => ({ mint, symbol: 'TOKEN', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // P&L y win rate
  const closedPositions = positions.filter(p => p.isClosed);
  const wins = closedPositions.filter(p => p.realizedPnL > 0).length;
  const losses = closedPositions.filter(p => p.realizedPnL < 0).length;
  const winRate = closedPositions.length > 0 ? (wins / closedPositions.length) * 100 : 0;

  const bestTrade = closedPositions.length > 0
    ? Math.max(...closedPositions.map(p => p.realizedPnL))
    : 0;
  
  const worstTrade = closedPositions.length > 0
    ? Math.min(...closedPositions.map(p => p.realizedPnL))
    : 0;

  const profitLoss = positions.reduce((sum, p) => sum + p.realizedPnL, 0);

  return {
    totalTrades: swapTxs.length,
    totalVolume,
    profitLoss,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize: swapTxs.length > 0 ? totalVolume / swapTxs.length : 0,
    totalFees,
    favoriteTokens,
    tradingDays: uniqueDays,
  };
}

// ============================================================================
// MÉTRICAS AVANZADAS
// ============================================================================

function calculateAdvancedMetricsFromPositions(
  positions: TokenPosition[],
  rugAnalysis: RugAnalysis,
  transactions: ParsedTransaction[]
) {
  // Moonshots (>10x)
  const moonshots = positions.filter(p => 
    p.isClosed && p.realizedPnL > p.buyAmount * 10
  ).length;

  // Hold times
  const avgHoldTime = positions.filter(p => p.holdTime > 0)
    .reduce((sum, p) => sum + p.holdTime, 0) / 
    Math.max(positions.filter(p => p.holdTime > 0).length, 1);

  const quickFlips = positions.filter(p => p.holdTime > 0 && p.holdTime < 1).length;
  const diamondHands = positions.filter(p => p.holdTime > 168).length; // >7 días

  // P&L realizado vs no realizado
  const realizedPnL = positions.reduce((sum, p) => sum + p.realizedPnL, 0);
  const unrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);

  // Primera fecha de trade
  const firstTradeDate = positions.length > 0
    ? Math.min(...positions.map(p => p.firstBuyTimestamp))
    : Date.now() / 1000;

  // Rachas (streaks)
  const closedPositions = positions
    .filter(p => p.isClosed)
    .sort((a, b) => a.firstBuyTimestamp - b.firstBuyTimestamp);
  
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  closedPositions.forEach(p => {
    if (p.realizedPnL > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (p.realizedPnL < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  });

  // Volatilidad (qué tan dispersos están los resultados)
  const pnls = closedPositions.map(p => p.realizedPnL);
  const avgPnL = pnls.reduce((a, b) => a + b, 0) / Math.max(pnls.length, 1);
  const variance = pnls.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnL, 2), 0) / 
    Math.max(pnls.length, 1);
  const volatilityScore = Math.min(Math.sqrt(variance) * 10, 100);

  return {
    rugsSurvived: rugAnalysis.rugsSurvived,
    rugsCaught: rugAnalysis.rugsCaught,
    totalRugValue: rugAnalysis.totalRugValue,
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
// DEGEN SCORE MEJORADO
// ============================================================================

function calculateAdvancedDegenScore(metrics: any): number {
  let score = 0;

  // 1. Volume (25 puntos)
  if (metrics.totalVolume > 1000) score += 25;
  else if (metrics.totalVolume > 500) score += 20;
  else if (metrics.totalVolume > 100) score += 15;
  else if (metrics.totalVolume > 50) score += 10;
  else score += Math.min(metrics.totalVolume / 5, 10);

  // 2. Win Rate (20 puntos)
  score += Math.min(metrics.winRate / 5, 20);

  // 3. Profitability (20 puntos)
  if (metrics.profitLoss > 100) score += 20;
  else if (metrics.profitLoss > 50) score += 15;
  else if (metrics.profitLoss > 10) score += 10;
  else if (metrics.profitLoss > 0) score += 5;
  else score += Math.max(-5, metrics.profitLoss / 10); // Penalizar pérdidas

  // 4. Rugs Survived (15 puntos) - NUEVO
  if (metrics.rugsSurvived > 5) score += 15;
  else if (metrics.rugsSurvived > 3) score += 12;
  else if (metrics.rugsSurvived > 0) score += 8;
  
  // Penalizar por rugs atrapados
  score -= Math.min(metrics.rugsCaught * 2, 10);

  // 5. Moonshots (10 puntos) - NUEVO
  score += Math.min(metrics.moonshots * 2, 10);

  // 6. Activity (10 puntos)
  score += Math.min(metrics.totalTrades / 20, 5);
  score += Math.min(metrics.tradingDays / 4, 5);

  // 7. Consistency (10 puntos)
  // Premiar low volatility + positive returns
  if (metrics.volatilityScore < 30 && metrics.profitLoss > 0) {
    score += 10;
  } else if (metrics.volatilityScore < 50) {
    score += 5;
  }

  // Bonus: Win Streaks
  if (metrics.longestWinStreak > 10) score += 5;
  else if (metrics.longestWinStreak > 5) score += 3;

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

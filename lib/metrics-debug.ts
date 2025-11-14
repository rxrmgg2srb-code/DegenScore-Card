// VERSIÓN DEBUG - Para encontrar dónde se pierden los trades
import { ParsedTransaction, getWalletTransactions } from './services/helius';

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

export async function calculateAdvancedMetrics(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<WalletMetrics> {
  try {
    console.log('🔍 DEBUG MODE - Análisis con logging extensivo');

    if (onProgress) onProgress(5, '🔍 Fetching transactions...');

    const allTransactions = await fetchAllTransactions(walletAddress, onProgress);

    if (!allTransactions || allTransactions.length === 0) {
      console.log('❌ No se encontraron transacciones');
      return getDefaultMetrics();
    }

    console.log(`\n📊 TOTAL TRANSACCIONES: ${allTransactions.length}`);

    // Analizar tipos de transacciones
    const txTypes = new Map<string, number>();
    allTransactions.forEach(tx => {
      const type = tx.type || 'UNKNOWN';
      txTypes.set(type, (txTypes.get(type) || 0) + 1);
    });

    console.log('\n📈 TIPOS DE TRANSACCIONES:');
    txTypes.forEach((count, type) => {
      console.log(`  ${type}: ${count}`);
    });

    if (onProgress) onProgress(88, '💱 Parsing swaps...');

    const simpleSwaps = extractSimpleSwapsDebug(allTransactions, walletAddress);

    console.log(`\n✅ SWAPS EXTRAÍDOS: ${simpleSwaps.length}`);

    if (onProgress) onProgress(93, '📊 Calculating metrics...');

    const metrics = calculateMetrics(simpleSwaps, allTransactions);

    if (onProgress) onProgress(100, '✅ Complete!');

    return metrics;
  } catch (error) {
    console.error('❌ Error:', error);
    return getDefaultMetrics();
  }
}

async function fetchAllTransactions(
  walletAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<ParsedTransaction[]> {
  const allTransactions: ParsedTransaction[] = [];
  let before: string | undefined;
  let fetchCount = 0;
  const MAX_BATCHES = 100;
  const BATCH_SIZE = 1000;
  const DELAY_MS = 200;

  console.log(`\n🔄 Fetching hasta ${MAX_BATCHES} batches de ${BATCH_SIZE} transacciones`);

  while (fetchCount < MAX_BATCHES) {
    try {
      const batch = await getWalletTransactions(walletAddress, BATCH_SIZE, before);

      if (batch.length > 0) {
        allTransactions.push(...batch);
        before = batch[batch.length - 1].signature;
        console.log(`  ✓ Batch ${fetchCount + 1}: ${batch.length} txs (Total: ${allTransactions.length})`);
      } else {
        console.log(`  ⚠️ Batch ${fetchCount + 1}: vacío`);
      }

      fetchCount++;

      const fetchProgress = 5 + Math.floor((fetchCount / MAX_BATCHES) * 80);
      if (onProgress) {
        onProgress(fetchProgress, `📡 Batch ${fetchCount}/${MAX_BATCHES}... (${allTransactions.length} txs)`);
      }

      await new Promise(resolve => setTimeout(resolve, DELAY_MS));

    } catch (error) {
      console.error(`  ❌ Error batch ${fetchCount + 1}:`, error);
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
  }

  console.log(`\n✅ Total: ${allTransactions.length} transacciones en ${fetchCount} batches`);

  return allTransactions.sort((a, b) => a.timestamp - b.timestamp);
}

function extractSimpleSwapsDebug(
  transactions: ParsedTransaction[],
  walletAddress: string
): SimpleSwap[] {
  const swaps: SimpleSwap[] = [];

  console.log('\n🔍 ANÁLISIS DE FILTROS:');
  let stats = {
    total: 0,
    notSwap: 0,
    noTokenTransfers: 0,
    noNativeTransfers: 0,
    tinySwap: 0,
    noTokenMatch: 0,
    zeroTokenAmount: 0,
    suspiciousPrice: 0,
    largeSwap: 0,
    passed: 0,
  };

  for (const tx of transactions) {
    stats.total++;

    // Filtro 1: Es swap?
    if (tx.type !== 'SWAP' && !tx.description?.toLowerCase().includes('swap')) {
      stats.notSwap++;
      continue;
    }

    // Filtro 2: Tiene tokenTransfers?
    if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) {
      stats.noTokenTransfers++;
      continue;
    }

    // Filtro 3: Tiene nativeTransfers?
    if (!tx.nativeTransfers || tx.nativeTransfers.length === 0) {
      stats.noNativeTransfers++;
      continue;
    }

    // Calcular solNet
    let solNet = 0;
    for (const nt of tx.nativeTransfers) {
      if (nt.fromUserAccount === walletAddress) {
        solNet += nt.amount / 1e9;
      }
      if (nt.toUserAccount === walletAddress) {
        solNet -= nt.amount / 1e9;
      }
    }

    // Filtro 4: Swap muy pequeño?
    if (Math.abs(solNet) < 0.001) {
      stats.tinySwap++;
      continue;
    }

    // Filtro 5: Token transfers válidos?
    const tokenTransfers = tx.tokenTransfers.filter(t =>
      t.mint !== SOL_MINT &&
      (t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress)
    );

    if (tokenTransfers.length === 0) {
      stats.noTokenMatch++;
      continue;
    }

    const tokenTransfer = tokenTransfers[0];

    const isBuy = solNet > 0;
    const tokenAmount = isBuy
      ? tokenTransfers.find(t => t.toUserAccount === walletAddress)?.tokenAmount || 0
      : tokenTransfers.find(t => t.fromUserAccount === walletAddress)?.tokenAmount || 0;

    // Filtro 6: Token amount válido?
    if (tokenAmount === 0) {
      stats.zeroTokenAmount++;
      continue;
    }

    const pricePerToken = Math.abs(solNet) / tokenAmount;

    // Filtro 7: Precio sospechoso?
    if (pricePerToken > 1 || pricePerToken < 0.0000001) {
      stats.suspiciousPrice++;
      continue;
    }

    // Filtro 8: Swap muy grande?
    if (Math.abs(solNet) > 50) {
      stats.largeSwap++;
      continue;
    }

    // ✅ PASÓ TODOS LOS FILTROS
    stats.passed++;
    swaps.push({
      timestamp: tx.timestamp,
      tokenMint: tokenTransfer.mint,
      type: isBuy ? 'buy' : 'sell',
      solAmount: Math.abs(solNet),
      tokenAmount,
    });
  }

  console.log('\n📊 RESULTADOS DE FILTROS:');
  console.log(`  Total transacciones: ${stats.total}`);
  console.log(`  ❌ No es SWAP: ${stats.notSwap}`);
  console.log(`  ❌ Sin tokenTransfers: ${stats.noTokenTransfers}`);
  console.log(`  ❌ Sin nativeTransfers: ${stats.noNativeTransfers}`);
  console.log(`  ❌ Swap < 0.001 SOL: ${stats.tinySwap}`);
  console.log(`  ❌ No token match: ${stats.noTokenMatch}`);
  console.log(`  ❌ Token amount = 0: ${stats.zeroTokenAmount}`);
  console.log(`  ❌ Precio sospechoso: ${stats.suspiciousPrice}`);
  console.log(`  ❌ Swap > 50 SOL: ${stats.largeSwap}`);
  console.log(`  ✅ SWAPS VÁLIDOS: ${stats.passed}`);

  return swaps;
}

function calculateMetrics(swaps: SimpleSwap[], transactions: ParsedTransaction[]): WalletMetrics {
  const totalTrades = swaps.length;
  const totalVolume = swaps.reduce((sum, s) => sum + s.solAmount, 0);

  console.log(`\n📊 MÉTRICAS FINALES:`);
  console.log(`  Total Trades: ${totalTrades}`);
  console.log(`  Total Volume: ${totalVolume.toFixed(2)} SOL`);

  // Cálculo simple por ahora
  return {
    totalTrades,
    totalVolume,
    profitLoss: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: totalTrades > 0 ? totalVolume / totalTrades : 0,
    totalFees: transactions.reduce((sum, tx) => sum + tx.fee / 1e9, 0),
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

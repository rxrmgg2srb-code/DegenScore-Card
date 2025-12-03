/**
 * 🔍 Script de depuración profunda de P&L
 * Analiza qué está causando la sobreestimación masiva
 */

import { calculateAdvancedMetrics } from '../lib/metricsEngine';

async function debugWallet() {
    const wallet = 'B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1';

    console.log('🔍 DEBUG: Deep P&L Analysis\n');
    console.log(`📍 Wallet: ${wallet}\n`);

    try {
        const metrics = await calculateAdvancedMetrics(wallet);

        console.log('\n📊 Summary:');
        console.log(`  Total Trades: ${metrics.totalTrades}`);
        console.log(`  Volume: ${metrics.totalVolume.toFixed(2)} SOL`);
        console.log(`  Realized P&L: ${metrics.realizedPnL?.toFixed(2)} SOL`);
        console.log(`  Unrealized P&L: ${metrics.unrealizedPnL?.toFixed(2)} SOL`);
        console.log(`  Win Rate: ${metrics.winRate.toFixed(1)}%`);
        console.log(`  DegenScore: ${metrics.degenScore}`);

        // Analizar posiciones
        const positions = (metrics as any)._debugPositions || [];
        console.log(`\n📦 Total Positions: ${positions.length}`);

        // Posiciones cerradas por P&L
        const closedPositions = positions.filter((p: any) => !p.isOpen);
        const sortedByPnL = [...closedPositions].sort((a: any, b: any) => (b.profitLoss || 0) - (a.profitLoss || 0));

        console.log(`\n🏆 TOP 10 WINNING POSITIONS:`);
        sortedByPnL.slice(0, 10).forEach((pos, i) => {
            console.log(`  ${i + 1}. Token: ${pos.tokenMint.substring(0, 8)}...`);
            console.log(`     Buy: ${pos.buyAmount.toFixed(4)} SOL | Sell: ${(pos.sellAmount || 0).toFixed(4)} SOL`);
            console.log(`     P&L: ${(pos.profitLoss || 0) >= 0 ? '+' : ''}${(pos.profitLoss || 0).toFixed(4)} SOL (${(pos.profitLossPercent || 0).toFixed(1)}%)`);
            console.log(`     Hold: ${((pos.holdTime || 0) / 3600).toFixed(1)}h`);
            console.log('');
        });

        console.log(`\n📉 TOP 10 LOSING POSITIONS:`);
        sortedByPnL.slice(-10).reverse().forEach((pos, i) => {
            console.log(`  ${i + 1}. Token: ${pos.tokenMint.substring(0, 8)}...`);
            console.log(`     Buy: ${pos.buyAmount.toFixed(4)} SOL | Sell: ${(pos.sellAmount || 0).toFixed(4)} SOL`);
            console.log(`     P&L: ${(pos.profitLoss || 0) >= 0 ? '+' : ''}${(pos.profitLoss || 0).toFixed(4)} SOL (${(pos.profitLossPercent || 0).toFixed(1)}%)`);
            console.log(`     Hold: ${((pos.holdTime || 0) / 3600).toFixed(1)}h`);
            console.log('');
        });

        // Análisis de distribución
        console.log(`\n📊 P&L DISTRIBUTION:`);
        const pnls = closedPositions.map((p: any) => p.profitLoss || 0);
        const totalPnL = pnls.reduce((sum: number, pnl: number) => sum + pnl, 0);
        const avgPnL = totalPnL / closedPositions.length;
        const maxPnL = Math.max(...pnls);
        const minPnL = Math.min(...pnls);

        console.log(`  Total P&L: ${totalPnL.toFixed(4)} SOL`);
        console.log(`  Avg P&L per position: ${avgPnL.toFixed(4)} SOL`);
        console.log(`  Max single position: ${maxPnL.toFixed(4)} SOL`);
        console.log(`  Min single position: ${minPnL.toFixed(4)} SOL`);

        // Detectar posiciones sospechosas (muy alto P&L con muy bajo cost basis)
        console.log(`\n⚠️  SUSPICIOUS POSITIONS (High P&L, Low Cost):`);
        const suspicious = closedPositions.filter((p: any) =>
            p.buyAmount < 0.01 && (p.profitLoss || 0) > 10
        );

        console.log(`  Found ${suspicious.length} positions with cost < 0.01 SOL but P&L > 10 SOL:`);
        suspicious.slice(0, 5).forEach((pos: any) => {
            console.log(`    - Token: ${pos.tokenMint.substring(0, 12)}...`);
            console.log(`      Buy: ${pos.buyAmount.toFixed(6)} SOL -> Sell: ${(pos.sellAmount || 0).toFixed(4)} SOL`);
            console.log(`      P&L: ${(pos.profitLoss || 0).toFixed(4)} SOL`);
        });

        // Análisis de cost basis total
        const totalCost = closedPositions.reduce((sum: number, p: any) => sum + p.buyAmount, 0);
        const totalSell = closedPositions.reduce((sum: number, p: any) => sum + (p.sellAmount || 0), 0);
        console.log(`\n💰 CASH FLOW:`);
        console.log(`  Total Invested (Sum of all buys): ${totalCost.toFixed(2)} SOL`);
        console.log(`  Total Received (Sum of all sells): ${totalSell.toFixed(2)} SOL`);
        console.log(`  Net P&L (Sell - Buy): ${(totalSell - totalCost).toFixed(2)} SOL`);
        console.log(`  Reported P&L: ${metrics.realizedPnL?.toFixed(2)} SOL`);
        console.log(`  Difference: ${((metrics.realizedPnL || 0) - (totalSell - totalCost)).toFixed(2)} SOL`);

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (error instanceof Error) {
            console.error('   Stack:', error.stack);
        }
    }
}

debugWallet();

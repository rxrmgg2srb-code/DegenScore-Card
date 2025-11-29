/**
 * LEGACY COMPATIBILITY WRAPPER
 *
 * This file maintains backward compatibility while using the new DeFi-focused engine.
 * Now using Solscan DeFi activities for more accurate analysis!
 */

export { calculateDefiMetrics as calculateAdvancedMetrics } from './defiMetricsEngine';
export type { WalletMetrics, Position, Trade } from './metricsEngine';

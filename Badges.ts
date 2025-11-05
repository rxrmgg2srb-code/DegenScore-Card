import { WalletMetrics } from './metrics';

export interface Badge {
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  condition: (metrics: WalletMetrics) => boolean;
}

export const BADGES: Badge[] = [
  // Volume Badges
  {
    name: 'Whale Trader',
    description: 'Trade over 1000 SOL in volume',
    icon: '🐋',
    rarity: 'LEGENDARY',
    condition: (m) => m.totalVolume >= 1000,
  },
  {
    name: 'Volume King',
    description: 'Trade over 500 SOL in volume',
    icon: '👑',
    rarity: 'EPIC',
    condition: (m) => m.totalVolume >= 500,
  },
  {
    name: 'High Roller',
    description: 'Trade over 100 SOL in volume',
    icon: '🎰',
    rarity: 'RARE',
    condition: (m) => m.totalVolume >= 100,
  },
  {
    name: 'Active Trader',
    description: 'Complete 100+ trades',
    icon: '📊',
    rarity: 'COMMON',
    condition: (m) => m.totalTrades >= 100,
  },

  // Win Rate Badges
  {
    name: 'Perfect Record',
    description: 'Achieve 100% win rate (min 10 trades)',
    icon: '💯',
    rarity: 'LEGENDARY',
    condition: (m) => m.winRate === 100 && m.totalTrades >= 10,
  },
  {
    name: 'Sharpshooter',
    description: 'Maintain 80%+ win rate',
    icon: '🎯',
    rarity: 'EPIC',
    condition: (m) => m.winRate >= 80,
  },
  {
    name: 'Consistent Winner',
    description: 'Maintain 60%+ win rate',
    icon: '✅',
    rarity: 'RARE',
    condition: (m) => m.winRate >= 60,
  },

  // Profit Badges
  {
    name: 'Profit Master',
    description: 'Make over 100 SOL in profit',
    icon: '💰',
    rarity: 'LEGENDARY',
    condition: (m) => m.profitLoss >= 100,
  },
  {
    name: 'Money Maker',
    description: 'Make over 50 SOL in profit',
    icon: '💵',
    rarity: 'EPIC',
    condition: (m) => m.profitLoss >= 50,
  },
  {
    name: 'In The Green',
    description: 'Make over 10 SOL in profit',
    icon: '💚',
    rarity: 'RARE',
    condition: (m) => m.profitLoss >= 10,
  },
  {
    name: 'First Profit',
    description: 'Make your first profitable trade',
    icon: '🌱',
    rarity: 'COMMON',
    condition: (m) => m.profitLoss > 0,
  },

  // Trading Frequency Badges
  {
    name: 'Day Trader',
    description: 'Trade for 30+ different days',
    icon: '📅',
    rarity: 'EPIC',
    condition: (m) => m.tradingDays >= 30,
  },
  {
    name: 'Weekly Warrior',
    description: 'Trade for 7+ different days',
    icon: '⚔️',
    rarity: 'RARE',
    condition: (m) => m.tradingDays >= 7,
  },
  {
    name: 'Getting Started',
    description: 'Complete your first trade',
    icon: '🚀',
    rarity: 'COMMON',
    condition: (m) => m.totalTrades >= 1,
  },

  // Special Achievements
  {
    name: 'Diamond Hands',
    description: 'Survive a -50% trade and stay positive overall',
    icon: '💎',
    rarity: 'EPIC',
    condition: (m) => m.worstTrade <= -50 && m.profitLoss > 0,
  },
  {
    name: 'Moon Shot',
    description: 'Hit a single trade worth 100+ SOL profit',
    icon: '🌙',
    rarity: 'LEGENDARY',
    condition: (m) => m.bestTrade >= 100,
  },
  {
    name: 'Big Win',
    description: 'Hit a single trade worth 50+ SOL profit',
    icon: '🎆',
    rarity: 'EPIC',
    condition: (m) => m.bestTrade >= 50,
  },
  {
    name: 'Lucky Strike',
    description: 'Hit a single trade worth 10+ SOL profit',
    icon: '🍀',
    rarity: 'RARE',
    condition: (m) => m.bestTrade >= 10,
  },

  // Risk Badges
  {
    name: 'Degen Legend',
    description: 'Score 90+ Degen Score',
    icon: '🔥',
    rarity: 'LEGENDARY',
    condition: (m) => m.degenScore >= 90,
  },
  {
    name: 'True Degen',
    description: 'Score 75+ Degen Score',
    icon: '⭐',
    rarity: 'EPIC',
    condition: (m) => m.degenScore >= 75,
  },
  {
    name: 'Certified Degen',
    description: 'Score 60+ Degen Score',
    icon: '✨',
    rarity: 'RARE',
    condition: (m) => m.degenScore >= 60,
  },

  // Volume Consistency
  {
    name: 'Consistent Trader',
    description: 'Maintain average trade size between 5-50 SOL',
    icon: '⚖️',
    rarity: 'RARE',
    condition: (m) => m.avgTradeSize >= 5 && m.avgTradeSize <= 50,
  },
  {
    name: 'Micro Trader',
    description: 'Complete 50+ trades under 1 SOL',
    icon: '🔬',
    rarity: 'COMMON',
    condition: (m) => m.totalTrades >= 50 && m.avgTradeSize < 1,
  },

  // Survival Badges
  {
    name: 'Survivor',
    description: 'Still trading after experiencing a major loss',
    icon: '🛡️',
    rarity: 'RARE',
    condition: (m) => m.worstTrade < -10 && m.totalTrades >= 20,
  },
  {
    name: 'Comeback Kid',
    description: 'Be profitable despite having significant losses',
    icon: '🔄',
    rarity: 'EPIC',
    condition: (m) => m.worstTrade < -20 && m.profitLoss > 50,
  },

  // Endurance
  {
    name: 'Marathon Trader',
    description: 'Complete 500+ trades',
    icon: '🏃',
    rarity: 'EPIC',
    condition: (m) => m.totalTrades >= 500,
  },
  {
    name: 'Veteran',
    description: 'Complete 250+ trades',
    icon: '🎖️',
    rarity: 'RARE',
    condition: (m) => m.totalTrades >= 250,
  },
];

/**
 * Calcula qué badges ha desbloqueado un usuario
 */
export function calculateUnlockedBadges(metrics: WalletMetrics): Badge[] {
  return BADGES.filter(badge => badge.condition(metrics));
}

/**
 * Calcula el nivel basado en XP (XP viene del degen score y métricas)
 */
export function calculateLevel(metrics: WalletMetrics): number {
  // XP = degenScore * 10 + totalTrades + (totalVolume / 10)
  const xp = metrics.degenScore * 10 + metrics.totalTrades + Math.floor(metrics.totalVolume / 10);
  
  // Cada nivel requiere más XP: Level 1 = 0, Level 2 = 100, Level 3 = 300, etc.
  let level = 1;
  let requiredXp = 0;
  
  while (xp >= requiredXp) {
    level++;
    requiredXp += level * 100;
  }
  
  return Math.max(1, level - 1);
}

/**
 * Calcula XP total
 */
export function calculateXP(metrics: WalletMetrics): number {
  return metrics.degenScore * 10 + metrics.totalTrades + Math.floor(metrics.totalVolume / 10);
}

/**
 * Obtiene el XP necesario para el siguiente nivel
 */
export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

/**
 * Obtiene las badges por rareza
 */
export function getBadgesByRarity(badges: Badge[]): Record<string, Badge[]> {
  return {
    LEGENDARY: badges.filter(b => b.rarity === 'LEGENDARY'),
    EPIC: badges.filter(b => b.rarity === 'EPIC'),
    RARE: badges.filter(b => b.rarity === 'RARE'),
    COMMON: badges.filter(b => b.rarity === 'COMMON'),
  };
}

// Define the expected structure for Badge
export interface Badge {
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// Define the minimal structure of required metrics
interface Metrics {
    totalTrades: number;
    winRate: number;
    totalVolume: number;
    tradingDays: number;
    moonshots: number;
}

/**
 * Generates a list of badges based on advanced trading metrics.
 * @param metrics The metrics calculated by calculateAdvancedMetrics.
 * @returns Array of Badge objects.
 */
export function generateBadges(metrics: Metrics): Badge[] {
    const badges: Badge[] = [];

    // Badge logic (extracted from your API handler)
    
    if (metrics.totalTrades > 100) {
        badges.push({ 
            name: 'Active Trader', 
            description: `${metrics.totalTrades} trades executed`, 
            icon: '📈', 
            rarity: 'COMMON'
        });
    }
    
    if (metrics.totalTrades > 500) {
        badges.push({ 
            name: 'Volume King', 
            description: `${metrics.totalTrades} trades`, 
            icon: '👑', 
            rarity: 'RARE'
        });
    }
    
    if (metrics.winRate > 60) {
        badges.push({ 
            name: 'Winning Streak', 
            description: `${metrics.winRate.toFixed(1)}% win rate`, 
            icon: '🔥', 
            rarity: 'EPIC'
        });
    }

    if (metrics.totalVolume > 1000) {
        badges.push({ 
            name: 'Whale', 
            description: `${metrics.totalVolume.toFixed(0)} SOL volume`, 
            icon: '🐋', 
            rarity: 'LEGENDARY'
        });
    }

    if (metrics.tradingDays > 30) {
        badges.push({ 
            name: 'Consistent Trader', 
            description: `Active for ${metrics.tradingDays} days`, 
            icon: '📅', 
            rarity: 'RARE'
        });
    }

    if (metrics.moonshots > 5) {
        badges.push({ 
            name: 'Moonshot Hunter', 
            description: `${metrics.moonshots} big wins`, 
            icon: '🚀', 
            rarity: 'EPIC'
        });
    }

    return badges;
}

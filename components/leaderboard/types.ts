export interface LeaderboardEntry {
  id: string;
  walletAddress: string;
  degenScore: number;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  level: number;
  xp: number;
  bestTrade: number;
  worstTrade: number;
  badges: any[];
  mintedAt: string;
  displayName?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  profileImage?: string | null;
  isPaid?: boolean;
  likes: number;
  badgePoints?: number;
  referralCount?: number;
  calculatedBadges?: any[]; // Badges desbloqueados con su info completa
  tradingDays?: number;
}

export interface Stats {
  totalCards: number;
  avgScore: number;
  topScore: number;
  totalVolume: number;
}

export interface PaginationInfo {
  totalCards: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type ViewMode = 'table' | 'cards';
export type SortBy =
  | 'likes'
  | 'referralCount'
  | 'badgePoints'
  | 'newest'
  | 'oldest'
  | 'degenScore'
  | 'totalVolume'
  | 'winRate';
export type TimePeriod = 'today' | 'weekly' | 'monthly' | 'all';

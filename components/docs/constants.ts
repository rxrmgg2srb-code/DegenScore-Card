export interface Section {
    id: string;
    title: string;
    icon: string;
}

export const sections: Section[] = [
    { id: 'intro', title: 'Introduction', icon: '📖' },
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'generate-card', title: 'Generate Your Card', icon: '🎴' },
    { id: 'understand-metrics', title: 'Understanding Metrics', icon: '📊' },
    { id: 'badges', title: 'Badge System', icon: '🏆' },
    { id: 'upgrade', title: 'Upgrade to Premium', icon: '💎' },
    { id: 'daily-checkin', title: 'Daily Check-In', icon: '🔥' },
    { id: 'referrals', title: 'Referral System', icon: '🎁' },
    { id: 'challenges', title: 'Weekly Challenges', icon: '⚔️' },
    { id: 'hot-feed', title: 'Alpha Feed', icon: '📡' },
    { id: 'leaderboard', title: 'Leaderboard', icon: '🏅' },
    { id: 'tiers', title: 'Tiers & Benefits', icon: '⭐' },
    { id: 'faq', title: 'FAQ', icon: '❓' },
];

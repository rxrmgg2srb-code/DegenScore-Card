export interface Section {
  id: string;
  title: string;
  icon: string;
}

export const sections: Section[] = [
  { id: 'intro', title: 'Introducción', icon: '📖' },
  { id: 'getting-started', title: 'Primeros Pasos', icon: '🚀' },
  { id: 'generate-card', title: 'Generate Your Card', icon: '🎴' },
  { id: 'understand-metrics', title: 'Entender Métricas', icon: '📊' },
  { id: 'badges', title: 'Sistema de Badges', icon: '🏆' },
  { id: 'upgrade', title: 'Upgrade a Premium', icon: '💎' },
  { id: 'daily-checkin', title: 'Check-In Diario', icon: '🔥' },
  { id: 'referrals', title: 'Sistema de Referidos', icon: '🎁' },
  { id: 'challenges', title: 'Weekly Challenges', icon: '⚔️' },
  { id: 'hot-feed', title: 'Alpha Feed', icon: '📡' },
  { id: 'leaderboard', title: 'Leaderboard', icon: '🏅' },
  { id: 'tiers', title: 'Tiers & Beneficios', icon: '⭐' },
  { id: 'faq', title: 'FAQ', icon: '❓' },
];

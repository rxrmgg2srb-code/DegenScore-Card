import DegenCard from '../components/DegenCard';
import Link from 'next/link';
import HotFeedWidget from '../components/HotFeedWidget';
import { GlobalStats } from '../components/GlobalStats';
import { LiveActivityFeed } from '../components/LiveActivityFeed';
import OnboardingTour from '../components/OnboardingTour';
import WeeklyChallengeBanner from '../components/WeeklyChallengeBanner';
import LanguageSwitch from '../components/LanguageSwitch';
import { useLanguage } from '../lib/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="neon-streak"></div>

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Live Activity Feed */}
      <LiveActivityFeed />

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Logo/Title */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text-gold animate-float">
              {t('title')}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{t('subtitle')}</p>
          </div>

          {/* Navigation and Language Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitch />

            <Link href="/compare">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-cyan-500/50">
                {t('compareCards')}
              </button>
            </Link>

            <Link href="/docs">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-green-500/50">
                📖 {t('documentation')}
              </button>
            </Link>

            <Link href="/leaderboard">
              <button className="btn-premium px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition shadow-lg hover:shadow-purple-500/50">
                {t('viewLeaderboard')}
              </button>
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <GlobalStats className="mb-8 animate-slide-up global-stats" />

        {/* Weekly Challenge Banner */}
        <WeeklyChallengeBanner />
      </div>

      {/* Layout con Card Generator y Hot Feed */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Generator - 2 columnas */}
          <div className="lg:col-span-2">
            <DegenCard />
          </div>

          {/* Hot Feed Widget - 1 columna */}
          <div className="lg:col-span-1 activity-feed">
            <HotFeedWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * SIMPLIFIED Navigation - Only essential pages
 * Creates FOMO with minimal, premium design
 */
export function NavigationButtons() {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    {
      href: '/',
      label: 'My Score',
      emoji: '🎯',
      gradient: 'from-purple-500 to-pink-500',
      activeGradient: 'from-purple-400 to-pink-400',
    },
    {
      href: '/leaderboard',
      label: 'Top Traders',
      emoji: '🏆',
      gradient: 'from-yellow-500 to-orange-500',
      activeGradient: 'from-yellow-400 to-orange-400',
    },
    {
      href: '/whale-radar',
      label: 'Copy Whales',
      emoji: '🐋',
      gradient: 'from-blue-500 to-cyan-500',
      activeGradient: 'from-blue-400 to-cyan-400',
    },
    {
      href: '/compare',
      label: 'Battle',
      emoji: '⚔️',
      gradient: 'from-red-500 to-orange-500',
      activeGradient: 'from-red-400 to-orange-400',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${isActive(item.href)
                ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-white/20`
                : `bg-gradient-to-r ${item.gradient} text-white hover:shadow-lg`
              }`}
          >
            <span className="mr-1 sm:mr-2">{item.emoji}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        </Link>
      ))}
    </div>
  );
}

export default NavigationButtons;

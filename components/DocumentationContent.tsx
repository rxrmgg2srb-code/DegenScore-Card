import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { LanguageSelector } from '../components/LanguageSelector';
import { NavigationButtons } from '../components/NavigationButtons';

interface Section {
  id: string;
  title: string;
  icon: string;
}

const sections: Section[] = [
  { id: 'intro', title: 'Introduction', icon: '📖' },
  { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
  { id: 'generate-card', title: 'Generate Your Card', icon: '🎴' },
  { id: 'understand-metrics', title: 'Understand Metrics', icon: '📊' },
  { id: 'badges', title: 'Achievement System', icon: '🏆' },
  { id: 'upgrade', title: 'Upgrade to Premium', icon: '💎' },
  { id: 'daily-checkin', title: 'Daily Check-In', icon: '🔥' },
  { id: 'referrals', title: 'Referral System', icon: '🎁' },
  { id: 'challenges', title: 'Weekly Challenges', icon: '⚔️' },
  { id: 'hot-feed', title: 'Alpha Feed', icon: '📡' },
  { id: 'leaderboard', title: 'Leaderboard', icon: '🏅' },
  { id: 'tiers', title: 'Tiers & Benefits', icon: '⭐' },
  { id: 'faq', title: 'FAQ', icon: '❓' },
];

export function Documentation() {
  const [activeSection, setActiveSection] = useState('intro');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Head>
        <title>Documentation - DegenScore Card</title>
        <meta name="description" content="Complete guide to DegenScore Card usage" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-lg sticky top-0 z-40 border-b border-purple-500/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  📚 DegenScore Documentation
                </h1>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                </div>
              </div>

              {/* Navigation Buttons */}
              <NavigationButtons />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                <h2 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${activeSection === section.id
                        ? 'bg-purple-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-purple-900/30 hover:text-white'
                        }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl">
              <div className="space-y-12">
                {/* Introduction */}
                <Section id="intro" title="Introduction" icon="📖">
                  <p className="text-gray-300 text-lg mb-4">
                    Welcome to <strong className="text-purple-400">DegenScore Card</strong>, the ultimate platform to analyze,
                    gamify, and share your Solana trades.
                  </p>
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-bold mb-3">What is DegenScore?</h4>
                    <p className="text-gray-300 mb-4">
                      DegenScore Card analyzes your Solana wallet and generates a visual card featuring:
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Advanced metrics</strong>: 30+ trading statistics (volume, P&L, win rate, rugs, moonshots, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>DegenScore</strong>: A 0-100 score evaluating your trading skills</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Badges</strong>: Unlockable achievements based on your feats</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Rankings</strong>: Compete in global leaderboards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Alpha Feed</strong>: See real-time trades from top wallets</span>
                      </li>
                    </ul>
                  </div>
                </Section>

                {/* Getting Started */}
                <Section id="getting-started" title="Getting Started" icon="🚀">
                  <div className="space-y-4">
                    <Step number={1} title="Connect Your Wallet">
                      <p className="text-gray-300 mb-3">
                        Click the <code className="bg-purple-900/50 px-2 py-1 rounded">Select Wallet</code> button at the top right.
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Supported wallets:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Badge>Phantom</Badge>
                          <Badge>Solflare</Badge>
                          <Badge>Backpack</Badge>
                          <Badge>Ledger</Badge>
                        </div>
                      </div>
                    </Step>

                    <Step number={2} title="Analyze Your Wallet">
                      <p className="text-gray-300 mb-3">
                        Once connected, the system automatically:
                      </p>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Scans your trade history using Helius API</li>
                        <li>• Calculates 30+ advanced metrics</li>
                        <li>• Generates your DegenScore (0-100)</li>
                        <li>• Assigns badges based on your achievements</li>
                      </ul>
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-200 text-sm">
                          ⏱️ <strong>Analysis time:</strong> 10-30 seconds depending on your history
                        </p>
                      </div>
                    </Step>

                    <Step number={3} title="Explore Your Card">
                      <p className="text-gray-300">
                        Review your metrics, badges, and leaderboard position. Your card is your trader identity!
                      </p>
                    </Step>
                  </div>
                </Section>

                {/* Generate Card */}
                <Section id="generate-card" title="Generate Your Card" icon="🎴">
                  <p className="text-gray-300 mb-4">
                    Your DegenScore Card is completely <strong>FREE</strong> to generate. Here's the process:
                  </p>

                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h4 className="text-xl font-bold mb-4">Generation Process</h4>
                    <div className="space-y-4">
                      <ProcessStep>
                        <strong>1. Connection</strong> → Connect your Solana wallet
                      </ProcessStep>
                      <ProcessStep>
                        <strong>2. Analysis</strong> → Our system analyzes your complete trade history
                      </ProcessStep>
                      <ProcessStep>
                        <strong>3. Calculation</strong> → 30+ metrics are calculated (win rate, P&L, rugs, moonshots, etc.)
                      </ProcessStep>
                      <ProcessStep>
                        <strong>4. Scoring</strong> → Your DegenScore from 0-100 is generated
                      </ProcessStep>
                      <ProcessStep>
                        <strong>5. Badges</strong> → Badges are assigned based on your achievements
                      </ProcessStep>
                      <ProcessStep>
                        <strong>6. Card</strong> → Your downloadable visual card is generated
                      </ProcessStep>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Tip:</strong> Your card updates automatically each time you re-analyze it.
                      Come back regularly to see your DegenScore improve!
                    </p>
                  </div>
                </Section>

                {/* Understand Metrics */}
                <Section id="understand-metrics" title="Understand Metrics" icon="📊">
                  <p className="text-gray-300 mb-6">
                    DegenScore Card tracks over 30 metrics. Here are the most important:
                  </p>

                  <div className="space-y-4">
                    <MetricCard
                      title="DegenScore"
                      range="0-100"
                      description="Your overall score as a trader. Calculated considering win rate, P&L, consistency, experience, and risk management."
                      levels={[
                        { range: '0-20', label: 'Plankton', emoji: '🦐' },
                        { range: '21-40', label: 'Shrimp', emoji: '🦐' },
                        { range: '41-60', label: 'Dolphin', emoji: '🐬' },
                        { range: '61-80', label: 'Shark', emoji: '🦈' },
                        { range: '81-100', label: 'Whale', emoji: '🐋' },
                      ]}
                    />

                    <MetricCard
                      title="Win Rate"
                      range="0-100%"
                      description="Percentage of winning trades. A good win rate is >50%, but it's not the only thing that matters."
                    />

                    <MetricCard
                      title="Total P&L"
                      range="$-∞ to $∞"
                      description="Total profit or loss in USD. Your net profit/loss considering all trades."
                    />

                    <MetricCard
                      title="Rugs Survived"
                      range="0-∞"
                      description="Number of tokens you bought that turned out to be rugs (>90% drop) but you sold in time."
                    />

                    <MetricCard
                      title="Moonshots"
                      range="0-∞"
                      description="Trades with +1000% gains (10x or more). Every degen's dream."
                    />

                    <MetricCard
                      title="Diamond Hands"
                      range="0-∞"
                      description="Tokens you held for more than 30 days. Diamond patience 💎"
                    />

                    <MetricCard
                      title="Quick Flips"
                      range="0-∞"
                      description="Trades executed in less than 1 hour. Pure speed ⚡"
                    />
                  </div>
                </Section>

                {/* Badges - EXPANDED SECTION */}
                <Section id="badges" title="Achievement System" icon="🏆">
                  <p className="text-gray-300 mb-6">
                    Unlock achievements based on your trading activities. There are <strong>60+ badges</strong> available across 6 categories.
                    Each badge has a rarity level and point value that contributes to your overall rank.
                  </p>

                  {/* Rarity & Points System */}
                  <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4">Badge Rarity & Point System</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                      <RarityCard rarity="COMMON" points={1} color="gray" />
                      <RarityCard rarity="RARE" points={3} color="green" />
                      <RarityCard rarity="EPIC" points={5} color="purple" />
                      <RarityCard rarity="LEGENDARY" points={10} color="orange" />
                      <RarityCard rarity="MYTHIC" points={25} color="red" />
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>Total possible points: 215+</strong> from all badges. Your badge points contribute to your overall ranking!
                    </p>
                  </div>

                  {/* VOLUME BADGES */}
                  <div className="space-y-6">
                    <BadgeCategoryExpanded title="💰 Volume Trading Badges" count={15}>
                      <p className="text-sm text-gray-400 mb-4">Unlock these badges based on your total trading volume (in SOL)</p>
                      <div className="grid gap-3">
                        <BadgeItemDetailed emoji="🐣" name="Mini Degen" threshold="1+ SOL traded" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="💼" name="Starter Trader" threshold="5+ SOL traded" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="⚡" name="Fast Hands" threshold="10+ SOL traded" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="🦈" name="Shark Trader" threshold="25+ SOL traded" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🔥" name="Hot Wallet" threshold="50+ SOL traded" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🐳" name="Baby Whale" threshold="75+ SOL traded" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="💎" name="Solid Trader" threshold="100+ SOL traded" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🐋" name="Whale" threshold="150+ SOL traded" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🌋" name="Volcano Wallet" threshold="250+ SOL traded" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🪙" name="Market Maker" threshold="300+ SOL traded" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="💼" name="Executive Whale" threshold="500+ SOL traded" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="😈" name="Degen King" threshold="750+ SOL traded" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="🛸" name="Alien Volume" threshold="1000+ SOL traded" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="👽" name="Extraterrestrial" threshold="2000+ SOL traded" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="⚡" name="Volume God" threshold="5000+ SOL traded" rarity="MYTHIC" points={25} />
                      </div>
                    </BadgeCategoryExpanded>

                    {/* PNL BADGES */}
                    <BadgeCategoryExpanded title="📈 Profit & Loss Badges" count={15}>
                      <p className="text-sm text-gray-400 mb-4">Badges for both profits and losses (hey, at least you're trying!)</p>
                      <div className="grid gap-3">
                        {/* Profit Badges */}
                        <div className="bg-green-900/10 border border-green-500/30 rounded p-3">
                          <h5 className="text-sm font-bold text-green-400 mb-2">🟢 Profit Badges</h5>
                          <div className="grid gap-2">
                            <BadgeItemDetailed emoji="💰" name="Profit Rookie" threshold="0.5+ SOL profit" rarity="COMMON" points={1} />
                            <BadgeItemDetailed emoji="💵" name="Green Trader" threshold="1+ SOL profit" rarity="COMMON" points={1} />
                            <BadgeItemDetailed emoji="🌿" name="Profit Machine" threshold="3+ SOL profit" rarity="RARE" points={3} />
                            <BadgeItemDetailed emoji="🔋" name="Energy Trader" threshold="5+ SOL profit" rarity="RARE" points={3} />
                            <BadgeItemDetailed emoji="💚" name="Green Giant" threshold="10+ SOL profit" rarity="EPIC" points={5} />
                            <BadgeItemDetailed emoji="🧙‍♂️" name="Profit Wizard" threshold="25+ SOL profit" rarity="EPIC" points={5} />
                            <BadgeItemDetailed emoji="🦅" name="Eagle Eye" threshold="40+ SOL profit" rarity="LEGENDARY" points={10} />
                            <BadgeItemDetailed emoji="🟢" name="Green God" threshold="75+ SOL profit" rarity="LEGENDARY" points={10} />
                            <BadgeItemDetailed emoji="🧬" name="Profit Titan" threshold="100+ SOL profit" rarity="MYTHIC" points={25} />
                          </div>
                        </div>

                        {/* Loss Badges (Humor) */}
                        <div className="bg-red-900/10 border border-red-500/30 rounded p-3">
                          <h5 className="text-sm font-bold text-red-400 mb-2">🔴 Loss Badges (Badge of Honor)</h5>
                          <div className="grid gap-2">
                            <BadgeItemDetailed emoji="☠️" name="Rug Victim" threshold="-1 SOL loss" rarity="COMMON" points={1} />
                            <BadgeItemDetailed emoji="💀" name="Rug Survivor" threshold="-3 SOL loss" rarity="RARE" points={3} />
                            <BadgeItemDetailed emoji="🤡" name="Clown" threshold="-5 SOL loss" rarity="RARE" points={3} />
                            <BadgeItemDetailed emoji="🎭" name="Comedy Trader" threshold="-10 SOL loss" rarity="EPIC" points={5} />
                            <BadgeItemDetailed emoji="🪦" name="Wallet Funeral" threshold="-20 SOL loss" rarity="LEGENDARY" points={10} />
                            <BadgeItemDetailed emoji="🧨" name="Nuked Wallet" threshold="-30 SOL loss" rarity="MYTHIC" points={25} />
                          </div>
                        </div>
                      </div>
                    </BadgeCategoryExpanded>

                    {/* WIN RATE BADGES */}
                    <BadgeCategoryExpanded title="🎯 Win Rate Badges" count={10}>
                      <p className="text-sm text-gray-400 mb-4">Precision matters. Show off your accuracy with these badges.</p>
                      <div className="grid gap-3">
                        <BadgeItemDetailed emoji="🎯" name="Accurate" threshold="50%+ win rate" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="🎖️" name="Sniper" threshold="60%+ win rate" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🧊" name="Ice Sniper" threshold="70%+ win rate" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🏅" name="Elite Sniper" threshold="75%+ win rate" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🏆" name="Golden Aim" threshold="80%+ win rate" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🏹" name="Bowmaster" threshold="85%+ win rate" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="🔥" name="Perfect Shot" threshold="90%+ win rate" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="⛩️" name="Zen Trader" threshold="95%+ win rate" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="⚜️" name="God Accuracy" threshold="98%+ win rate" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="⭐" name="Perfect Trader" threshold="100% win rate" rarity="MYTHIC" points={25} />
                      </div>
                    </BadgeCategoryExpanded>

                    {/* ACTIVITY BADGES */}
                    <BadgeCategoryExpanded title="⚡ Activity Badges" count={10}>
                      <p className="text-sm text-gray-400 mb-4">Stay active, trade smart, and collect these achievements.</p>
                      <div className="grid gap-3">
                        <BadgeItemDetailed emoji="📈" name="Active Trader" threshold="100+ trades" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="👑" name="Volume King" threshold="500+ trades" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="📅" name="Consistent Trader" threshold="30+ days trading" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🚀" name="Moonshot Hunter" threshold="5+ big wins (10x+)" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🎖️" name="Trading Veteran" threshold="1000+ trades" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="💎" name="Diamond Hands" threshold="10+ long holds (30+ days)" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="🤖" name="Trading Machine" threshold="2000+ trades" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="⚡" name="Immortal Trader" threshold="90+ days trading" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="😈" name="Degen God" threshold="5000+ trades" rarity="MYTHIC" points={25} />
                        <BadgeItemDetailed emoji="👑" name="Eternal Degen" threshold="365+ days trading" rarity="MYTHIC" points={25} />
                      </div>
                    </BadgeCategoryExpanded>

                    {/* SOCIAL BADGES */}
                    <BadgeCategoryExpanded title="🤝 Social & Referral Badges" count={5}>
                      <p className="text-sm text-gray-400 mb-4">Spread the word and earn rewards for growing the community.</p>
                      <div className="grid gap-3">
                        <BadgeItemDetailed emoji="🤝" name="Networker" threshold="1+ paid referral" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="📢" name="Influencer" threshold="5+ paid referrals" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🔥" name="Viral Trader" threshold="10+ paid referrals" rarity="EPIC" points={5} />
                        <BadgeItemDetailed emoji="🌟" name="Mega Influencer" threshold="25+ paid referrals" rarity="LEGENDARY" points={10} />
                        <BadgeItemDetailed emoji="👑" name="Ambassador" threshold="50+ paid referrals" rarity="MYTHIC" points={25} />
                      </div>
                    </BadgeCategoryExpanded>

                    {/* PREMIUM BADGES */}
                    <BadgeCategoryExpanded title="💎 Premium & Profile Badges" count={5}>
                      <p className="text-sm text-gray-400 mb-4">Exclusive badges for premium members and profile completionists.</p>
                      <div className="grid gap-3">
                        <BadgeItemDetailed emoji="💎" name="Premium Trader" threshold="Premium member" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🎨" name="Logo Pro" threshold="Custom logo uploaded" rarity="RARE" points={3} />
                        <BadgeItemDetailed emoji="🐦" name="Social Flex" threshold="Twitter linked" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="✈️" name="Telegram Verified" threshold="Telegram linked" rarity="COMMON" points={1} />
                        <BadgeItemDetailed emoji="⭐" name="Full Profile" threshold="100% profile complete" rarity="EPIC" points={5} />
                      </div>
                    </BadgeCategoryExpanded>
                  </div>

                  <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Pro Tip:</strong> Badge points contribute to your overall rank! Collect rare badges to climb the leaderboard faster.
                      Mythic badges are worth 25 points each!
                    </p>
                  </div>
                </Section>

                {/* Upgrade */}
                <Section id="upgrade" title="Upgrade to Premium" icon="💎">
                  <p className="text-gray-300 mb-6">
                    Unlock exclusive features with PREMIUM or PRO tier.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <TierCard
                      tier="FREE"
                      price="Free"
                      features={[
                        'Basic card generated',
                        'Public metrics',
                        'Alpha Feed (72h delay)',
                        'View 5 obfuscated trades',
                        'View leaderboard',
                      ]}
                    />

                    <TierCard
                      tier="PREMIUM"
                      price="0.2 SOL (~$20)"
                      highlight
                      features={[
                        'Everything in FREE +',
                        'Customizable profile',
                        'HD downloadable card',
                        'Alpha Feed (6h delay)',
                        'Referral system',
                        'Participate in challenges',
                        '30 days of PRO FREE',
                      ]}
                    />

                    <TierCard
                      tier="PRO"
                      price="$10/month"
                      features={[
                        'Everything in PREMIUM +',
                        'Alpha Feed (1h delay)',
                        'View 20 full trades',
                        'Advanced dashboard',
                        'Priority support',
                        'Early access to features',
                      ]}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-3">🎉 Launch Offer</h4>
                    <p className="text-gray-200 mb-4">
                      Use code <code className="bg-purple-600 px-3 py-1 rounded font-bold">DEGENLAUNCH2024</code> for:
                    </p>
                    <ul className="space-y-2 text-gray-200">
                      <li>✓ FREE PREMIUM access</li>
                      <li>✓ 30 days of PRO included</li>
                      <li>✓ First 100 users only</li>
                    </ul>
                  </div>
                </Section>

                {/* Daily Check-In */}
                <Section id="daily-checkin" title="Daily Check-In" icon="🔥">
                  <p className="text-gray-300 mb-6">
                    The daily check-in system rewards you for consistent engagement.
                  </p>

                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6 mb-6">
                    <h4 className="text-xl font-bold mb-4">How It Works</h4>
                    <div className="space-y-3 text-gray-200">
                      <p>1. <strong>Visit daily</strong> and click "Check In"</p>
                      <p>2. <strong>Earn XP</strong>: +50 XP base + streak bonus</p>
                      <p>3. <strong>Maintain your streak</strong>: Each consecutive day increases the bonus</p>
                      <p>4. <strong>Unlock badges</strong> at milestones (3, 7, 14, 30, 60, 90, 180 days)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                      <h5 className="font-bold mb-2">Streak Rewards:</h5>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>🔥 1 day</span>
                          <span className="text-green-400">+50 XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥 3 days</span>
                          <span className="text-green-400">+80 XP + "Consistent Degen" Badge</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥 7 days</span>
                          <span className="text-green-400">+120 XP + "Weekly Warrior" Badge</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥 30 days</span>
                          <span className="text-purple-400">+350 XP + "Diamond Hands" Badge</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥🔥 180 days</span>
                          <span className="text-orange-400">+1050 XP + "Immortal" Badge</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-200 text-sm">
                        ⚠️ <strong>Warning:</strong> If you don't check in for 24+ hours, you lose your streak and start over from day 1.
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Referrals */}
                <Section id="referrals" title="Referral System" icon="🎁">
                  <p className="text-gray-300 mb-6">
                    Invite friends and earn amazing rewards. Your referral link: <code className="bg-purple-900/50 px-2 py-1 rounded">degenscore.xyz?ref=YOUR_WALLET</code>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <ReferralTier
                      count={3}
                      title="🎯 Influencer"
                      rewards={['"Influencer" Badge', '+1 month PRO free']}
                    />
                    <ReferralTier
                      count={10}
                      title="🐋 Whale Hunter"
                      rewards={['"Whale Hunter" Badge', '+0.1 SOL']}
                    />
                    <ReferralTier
                      count={25}
                      title="👑 Viral King"
                      rewards={['"Viral King" Badge', '+3 months PRO', '+0.3 SOL']}
                    />
                    <ReferralTier
                      count={50}
                      title="⭐ Legend"
                      rewards={['"Legend" Badge', 'VIP Lifetime', '+1 SOL']}
                    />
                  </div>

                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4">Step by Step</h4>
                    <div className="space-y-3 text-gray-200">
                      <p><strong>1.</strong> Copy your referral link from your dashboard</p>
                      <p><strong>2.</strong> Share it on Twitter, Discord, Telegram, etc.</p>
                      <p><strong>3.</strong> When someone uses your link and pays for PREMIUM, they count as a referral!</p>
                      <p><strong>4.</strong> Check your rewards at /api/referrals/check-rewards</p>
                      <p><strong>5.</strong> Claim rewards when you reach a milestone</p>
                    </div>
                  </div>
                </Section>

                {/* Weekly Challenges */}
                <Section id="challenges" title="Weekly Challenges" icon="⚔️">
                  <p className="text-gray-300 mb-6">
                    Compete weekly for <strong className="text-yellow-400">1 SOL</strong>. Challenges activate when there are <strong>100 cards generated</strong>.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                    <h4 className="text-2xl font-bold text-yellow-400 mb-3">❤️ Most Loved Card Challenge</h4>
                    <p className="text-gray-200 mb-4">
                      Get the most likes on your card and win <strong>1 SOL</strong>.
                    </p>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300">Permanent challenge:</p>
                      <p className="text-lg font-bold text-white mt-2">"❤️ Most Liked Card"</p>
                      <p className="text-sm text-gray-400 mt-1">Winner has most likes at the end of each week. Activates at 100 cards generated.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-lg">How to Participate:</h5>
                    <div className="bg-black/30 border border-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                          <p className="font-bold text-white">Generate Your Card</p>
                          <p className="text-sm text-gray-400">Connect your wallet and generate your DegenScore Card</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                          <p className="font-bold text-white">Upgrade to PREMIUM or PRO</p>
                          <p className="text-sm text-gray-400">Only paid users can participate</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                          <p className="font-bold text-white">Share Your Card</p>
                          <p className="text-sm text-gray-400">Promote your card on Twitter, Discord, Telegram</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">4️⃣</span>
                        <div>
                          <p className="font-bold text-white">Get Likes ❤️</p>
                          <p className="text-sm text-gray-400">Most likes on Sunday wins 1 SOL</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Note:</strong> Only PREMIUM or PRO users can participate in challenges.
                    </p>
                  </div>
                </Section>

                {/* Hot Feed */}
                <Section id="hot-feed" title="Alpha Feed (Hot Trades)" icon="📡">
                  <p className="text-gray-300 mb-6">
                    The Alpha Feed shows real-time trades from Solana's best wallets. Copy the winners!
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <FeedDelayCard tier="FREE" delay="72 hours" />
                    <FeedDelayCard tier="PREMIUM" delay="6 hours" highlight />
                    <FeedDelayCard tier="PRO" delay="1 hour" highlight />
                  </div>

                  <div className="bg-black/30 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4">What You'll See in the Feed:</h4>
                    <div className="space-y-3 text-gray-300">
                      <FeedExample
                        emoji="🟢"
                        action="BUY"
                        wallet="ABC123..."
                        token="$BONK"
                        amount="5 SOL"
                        score={87}
                      />
                      <FeedExample
                        emoji="🔴"
                        action="SELL"
                        wallet="XYZ789..."
                        token="$WIF"
                        amount="12.5 SOL"
                        score={92}
                      />
                    </div>
                  </div>

                  <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ <strong>Disclaimer:</strong> Alpha Feed is informational. We are not financial advisors.
                      DYOR (Do Your Own Research) before copying any trade.
                    </p>
                  </div>
                </Section>

                {/* Leaderboard */}
                <Section id="leaderboard" title="Leaderboard" icon="🏅">
                  <p className="text-gray-300 mb-6">
                    Compete globally and prove who's the best degen. The leaderboard has multiple categories:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <LeaderboardCategory
                      icon="🎯"
                      title="By DegenScore"
                      description="Ranking of the best overall traders (score 0-100)"
                    />
                    <LeaderboardCategory
                      icon="💰"
                      title="By Total Volume"
                      description="Who has moved the most money total"
                    />
                    <LeaderboardCategory
                      icon="📈"
                      title="By Win Rate"
                      description="Highest percentage of successful trades"
                    />
                    <LeaderboardCategory
                      icon="❤️"
                      title="By Likes"
                      description="Most popular cards in the community"
                    />
                  </div>

                  <div className="mt-6 bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h5 className="font-bold mb-3">How to Climb the Ranks:</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong>Trade consistently</strong>: More trades = more data = better score</li>
                      <li>• <strong>Improve your win rate</strong>: Quality over quantity</li>
                      <li>• <strong>Avoid rugs</strong>: Each rug affects your score negatively</li>
                      <li>• <strong>Share your card</strong>: More likes = better ranking in that category</li>
                      <li>• <strong>Hold winners</strong>: Diamond hands are rewarded</li>
                    </ul>
                  </div>
                </Section>

                {/* Tiers */}
                <Section id="tiers" title="Tiers & Complete Benefits" icon="⭐">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-3">Feature</th>
                          <th className="text-center p-3 text-gray-400">FREE</th>
                          <th className="text-center p-3 text-purple-400">PREMIUM</th>
                          <th className="text-center p-3 text-yellow-400">PRO</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <TierRow feature="Basic Card" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Advanced Metrics (30+)" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Badges" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="View Leaderboard" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Customizable Profile" free="—" premium="✓" pro="✓" />
                        <TierRow feature="HD Downloadable Card" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Daily Check-In & XP" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Referral System" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Weekly Challenges" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Alpha Feed Delay" free="72h" premium="6h" pro="1h" />
                        <TierRow feature="Visible Trades" free="5 (hidden)" premium="10" pro="20" />
                        <TierRow feature="Advanced Dashboard" free="—" premium="—" pro="✓" />
                        <TierRow feature="Priority Support" free="—" premium="—" pro="✓" />
                      </tbody>
                    </table>
                  </div>
                </Section>

                {/* FAQ */}
                <Section id="faq" title="Frequently Asked Questions" icon="❓">
                  <div className="space-y-4">
                    <FAQ
                      question="Is generating my card free?"
                      answer="Yes, 100% free. Just connect your Solana wallet and the analysis is automatic."
                    />
                    <FAQ
                      question="How is the DegenScore calculated?"
                      answer="It's a complex algorithm that considers: win rate (30%), profit/loss (25%), volume (15%), experience (15%), risk management (10%), and consistency (5%)."
                    />
                    <FAQ
                      question="Can I regenerate my card?"
                      answer="Yes, you can re-analyze it whenever you want. Your metrics update with your most recent history."
                    />
                    <FAQ
                      question="What wallets are compatible?"
                      answer="Any Solana wallet with transactions on Helius: Phantom, Solflare, Backpack, Ledger, etc."
                    />
                    <FAQ
                      question="Is my data safe?"
                      answer="Yes. We only read public blockchain data. We never ask for your seed phrase or make transactions without your permission."
                    />
                    <FAQ
                      question="How does SOL payment work?"
                      answer="When you upgrade to PREMIUM, you send 0.2 SOL to our treasury wallet. We verify the transaction on-chain and activate your tier automatically."
                    />
                    <FAQ
                      question="Can I cancel my PRO subscription?"
                      answer="Yes, at any time. Your PRO access continues until the current period expires."
                    />
                    <FAQ
                      question="Do referrals have to pay to count?"
                      answer="Yes, only referrals who upgrade to PREMIUM or PRO count. FREE referrals don't count for rewards."
                    />
                    <FAQ
                      question="What happens if I lose my check-in streak?"
                      answer="You start over from day 1. But your longest streak is saved forever in your profile."
                    />
                    <FAQ
                      question="How is the Weekly Challenge winner selected?"
                      answer="At the end of the week, we automatically verify who meets the requirements and has the best metric. The prize is sent within 48 hours."
                    />
                  </div>
                </Section>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400 mb-4">
                  Still have questions? Join our Discord or write to us on Twitter.
                </p>
                <div className="flex justify-center gap-4">
                  <a href="#" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors">
                    Discord
                  </a>
                  <a href="#" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
                    Twitter
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// Component only - loaded dynamically
export { Documentation as default };

// Helper Components

function Section({ id, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="scroll-mt-24"
    >
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <span className="text-4xl">{icon}</span>
        {title}
      </h2>
      <div className="text-gray-300">
        {children}
      </div>
    </motion.section>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-lg mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function ProcessStep({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-gray-200">
      <div className="w-2 h-2 bg-purple-400 rounded-full" />
      <p>{children}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-purple-900/50 border border-purple-500/30 px-2 py-1 rounded text-xs">
      {children}
    </span>
  );
}

function MetricCard({ title, range, description, levels }: any) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg">{title}</h4>
        <span className="text-sm text-purple-400">{range}</span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      {levels && (
        <div className="space-y-1">
          {levels.map((level: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span>{level.emoji} {level.label}</span>
              <span className="text-gray-500">{level.range}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeCategoryExpanded({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-black/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-xl">{title}</h4>
        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{count} badges</span>
      </div>
      {children}
    </div>
  );
}

function BadgeItemDetailed({ emoji, name, threshold, rarity, points }: {
  emoji: string;
  name: string;
  threshold: string;
  rarity: string;
  points: number;
}) {
  const rarityColors: any = {
    COMMON: 'bg-gray-700/50 text-gray-300',
    RARE: 'bg-green-900/50 text-green-300',
    EPIC: 'bg-purple-900/50 text-purple-300',
    LEGENDARY: 'bg-orange-900/50 text-orange-300',
    MYTHIC: 'bg-red-900/50 text-red-300',
  };

  return (
    <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-semibold text-sm text-white">{name}</p>
          <p className="text-xs text-gray-400">{threshold}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`${rarityColors[rarity]} px-2 py-1 rounded text-xs font-bold`}>{rarity}</span>
        <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs font-bold">{points} pts</span>
      </div>
    </div>
  );
}

function RarityCard({ rarity, points, color }: { rarity: string; points: number; color: string }) {
  const colors: any = {
    gray: 'bg-gray-700 text-gray-200',
    green: 'bg-green-900 text-green-200',
    purple: 'bg-purple-900 text-purple-200',
    orange: 'bg-orange-900 text-orange-200',
    red: 'bg-red-900 text-red-200',
  };

  return (
    <div className={`${colors[color]} rounded-lg p-3 text-center`}>
      <p className="font-bold text-xs mb-1">{rarity}</p>
      <p className="text-2xl font-bold">{points}</p>
      <p className="text-xs opacity-75">point{points !== 1 ? 's' : ''}</p>
    </div>
  );
}

function TierCard({ tier, price, features, highlight }: any) {
  return (
    <div className={`rounded-xl p-6 ${highlight ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500' : 'bg-black/30 border border-gray-700'}`}>
      <h4 className="text-xl font-bold mb-2">{tier}</h4>
      <p className={`text-2xl font-bold mb-4 ${highlight ? 'text-purple-400' : 'text-gray-300'}`}>{price}</p>
      <ul className="space-y-2 text-sm">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-purple-400">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReferralTier({ count, title, rewards }: { count: number; title: string; rewards: string[] }) {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
          {count}
        </div>
        <h5 className="font-bold">{title}</h5>
      </div>
      <ul className="space-y-1 text-sm text-gray-300">
        {rewards.map((r, i) => (
          <li key={i}>• {r}</li>
        ))}
      </ul>
    </div>
  );
}

function FeedDelayCard({ tier, delay, highlight }: { tier: string; delay: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center ${highlight ? 'bg-purple-900/50 border-2 border-purple-500' : 'bg-black/30 border border-gray-700'}`}>
      <p className="font-bold mb-1">{tier}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-purple-400' : 'text-gray-400'}`}>{delay}</p>
      <p className="text-xs text-gray-500 mt-1">delay</p>
    </div>
  );
}

function FeedExample({ emoji, action, wallet, token, amount, score }: any) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
      <p>
        <span className="mr-2">{emoji}</span>
        <strong>{action}</strong> by{' '}
        <span className="text-purple-400">{wallet}</span>{' '}
        (Score: {score})
      </p>
      <p className="text-gray-400 text-xs mt-1">
        {token} • {amount}
      </p>
    </div>
  );
}

function LeaderboardCategory({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-4">
      <h5 className="font-bold mb-2">
        <span className="mr-2">{icon}</span>
        {title}
      </h5>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function TierRow({ feature, free, premium, pro }: any) {
  return (
    <tr className="border-b border-gray-800">
      <td className="p-3">{feature}</td>
      <td className="p-3 text-center text-gray-400">{free}</td>
      <td className="p-3 text-center text-purple-400">{premium}</td>
      <td className="p-3 text-center text-yellow-400">{pro}</td>
    </tr>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-800/30 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <span className="text-purple-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-400 text-sm border-t border-gray-800">
          {answer}
        </div>
      )}
    </div>
  );
}

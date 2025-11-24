import { useState } from 'react';
import Head from 'next/head';
import { LanguageSelector } from '../components/LanguageSelector';
import { NavigationButtons } from '../components/NavigationButtons';
import { sections } from './docs/constants';
import { DocSidebar } from './docs/DocSidebar';
import { DocSection } from './docs/DocSection';
import { MetricCard } from './docs/MetricCard';
import { Badge, BadgeCategory, BadgeItem, RarityBadge } from './docs/BadgeComponents';
import { TierCard, ReferralTier, FeedDelayCard, TierRow } from './docs/TierComponents';
import { FAQ } from './docs/FAQ';
import { Step, ProcessStep, FeedExample, LeaderboardCategory } from './docs/Common';

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
        <meta name="description" content="Complete guide to using DegenScore Card" />
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
            <DocSidebar
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-4xl">
              <div className="space-y-12">
                {/* Introduction */}
                <DocSection id="intro" title="Introduction" icon="📖">
                  <p className="text-gray-300 text-lg mb-4">
                    Welcome to <strong className="text-purple-400">DegenScore Card</strong>, the ultimate platform to analyze,
                    gamify, and share your Solana trades.
                  </p>
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-bold mb-3">What is DegenScore?</h4>
                    <p className="text-gray-300 mb-4">
                      DegenScore Card analyzes your Solana wallet and generates a visual card with:
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Advanced Metrics</strong>: 30+ trading statistics (volume, P&L, win rate, rugs, moonshots, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>DegenScore</strong>: A 0-100 score that evaluates your trading ability</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Badges</strong>: Unlockable achievements based on your accomplishments</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Ranking</strong>: Compete in global leaderboards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Alpha Feed</strong>: See trades from top wallets in real-time</span>
                      </li>
                    </ul>
                  </div>
                </DocSection>

                {/* Getting Started */}
                <DocSection id="getting-started" title="Getting Started" icon="🚀">
                  <div className="space-y-4">
                    <Step number={1} title="Connect Your Wallet">
                      <p className="text-gray-300 mb-3">
                        Click the <code className="bg-purple-900/50 px-2 py-1 rounded">Select Wallet</code> button in the top right corner.
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Supported Wallets:</p>
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
                          ⏱️ <strong>Analysis Time:</strong> 10-30 seconds depending on your history
                        </p>
                      </div>
                    </Step>

                    <Step number={3} title="Explore Your Card">
                      <p className="text-gray-300">
                        Review your metrics, badges, and leaderboard position. Your card is your trading identity!
                      </p>
                    </Step>
                  </div>
                </DocSection>

                {/* Generate Card */}
                <DocSection id="generate-card" title="Generate Your Card" icon="🎴">
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
                        <strong>3. Calculation</strong> → Calculate 30+ metrics (win rate, P&L, rugs, moonshots, etc.)
                      </ProcessStep>
                      <ProcessStep>
                        <strong>4. Scoring</strong> → Generate your DegenScore 0-100
                      </ProcessStep>
                      <ProcessStep>
                        <strong>5. Badges</strong> → Assign badges based on your achievements
                      </ProcessStep>
                      <ProcessStep>
                        <strong>6. Card</strong> → Generate your downloadable visual card
                      </ProcessStep>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Tip:</strong> Your card updates automatically every time you re-analyze it.
                      Come back regularly to see how your DegenScore improves!
                    </p>
                  </div>
                </DocSection>

                {/* Understanding Metrics */}
                <DocSection id="understand-metrics" title="Understanding Metrics" icon="📊">
                  <p className="text-gray-300 mb-6">
                    DegenScore Card tracks 30+ metrics. Here are the most important:
                  </p>

                  <div className="space-y-4">
                    <MetricCard
                      title="DegenScore"
                      range="0-100"
                      description="Your overall trader score. Calculated considering win rate, P&L, consistency, experience, and risk management."
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
                      description="Percentage of winning trades. A good win rate is >50%, but it's not the only important metric."
                    />

                    <MetricCard
                      title="Total P&L"
                      range="$-∞ to $∞"
                      description="Total gain or loss in USD. Your net profit/loss considering all trades."
                    />

                    <MetricCard
                      title="Rugs Survived"
                      range="0-∞"
                      description="Number of tokens you bought that turned out to be rugs (>90% decline) but you sold in time."
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
                </DocSection>

                {/* Badges */}
                <DocSection id="badges" title="Badge System" icon="🏆">
                  <p className="text-gray-300 mb-6">
                    Badges are achievements you unlock based on your activities. There are <strong>50+ badges</strong> available.
                  </p>

                  <div className="space-y-4">
                    <BadgeCategory title="🎯 Trading Badges">
                      <BadgeItem name="First Trade" description="Execute your first trade" rarity="COMMON" />
                      <BadgeItem name="Moon Hunter" description="Get a moonshot (10x+)" rarity="RARE" />
                      <BadgeItem name="Rug Survivor" description="Survive 5+ rugs" rarity="EPIC" />
                      <BadgeItem name="Volume King" description="$1M+ in total volume" rarity="LEGENDARY" />
                      <BadgeItem name="Diamond Hands" description="Hold for 30+ days" rarity="RARE" />
                    </BadgeCategory>

                    <BadgeCategory title="🔥 Engagement Badges">
                      <BadgeItem name="Consistent Degen" description="3 consecutive check-ins" rarity="COMMON" />
                      <BadgeItem name="Weekly Warrior" description="7-day streak" rarity="RARE" />
                      <BadgeItem name="Diamond Streak" description="30-day streak" rarity="EPIC" />
                      <BadgeItem name="Immortal" description="180-day streak" rarity="MYTHIC" />
                    </BadgeCategory>

                    <BadgeCategory title="🎁 Referral Badges">
                      <BadgeItem name="Influencer" description="3 paid referrals" rarity="RARE" />
                      <BadgeItem name="Whale Hunter" description="10 referrals" rarity="EPIC" />
                      <BadgeItem name="Viral King" description="25 referrals" rarity="LEGENDARY" />
                      <BadgeItem name="Legend" description="50 referrals" rarity="MYTHIC" />
                    </BadgeCategory>
                  </div>

                  <div className="mt-6 bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                    <h5 className="font-bold mb-2">Badge Rarity:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <RarityBadge color="gray">COMMON</RarityBadge>
                      <RarityBadge color="green">RARE</RarityBadge>
                      <RarityBadge color="purple">EPIC</RarityBadge>
                      <RarityBadge color="orange">LEGENDARY</RarityBadge>
                      <RarityBadge color="red">MYTHIC</RarityBadge>
                    </div>
                  </div>
                </DocSection>

                {/* Upgrade */}
                <DocSection id="upgrade" title="Upgrade to Premium" icon="💎">
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
                      price="0.2 SOL ($20)"
                      highlight
                      features={[
                        'Everything in FREE +',
                        'Customizable profile',
                        'Downloadable HD card',
                        'Alpha Feed (6h delay)',
                        'Referral system',
                        'Participate in challenges',
                        '30 days PRO FREE',
                      ]}
                    />

                    <TierCard
                      tier="PRO"
                      price="$10/month"
                      features={[
                        'Everything in PREMIUM +',
                        'Alpha Feed (1h delay)',
                        'View 20 complete trades',
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
                      <li>✓ Free PREMIUM access</li>
                      <li>✓ 30 days PRO included</li>
                      <li>✓ First 100 users only</li>
                    </ul>
                  </div>
                </DocSection>

                {/* Daily Check-In */}
                <DocSection id="daily-checkin" title="Daily Check-In" icon="🔥">
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
                          <span className="text-green-400">+80 XP + Badge "Consistent Degen"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥 7 days</span>
                          <span className="text-green-400">+120 XP + Badge "Weekly Warrior"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥 30 days</span>
                          <span className="text-purple-400">+350 XP + Badge "Diamond Hands"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥🔥 180 days</span>
                          <span className="text-orange-400">+1050 XP + Badge "Immortal"</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-200 text-sm">
                        ⚠️ <strong>Warning:</strong> If you miss checking in for 24+ hours, you lose your streak and restart from day 1.
                      </p>
                    </div>
                  </div>
                </DocSection>

                {/* Referrals */}
                <DocSection id="referrals" title="Referral System" icon="🎁">
                  <p className="text-gray-300 mb-6">
                    Invite friends and earn incredible rewards. Your referral link: <code className="bg-purple-900/50 px-2 py-1 rounded">degenscore.xyz?ref=YOUR_WALLET</code>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <ReferralTier
                      count={3}
                      title="🎯 Influencer"
                      rewards={['Badge "Influencer"', '+1 month free PRO']}
                    />
                    <ReferralTier
                      count={10}
                      title="🐋 Whale Hunter"
                      rewards={['Badge "Whale Hunter"', '+0.1 SOL']}
                    />
                    <ReferralTier
                      count={25}
                      title="👑 Viral King"
                      rewards={['Badge "Viral King"', '+3 months PRO', '+0.3 SOL']}
                    />
                    <ReferralTier
                      count={50}
                      title="⭐ Legend"
                      rewards={['Badge "Legend"', 'Lifetime VIP', '+1 SOL']}
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
                </DocSection>

                {/* Weekly Challenges */}
                <DocSection id="challenges" title="Weekly Challenges" icon="⚔️">
                  <p className="text-gray-300 mb-6">
                    Compete weekly for <strong className="text-yellow-400">1 SOL</strong>. The challenge activates when there are <strong>100 cards generated</strong>.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                    <h4 className="text-2xl font-bold text-yellow-400 mb-3">❤️ Most Loved Card Challenge</h4>
                    <p className="text-gray-200 mb-4">
                      Get the most likes on your card and win <strong>1 SOL</strong>.
                    </p>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300">Ongoing challenge:</p>
                      <p className="text-lg font-bold text-white mt-2">"❤️ Most Likes on Your Card"</p>
                      <p className="text-sm text-gray-400 mt-1">Winner is whoever has the most likes at the end of each week. Activates when there are 100 cards generated.</p>
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
                          <p className="text-sm text-gray-400">Only paying users can participate</p>
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
                          <p className="text-sm text-gray-400">Whoever has the most likes by Sunday wins 1 SOL</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Note:</strong> Only PREMIUM or PRO users can participate in challenges.
                    </p>
                  </div>
                </DocSection>

                {/* Hot Feed */}
                <DocSection id="hot-feed" title="Alpha Feed (Hot Trades)" icon="📡">
                  <p className="text-gray-300 mb-6">
                    The Alpha Feed shows real-time trades from the best Solana wallets. Copy the winners!
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
                      ⚠️ <strong>Disclaimer:</strong> The Alpha Feed is informational. We are not financial advisors.
                      DYOR (Do Your Own Research) before copying any trade.
                    </p>
                  </div>
                </DocSection>

                {/* Leaderboard */}
                <DocSection id="leaderboard" title="Leaderboard" icon="🏅">
                  <p className="text-gray-300 mb-6">
                    Compete globally and prove who's the best degen. The leaderboard has multiple categories:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <LeaderboardCategory
                      icon="🎯"
                      title="By DegenScore"
                      description="Ranking of the best traders overall (score 0-100)"
                    />
                    <LeaderboardCategory
                      icon="💰"
                      title="By Total Volume"
                      description="Who's moved the most money overall"
                    />
                    <LeaderboardCategory
                      icon="📈"
                      title="By Win Rate"
                      description="Highest percentage of winning trades"
                    />
                    <LeaderboardCategory
                      icon="❤️"
                      title="By Likes"
                      description="Most popular cards in the community"
                    />
                  </div>

                  <div className="mt-6 bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h5 className="font-bold mb-3">How to Climb the Ranking:</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong>Trade consistently</strong>: More trades = more data = better score</li>
                      <li>• <strong>Improve your win rate</strong>: Quality over quantity</li>
                      <li>• <strong>Avoid rugs</strong>: Each rug negatively affects your score</li>
                      <li>• <strong>Share your card</strong>: More likes = better ranking in that category</li>
                      <li>• <strong>Hold winners</strong>: Diamond hands get rewarded</li>
                    </ul>
                  </div>
                </DocSection>

                {/* Tiers */}
                <DocSection id="tiers" title="Tiers & Complete Benefits" icon="⭐">
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
                        <TierRow feature="Downloadable HD Card" free="—" premium="✓" pro="✓" />
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
                </DocSection>

                {/* FAQ */}
                <DocSection id="faq" title="Frequently Asked Questions" icon="❓">
                  <div className="space-y-4">
                    <FAQ
                      question="Is it free to generate my card?"
                      answer="Yes, 100% free. You just need to connect your Solana wallet and the analysis is automatic."
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
                      answer="Yes. We only read public blockchain data. We never ask for your seed phrase and don't make transactions without your permission."
                    />
                    <FAQ
                      question="How does payment with SOL work?"
                      answer="When you upgrade to PREMIUM, you send 0.2 SOL to our treasury wallet. We verify the on-chain transaction and activate your tier automatically."
                    />
                    <FAQ
                      question="Can I cancel my PRO subscription?"
                      answer="Yes, anytime. Your PRO access continues until the current period expires."
                    />
                    <FAQ
                      question="Do referrals have to pay for them to count?"
                      answer="Yes, only referrals that upgrade to PREMIUM or PRO count. FREE referrals don't count for rewards."
                    />
                    <FAQ
                      question="What happens if I lose my check-in streak?"
                      answer="You restart from day 1. But your longest streak is saved forever on your profile."
                    />
                    <FAQ
                      question="How is the Weekly Challenge winner selected?"
                      answer="At the end of the week, we automatically verify who meets the requirements and has the best metric. The prize is sent within 48 hours."
                    />
                  </div>
                </DocSection>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400 mb-4">
                  Still have questions? Join our Discord or message us on Twitter.
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
export default Documentation;

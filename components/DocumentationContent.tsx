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
        <title>Documentación - DegenScore Card</title>
        <meta name="description" content="Guía completa de uso de DegenScore Card" />
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
                        <span><strong>DegenScore</strong>: A 0-100 score evaluating your trading skills</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Badges</strong>: Unlockable achievements based on your accomplishments</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Rankings</strong>: Compete on global leaderboards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Alpha Feed</strong>: See top wallet trades in real-time</span>
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
                      Come back regularly to see how your DegenScore improves!
                    </p>
                  </div>
                </DocSection>

                {/* Understanding Metrics */}
                <DocSection id="understand-metrics" title="Understanding Metrics" icon="📊">
                  <p className="text-gray-300 mb-6">
                    DegenScore Card tracks over 30 metrics. Here are the most important ones:
                  </p>

                  <div className="space-y-4">
                    <MetricCard
                      title="DegenScore"
                      range="0-100"
                      description="Your overall trading score. Calculated considering win rate, P&L, consistency, experience, and risk management."
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
                      description="Number of tokens you bought that ended up being rugs (>90% drop) but you sold in time."
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

                {/* Badges & Achievement Points */}
                <DocSection id="badges" title="Badges & Achievement Points" icon="🏆">
                  <p className="text-gray-300 mb-6">
                    Badges are achievements you unlock based on your activities. There are <strong>60+ badges</strong> available across 6 categories.
                  </p>

                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-xl p-6 mb-6">
                    <h4 className="text-2xl font-black mb-4">Achievement Points System</h4>
                    <p className="text-gray-200 mb-4">
                      Each badge you unlock adds points to your total <strong>Badge Points</strong> score. Higher rarity badges give more points:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-center">
                        <div className="text-gray-300 font-bold text-sm">COMMON</div>
                        <div className="text-2xl font-black text-green-400 mt-1">+1</div>
                        <div className="text-xs text-gray-400">point</div>
                      </div>
                      <div className="bg-blue-800/50 border border-blue-500 rounded-lg p-3 text-center">
                        <div className="text-blue-300 font-bold text-sm">RARE</div>
                        <div className="text-2xl font-black text-green-400 mt-1">+3</div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                      <div className="bg-purple-800/50 border border-purple-500 rounded-lg p-3 text-center">
                        <div className="text-purple-300 font-bold text-sm">EPIC</div>
                        <div className="text-2xl font-black text-green-400 mt-1">+5</div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                      <div className="bg-yellow-800/50 border border-yellow-500 rounded-lg p-3 text-center">
                        <div className="text-yellow-300 font-bold text-sm">LEGENDARY</div>
                        <div className="text-2xl font-black text-green-400 mt-1">+10</div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                      <div className="bg-pink-800/50 border border-pink-500 rounded-lg p-3 text-center">
                        <div className="text-pink-300 font-bold text-sm">MYTHIC</div>
                        <div className="text-2xl font-black text-green-400 mt-1">+25</div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </div>
                    <div className="mt-4 bg-black/30 rounded-lg p-3 text-sm text-gray-300">
                      💡 <strong>Tip:</strong> View all 60+ badges with full details on the <a href="/achievements" className="text-purple-400 hover:text-purple-300 underline">Achievements Page</a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <BadgeCategory title="🎯 Trading Badges">
                      <BadgeItem name="First Trade" description="Execute your first trade" rarity="COMMON" />
                      <BadgeItem name="Moon Hunter" description="Get a moonshot (10x+)" rarity="RARE" />
                      <BadgeItem name="Rug Survivor" description="Survive 5+ rugs" rarity="EPIC" />
                      <BadgeItem name="Volume King" description="$1M+ in total volume" rarity="LEGENDARY" />
                      <BadgeItem name="Diamond Hands" description="Hold 30+ days" rarity="RARE" />
                    </BadgeCategory>

                    <BadgeCategory title="🔥 Engagement Badges">
                      <BadgeItem name="Consistent Degen" description="3 consecutive check-in days" rarity="COMMON" />
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
                    <h5 className="font-bold mb-2">Badge Rarities:</h5>
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
                    Unlock exclusive features with PREMIUM o PRO tier.
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
                        'Everything from FREE +',
                        'Customizable profile',
                        'Downloadable HD card',
                        'Alpha Feed (6h delay)',
                        'Referral system',
                        'Participate in challenges',
                        '30 days of PRO FREE',
                      ]}
                    />

                    <TierCard
                      tier="PRO"
                      price="$10/mes"
                      features={[
                        'Everything from PREMIUM +',
                        'Alpha Feed (1h delay)',
                        'View 20 complete trades',
                        'Advanced dashboard',
                        'Priority support',
                        'Early access to features',
                      ]}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-xl p-6">
                    <h4 className="text-2xl font-bold mb-3">🎉 Oferta de Lanzamiento</h4>
                    <p className="text-gray-200 mb-4">
                      Usa el código <code className="bg-purple-600 px-3 py-1 rounded font-bold">DEGENLAUNCH2024</code> para:
                    </p>
                    <ul className="space-y-2 text-gray-200">
                      <li>✓ Acceso PREMIUM gratis</li>
                      <li>✓ 30 días de PRO incluidos</li>
                      <li>✓ Primeros 100 usuarios solamente</li>
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
                      <p>1. <strong>Visit daily</strong> y haz clic en "Check In"</p>
                      <p>2. <strong>Earn XP</strong>: +50 XP base + bonus por racha</p>
                      <p>3. <strong>Maintain your streak</strong>: Cada día consecutivo aumenta el bonus</p>
                      <p>4. <strong>Unlock badges</strong> en milestones (3, 7, 14, 30, 60, 90, 180 días)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                      <h5 className="font-bold mb-2">Recompensas por Racha:</h5>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>🔥 1 día</span>
                          <span className="text-green-400">+50 XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥 3 días</span>
                          <span className="text-green-400">+80 XP + Badge "Consistent Degen"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥 7 días</span>
                          <span className="text-green-400">+120 XP + Badge "Weekly Warrior"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥 30 días</span>
                          <span className="text-purple-400">+350 XP + Badge "Diamond Hands"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥🔥🔥🔥🔥 180 días</span>
                          <span className="text-orange-400">+1050 XP + Badge "Immortal"</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-200 text-sm">
                        ⚠️ <strong>Cuidado:</strong> Si no checkeas por 24+ horas, pierdes tu racha y vuelves a empezar desde 1 día.
                      </p>
                    </div>
                  </div>
                </DocSection>

                {/* Referidos */}
                <DocSection id="referrals" title="Referral System" icon="🎁">
                  <p className="text-gray-300 mb-6">
                    Invite friends and earn incredible rewards. Your referral link: <code className="bg-purple-900/50 px-2 py-1 rounded">degenscore.xyz?ref=YOUR_WALLET</code>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <ReferralTier
                      count={3}
                      title="🎯 Influencer"
                      rewards={['Badge "Influencer"', '+1 mes PRO gratis']}
                    />
                    <ReferralTier
                      count={10}
                      title="🐋 Whale Hunter"
                      rewards={['Badge "Whale Hunter"', '+0.1 SOL']}
                    />
                    <ReferralTier
                      count={25}
                      title="👑 Viral King"
                      rewards={['Badge "Viral King"', '+3 meses PRO', '+0.3 SOL']}
                    />
                    <ReferralTier
                      count={50}
                      title="⭐ Legend"
                      rewards={['Badge "Legend"', 'VIP Lifetime', '+1 SOL']}
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
                    Compete weekly for <strong className="text-yellow-400">1 SOL</strong>. El challenge se activa cuando haya <strong>100 cards generadas</strong>.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                    <h4 className="text-2xl font-bold text-yellow-400 mb-3">❤️ Most Loved Card Challenge</h4>
                    <p className="text-gray-200 mb-4">
                      Get the most likes on your card and win <strong>1 SOL</strong>.
                    </p>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300">Challenge permanente:</p>
                      <p className="text-lg font-bold text-white mt-2">"❤️ Más Likes en tu Card"</p>
                      <p className="text-sm text-gray-400 mt-1">Gana quien tenga más likes al final de cada semana. Se activa cuando haya 100 cards generadas.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-lg">Cómo Participar:</h5>
                    <div className="bg-black/30 border border-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                          <p className="font-bold text-white">Genera tu Card</p>
                          <p className="text-sm text-gray-400">Conecta tu wallet y genera tu DegenScore Card</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                          <p className="font-bold text-white">Upgrade a PREMIUM o PRO</p>
                          <p className="text-sm text-gray-400">Solo usuarios pagos pueden participar</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                          <p className="font-bold text-white">Comparte tu Card</p>
                          <p className="text-sm text-gray-400">Promociona tu card en Twitter, Discord, Telegram</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">4️⃣</span>
                        <div>
                          <p className="font-bold text-white">Consigue Likes ❤️</p>
                          <p className="text-sm text-gray-400">El que tenga más likes al domingo gana 1 SOL</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Nota:</strong> Solo usuarios PREMIUM o PRO pueden participar en challenges.
                    </p>
                  </div>
                </DocSection>

                {/* Hot Feed */}
                <DocSection id="hot-feed" title="Alpha Feed (Hot Trades)" icon="📡">
                  <p className="text-gray-300 mb-6">
                    El Alpha Feed muestra trades en tiempo real de las mejores wallets de Solana. ¡Copia a los winners!
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <FeedDelayCard tier="FREE" delay="72 horas" />
                    <FeedDelayCard tier="PREMIUM" delay="6 horas" highlight />
                    <FeedDelayCard tier="PRO" delay="1 hora" highlight />
                  </div>

                  <div className="bg-black/30 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4">Qué Verás en el Feed:</h4>
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
                      ⚠️ <strong>Disclaimer:</strong> El Alpha Feed es informativo. No somos asesores financieros.
                      DYOR (Do Your Own Research) antes de copiar cualquier trade.
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
                      title="Por DegenScore"
                      description="Ranking de los mejores traders overall (score 0-100)"
                    />
                    <LeaderboardCategory
                      icon="💰"
                      title="Por Volumen Total"
                      description="Quién ha movido más dinero en total"
                    />
                    <LeaderboardCategory
                      icon="📈"
                      title="Por Win Rate"
                      description="Mayor porcentaje de trades exitosos"
                    />
                    <LeaderboardCategory
                      icon="❤️"
                      title="Por Likes"
                      description="Cards más populares de la comunidad"
                    />
                  </div>

                  <div className="mt-6 bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h5 className="font-bold mb-3">How to Climb the Rankings:</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong>Trade consistently</strong>: More trades = more data = better score</li>
                      <li>• <strong>Improve your win rate</strong>: Quality over quantity</li>
                      <li>• <strong>Avoid rugs</strong>: Each rug negatively affects your score</li>
                      <li>• <strong>Share your card</strong>: More likes = better ranking in that category</li>
                      <li>• <strong>Hold winners</strong>: Diamond hands are rewarded</li>
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
                        <TierRow feature="Card Básica" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Métricas Avanzadas (30+)" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Badges" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Ver Leaderboard" free="✓" premium="✓" pro="✓" />
                        <TierRow feature="Perfil Personalizable" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Card Descargable HD" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Daily Check-In & XP" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Sistema de Referidos" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Weekly Challenges" free="—" premium="✓" pro="✓" />
                        <TierRow feature="Alpha Feed Delay" free="72h" premium="6h" pro="1h" />
                        <TierRow feature="Trades Visibles" free="5 (hidden)" premium="10" pro="20" />
                        <TierRow feature="Dashboard Avanzado" free="—" premium="—" pro="✓" />
                        <TierRow feature="Priority Support" free="—" premium="—" pro="✓" />
                      </tbody>
                    </table>
                  </div>
                </DocSection>

                {/* FAQ */}
                <DocSection id="faq" title="Frequently Asked Questions" icon="❓">
                  <div className="space-y-4">
                    <FAQ
                      question="¿Es gratis generar mi card?"
                      answer="Sí, 100% gratis. Solo necesitas conectar tu wallet de Solana y el análisis es automático."
                    />
                    <FAQ
                      question="¿Cómo se calcula el DegenScore?"
                      answer="Es un algoritmo complejo que considera: win rate (30%), profit/loss (25%), volumen (15%), experiencia (15%), gestión de riesgo (10%), y consistencia (5%)."
                    />
                    <FAQ
                      question="¿Puedo regenerar mi card?"
                      answer="Sí, puedes volver a analizarla cuando quieras. Tus métricas se actualizan con tu historial más reciente."
                    />
                    <FAQ
                      question="¿Qué wallets son compatibles?"
                      answer="Cualquier wallet de Solana con transacciones en Helius: Phantom, Solflare, Backpack, Ledger, etc."
                    />
                    <FAQ
                      question="¿Mis datos están seguros?"
                      answer="Sí. Solo leemos data pública de la blockchain. Nunca pedimos tu seed phrase ni hacemos transacciones sin tu permiso."
                    />
                    <FAQ
                      question="¿Cómo funciona el pago con SOL?"
                      answer="Cuando upgradeas a PREMIUM, envías 0.2 SOL a nuestra treasury wallet. Verificamos la transacción on-chain y activamos tu tier automáticamente."
                    />
                    <FAQ
                      question="¿Puedo cancelar mi suscripción PRO?"
                      answer="Sí, en cualquier momento. Tu acceso PRO continúa hasta que expire el periodo actual."
                    />
                    <FAQ
                      question="¿Los referidos tienen que pagar para que cuenten?"
                      answer="Sí, solo cuentan los referidos que upgraden a PREMIUM o PRO. Referidos FREE no cuentan para rewards."
                    />
                    <FAQ
                      question="¿Qué pasa si pierdo mi racha de check-in?"
                      answer="Vuelves a empezar desde 1 día. Pero tu longest streak se guarda para siempre en tu perfil."
                    />
                    <FAQ
                      question="¿Cómo se selecciona el ganador del Weekly Challenge?"
                      answer="Al final de la semana, automáticamente verificamos quién cumple los requisitos y tiene la mejor métrica. El premio se envía en las 48h siguientes."
                    />
                  </div>
                </DocSection>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400 mb-4">
                  Still have questions? Únete a nuestro Discord o escríbenos en Twitter.
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

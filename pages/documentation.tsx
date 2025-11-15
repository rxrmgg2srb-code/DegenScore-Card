import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { LanguageSelector } from '../components/LanguageSelector';

interface Section {
  id: string;
  title: string;
  icon: string;
}

const sections: Section[] = [
  { id: 'intro', title: 'Introducción', icon: '📖' },
  { id: 'getting-started', title: 'Primeros Pasos', icon: '🚀' },
  { id: 'generate-card', title: 'Generar Tu Card', icon: '🎴' },
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

export default function Documentation() {
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                📚 DegenScore Documentation
              </h1>
              <div className="flex items-center gap-4">
                <LanguageSelector />
                <a
                  href="/"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ← Volver al Inicio
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                <h2 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Contenido
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        activeSection === section.id
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
                {/* Introducción */}
                <Section id="intro" title="Introducción" icon="📖">
                  <p className="text-gray-300 text-lg mb-4">
                    Bienvenido a <strong className="text-purple-400">DegenScore Card</strong>, la plataforma definitiva para analizar,
                    gamificar y compartir tus trades en Solana.
                  </p>
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-bold mb-3">¿Qué es DegenScore?</h4>
                    <p className="text-gray-300 mb-4">
                      DegenScore Card analiza tu wallet de Solana y genera una tarjeta visual con:
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Métricas avanzadas</strong>: 30+ estadísticas de trading (volumen, P&L, win rate, rugs, moonshots, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>DegenScore</strong>: Un score de 0-100 que evalúa tu habilidad como trader</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Badges</strong>: Logros desbloqueables basados en tus hazañas</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Ranking</strong>: Compite en leaderboards globales</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span><strong>Alpha Feed</strong>: Ve los trades de las mejores wallets en tiempo real</span>
                      </li>
                    </ul>
                  </div>
                </Section>

                {/* Primeros Pasos */}
                <Section id="getting-started" title="Primeros Pasos" icon="🚀">
                  <div className="space-y-4">
                    <Step number={1} title="Conecta tu Wallet">
                      <p className="text-gray-300 mb-3">
                        Haz clic en el botón <code className="bg-purple-900/50 px-2 py-1 rounded">Select Wallet</code> en la parte superior derecha.
                      </p>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Wallets soportadas:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Badge>Phantom</Badge>
                          <Badge>Solflare</Badge>
                          <Badge>Backpack</Badge>
                          <Badge>Ledger</Badge>
                        </div>
                      </div>
                    </Step>

                    <Step number={2} title="Analiza tu Wallet">
                      <p className="text-gray-300 mb-3">
                        Una vez conectado, el sistema automáticamente:
                      </p>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Escanea tu historial de trades usando Helius API</li>
                        <li>• Calcula más de 30 métricas avanzadas</li>
                        <li>• Genera tu DegenScore (0-100)</li>
                        <li>• Asigna badges basados en tus logros</li>
                      </ul>
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-200 text-sm">
                          ⏱️ <strong>Tiempo de análisis:</strong> 10-30 segundos dependiendo de tu historial
                        </p>
                      </div>
                    </Step>

                    <Step number={3} title="Explora tu Card">
                      <p className="text-gray-300">
                        Revisa tus métricas, badges, y posición en el leaderboard. ¡Tu card es tu identidad de trader!
                      </p>
                    </Step>
                  </div>
                </Section>

                {/* Generar Card */}
                <Section id="generate-card" title="Generar Tu Card" icon="🎴">
                  <p className="text-gray-300 mb-4">
                    Tu DegenScore Card es completamente <strong>GRATIS</strong> de generar. Aquí está el proceso:
                  </p>

                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h4 className="text-xl font-bold mb-4">Proceso de Generación</h4>
                    <div className="space-y-4">
                      <ProcessStep>
                        <strong>1. Conexión</strong> → Conectas tu wallet de Solana
                      </ProcessStep>
                      <ProcessStep>
                        <strong>2. Análisis</strong> → Nuestro sistema analiza tu historial completo de trades
                      </ProcessStep>
                      <ProcessStep>
                        <strong>3. Cálculo</strong> → Se calculan 30+ métricas (win rate, P&L, rugs, moonshots, etc.)
                      </ProcessStep>
                      <ProcessStep>
                        <strong>4. Scoring</strong> → Se genera tu DegenScore de 0-100
                      </ProcessStep>
                      <ProcessStep>
                        <strong>5. Badges</strong> → Se asignan badges según tus logros
                      </ProcessStep>
                      <ProcessStep>
                        <strong>6. Card</strong> → Se genera tu tarjeta visual descargable
                      </ProcessStep>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      💡 <strong>Tip:</strong> Tu card se actualiza automáticamente cada vez que vuelves a analizarla.
                      Vuelve regularmente para ver cómo mejora tu DegenScore!
                    </p>
                  </div>
                </Section>

                {/* Entender Métricas */}
                <Section id="understand-metrics" title="Entender Métricas" icon="📊">
                  <p className="text-gray-300 mb-6">
                    DegenScore Card rastrea más de 30 métricas. Aquí las más importantes:
                  </p>

                  <div className="space-y-4">
                    <MetricCard
                      title="DegenScore"
                      range="0-100"
                      description="Tu puntuación general como trader. Se calcula considerando win rate, P&L, consistencia, experiencia, y gestión de riesgo."
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
                      description="Porcentaje de trades ganadores. Un buen win rate es >50%, pero no es lo único importante."
                    />

                    <MetricCard
                      title="Total P&L"
                      range="$-∞ a $∞"
                      description="Ganancia o pérdida total en USD. Tu profit/loss neto considerando todos los trades."
                    />

                    <MetricCard
                      title="Rugs Survived"
                      range="0-∞"
                      description="Cantidad de tokens que compraste que terminaron siendo rugs (>90% de caída) pero vendiste a tiempo."
                    />

                    <MetricCard
                      title="Moonshots"
                      range="0-∞"
                      description="Trades con ganancias de +1000% (10x o más). El sueño de todo degen."
                    />

                    <MetricCard
                      title="Diamond Hands"
                      range="0-∞"
                      description="Tokens que holdeaste por más de 30 días. Paciencia de diamante 💎"
                    />

                    <MetricCard
                      title="Quick Flips"
                      range="0-∞"
                      description="Trades ejecutados en menos de 1 hora. Velocidad pura ⚡"
                    />
                  </div>
                </Section>

                {/* Badges */}
                <Section id="badges" title="Sistema de Badges" icon="🏆">
                  <p className="text-gray-300 mb-6">
                    Los badges son logros que desbloqueas basados en tus actividades. Hay <strong>50+ badges</strong> disponibles.
                  </p>

                  <div className="space-y-4">
                    <BadgeCategory title="🎯 Badges de Trading">
                      <BadgeItem name="First Trade" description="Ejecuta tu primer trade" rarity="COMMON" />
                      <BadgeItem name="Moon Hunter" description="Consigue un moonshot (10x+)" rarity="RARE" />
                      <BadgeItem name="Rug Survivor" description="Sobrevive a 5+ rugs" rarity="EPIC" />
                      <BadgeItem name="Volume King" description="$1M+ en volumen total" rarity="LEGENDARY" />
                      <BadgeItem name="Diamond Hands" description="Holdea 30+ días" rarity="RARE" />
                    </BadgeCategory>

                    <BadgeCategory title="🔥 Badges de Engagement">
                      <BadgeItem name="Consistent Degen" description="3 días de check-in seguidos" rarity="COMMON" />
                      <BadgeItem name="Weekly Warrior" description="7 días de racha" rarity="RARE" />
                      <BadgeItem name="Diamond Streak" description="30 días de racha" rarity="EPIC" />
                      <BadgeItem name="Immortal" description="180 días de racha" rarity="MYTHIC" />
                    </BadgeCategory>

                    <BadgeCategory title="🎁 Badges de Referidos">
                      <BadgeItem name="Influencer" description="3 referidos que pagaron" rarity="RARE" />
                      <BadgeItem name="Whale Hunter" description="10 referidos" rarity="EPIC" />
                      <BadgeItem name="Viral King" description="25 referidos" rarity="LEGENDARY" />
                      <BadgeItem name="Legend" description="50 referidos" rarity="MYTHIC" />
                    </BadgeCategory>
                  </div>

                  <div className="mt-6 bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                    <h5 className="font-bold mb-2">Rareza de Badges:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <RarityBadge color="gray">COMMON</RarityBadge>
                      <RarityBadge color="green">RARE</RarityBadge>
                      <RarityBadge color="purple">EPIC</RarityBadge>
                      <RarityBadge color="orange">LEGENDARY</RarityBadge>
                      <RarityBadge color="red">MYTHIC</RarityBadge>
                    </div>
                  </div>
                </Section>

                {/* Upgrade */}
                <Section id="upgrade" title="Upgrade a Premium" icon="💎">
                  <p className="text-gray-300 mb-6">
                    Desbloquea features exclusivos con PREMIUM o PRO tier.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <TierCard
                      tier="FREE"
                      price="Gratis"
                      features={[
                        'Card básica generada',
                        'Métricas públicas',
                        'Alpha Feed (72h delay)',
                        'Ver 5 trades obfuscados',
                        'Ver leaderboard',
                      ]}
                    />

                    <TierCard
                      tier="PREMIUM"
                      price="0.2 SOL ($20)"
                      highlight
                      features={[
                        'Todo de FREE +',
                        'Perfil personalizable',
                        'Card descargable HD',
                        'Alpha Feed (6h delay)',
                        'Sistema de referidos',
                        'Participar en challenges',
                        '30 días de PRO GRATIS',
                      ]}
                    />

                    <TierCard
                      tier="PRO"
                      price="$10/mes"
                      features={[
                        'Todo de PREMIUM +',
                        'Alpha Feed (1h delay)',
                        'Ver 20 trades completos',
                        'Dashboard avanzado',
                        'Priority support',
                        'Acceso early a features',
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
                </Section>

                {/* Daily Check-In */}
                <Section id="daily-checkin" title="Check-In Diario" icon="🔥">
                  <p className="text-gray-300 mb-6">
                    El sistema de check-in diario te recompensa por engagement constante.
                  </p>

                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6 mb-6">
                    <h4 className="text-xl font-bold mb-4">Cómo Funciona</h4>
                    <div className="space-y-3 text-gray-200">
                      <p>1. <strong>Visita diariamente</strong> y haz clic en "Check In"</p>
                      <p>2. <strong>Gana XP</strong>: +50 XP base + bonus por racha</p>
                      <p>3. <strong>Mantén tu racha</strong>: Cada día consecutivo aumenta el bonus</p>
                      <p>4. <strong>Desbloquea badges</strong> en milestones (3, 7, 14, 30, 60, 90, 180 días)</p>
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
                </Section>

                {/* Referidos */}
                <Section id="referrals" title="Sistema de Referidos" icon="🎁">
                  <p className="text-gray-300 mb-6">
                    Invita amigos y gana recompensas increíbles. Tu link de referido: <code className="bg-purple-900/50 px-2 py-1 rounded">degenscore.xyz?ref=TU_WALLET</code>
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
                    <h4 className="text-xl font-bold mb-4">Paso a Paso</h4>
                    <div className="space-y-3 text-gray-200">
                      <p><strong>1.</strong> Copia tu link de referido desde tu dashboard</p>
                      <p><strong>2.</strong> Compártelo en Twitter, Discord, Telegram, etc.</p>
                      <p><strong>3.</strong> Cuando alguien use tu link y pague PREMIUM, ¡cuenta como referido!</p>
                      <p><strong>4.</strong> Checkea tus rewards en /api/referrals/check-rewards</p>
                      <p><strong>5.</strong> Reclama recompensas cuando alcances un milestone</p>
                    </div>
                  </div>
                </Section>

                {/* Weekly Challenges */}
                <Section id="challenges" title="Weekly Challenges" icon="⚔️">
                  <p className="text-gray-300 mb-6">
                    Compite semanalmente por <strong className="text-yellow-400">1 SOL</strong>. El challenge se activa cuando haya <strong>100 cards generadas</strong>.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                    <h4 className="text-2xl font-bold text-yellow-400 mb-3">❤️ Most Loved Card Challenge</h4>
                    <p className="text-gray-200 mb-4">
                      Consigue el mayor número de likes en tu card y gana <strong>1 SOL</strong>.
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
                </Section>

                {/* Hot Feed */}
                <Section id="hot-feed" title="Alpha Feed (Hot Trades)" icon="📡">
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
                </Section>

                {/* Leaderboard */}
                <Section id="leaderboard" title="Leaderboard" icon="🏅">
                  <p className="text-gray-300 mb-6">
                    Compite globalmente y demuestra quién es el mejor degen. El leaderboard tiene múltiples categorías:
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
                    <h5 className="font-bold mb-3">Cómo Subir en el Ranking:</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong>Tradea consistentemente</strong>: Más trades = más data = mejor score</li>
                      <li>• <strong>Mejora tu win rate</strong>: Calidad sobre cantidad</li>
                      <li>• <strong>Evita rugs</strong>: Cada rug afecta tu score negativamente</li>
                      <li>• <strong>Comparte tu card</strong>: Más likes = mejor ranking en esa categoría</li>
                      <li>• <strong>Holdea winners</strong>: Diamond hands se recompensa</li>
                    </ul>
                  </div>
                </Section>

                {/* Tiers */}
                <Section id="tiers" title="Tiers & Beneficios Completos" icon="⭐">
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
                </Section>

                {/* FAQ */}
                <Section id="faq" title="Preguntas Frecuentes" icon="❓">
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
                </Section>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400 mb-4">
                  ¿Aún tienes dudas? Únete a nuestro Discord o escríbenos en Twitter.
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

function BadgeCategory({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-4">
      <h4 className="font-bold mb-3">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function BadgeItem({ name, description, rarity }: { name: string; description: string; rarity: string }) {
  const colors: any = {
    COMMON: 'text-gray-400',
    RARE: 'text-green-400',
    EPIC: 'text-purple-400',
    LEGENDARY: 'text-orange-400',
    MYTHIC: 'text-red-400',
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span className={`text-xs font-bold ${colors[rarity]}`}>{rarity}</span>
    </div>
  );
}

function RarityBadge({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: any = {
    gray: 'bg-gray-700 text-gray-300',
    green: 'bg-green-900/50 text-green-300 border-green-500/30',
    purple: 'bg-purple-900/50 text-purple-300 border-purple-500/30',
    orange: 'bg-orange-900/50 text-orange-300 border-orange-500/30',
    red: 'bg-red-900/50 text-red-300 border-red-500/30',
  };

  return (
    <div className={`${colors[color]} border px-2 py-1 rounded text-xs font-bold text-center`}>
      {children}
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

function ChallengeType({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
      <p className="font-bold text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
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

import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitch from '../components/LanguageSwitch';

export default function Documentation() {
  const { t, language } = useLanguage();

  const content = {
    en: {
      sections: [
        {
          title: '🚀 Getting Started',
          items: [
            {
              title: 'What is DegenScore?',
              content: 'DegenScore is an advanced trading analytics platform for Solana traders. It analyzes your wallet activity and generates a comprehensive score based on your trading performance, strategy, and risk management.'
            },
            {
              title: 'How to Generate Your Card',
              content: 'Simply connect your Solana wallet and click "Generate Card". Our system will analyze your trading history and create a unique DegenScore card showcasing your stats.'
            },
            {
              title: 'Understanding Your Score',
              content: 'Your DegenScore ranges from 0-100 and is calculated based on multiple factors including win rate, profit, volume, consistency, and risk management. Higher scores indicate superior trading performance.'
            }
          ]
        },
        {
          title: '🎯 Features',
          items: [
            {
              title: 'Tier System',
              content: 'Players are ranked into 5 tiers: Plankton (0-30), Fish (31-50), Dolphin (51-70), Shark (71-85), and Whale (86-100). Each tier reflects your trading mastery level.'
            },
            {
              title: 'Premium Access',
              content: 'Mint your card for 1 SOL to unlock Premium features including: 30-day PRO trial, Alpha Feed access, weekly challenges, and permanent card ownership.'
            },
            {
              title: 'Alpha Feed',
              content: 'Track top Solana traders in real-time. FREE users get 72h delayed data, PREMIUM users get 6h delay, and PRO users get near real-time (1h delay) alpha.'
            },
            {
              title: 'Weekly Challenges',
              content: 'Compete in weekly challenges for 3 SOL prizes. Challenges rotate between: Most Loved Card, Profit King, Win Rate Champion, Volume Leader, and Best Single Trade.'
            },
            {
              title: 'Card Comparison',
              content: 'Compare your DegenScore card with any other wallet to see how you stack up against other traders.'
            }
          ]
        },
        {
          title: '❓ FAQ',
          items: [
            {
              title: 'How much does it cost?',
              content: 'Generating a card is FREE. Premium features (minting) cost 1 SOL, which includes a 30-day PRO trial and permanent PREMIUM access.'
            },
            {
              title: 'What blockchain is supported?',
              content: 'Currently, we only support Solana. Support for other chains may be added in the future.'
            },
            {
              title: 'How often is data updated?',
              content: 'FREE: 72h delay, PREMIUM: 6h delay, PRO: 1h delay (near real-time). Card stats are updated when you regenerate your card.'
            },
            {
              title: 'Can I share my card?',
              content: 'Yes! After minting, you can share your card on Twitter/X and participate in our viral sharing program.'
            },
            {
              title: 'What wallets are supported?',
              content: 'We support Phantom, Solflare, and all major Solana wallets via the Solana Wallet Adapter.'
            }
          ]
        },
        {
          title: '💎 Pricing',
          items: [
            {
              title: 'FREE Tier',
              content: '• Generate unlimited cards\n• View basic stats\n• 72h delayed Alpha Feed\n• Limited to 5 trades visible'
            },
            {
              title: 'PREMIUM Tier (1 SOL one-time)',
              content: '• 30-day PRO trial\n• Permanent PREMIUM access after trial\n• 6h delayed Alpha Feed\n• 10 trades visible\n• Full stats visibility\n• Share modal access\n• Weekly challenge participation'
            },
            {
              title: 'PRO Tier ($10/month or trial)',
              content: '• Near real-time (1h delay) Alpha Feed\n• 20 trades visible\n• Complete transparency\n• Priority analytics\n• Advanced metrics'
            }
          ]
        }
      ]
    },
    es: {
      sections: [
        {
          title: '🚀 Primeros Pasos',
          items: [
            {
              title: '¿Qué es DegenScore?',
              content: 'DegenScore es una plataforma avanzada de análisis de trading para traders de Solana. Analiza la actividad de tu billetera y genera un puntaje completo basado en tu rendimiento, estrategia y gestión de riesgos.'
            },
            {
              title: 'Cómo Generar Tu Tarjeta',
              content: 'Simplemente conecta tu billetera Solana y haz clic en "Generar Tarjeta". Nuestro sistema analizará tu historial de trading y creará una tarjeta DegenScore única mostrando tus estadísticas.'
            },
            {
              title: 'Entendiendo Tu Puntuación',
              content: 'Tu DegenScore va de 0-100 y se calcula basado en múltiples factores incluyendo tasa de victorias, ganancias, volumen, consistencia y gestión de riesgos. Puntuaciones más altas indican un rendimiento superior.'
            }
          ]
        },
        {
          title: '🎯 Características',
          items: [
            {
              title: 'Sistema de Niveles',
              content: 'Los jugadores se clasifican en 5 niveles: Plancton (0-30), Pez (31-50), Delfín (51-70), Tiburón (71-85) y Ballena (86-100). Cada nivel refleja tu maestría en trading.'
            },
            {
              title: 'Acceso Premium',
              content: 'Mintea tu tarjeta por 1 SOL para desbloquear características Premium incluyendo: prueba PRO de 30 días, acceso al Alpha Feed, desafíos semanales y propiedad permanente de la tarjeta.'
            },
            {
              title: 'Alpha Feed',
              content: 'Rastrea a los mejores traders de Solana en tiempo real. Usuarios FREE obtienen datos con 72h de retraso, usuarios PREMIUM con 6h de retraso, y usuarios PRO obtienen alpha casi en tiempo real (1h de retraso).'
            },
            {
              title: 'Desafíos Semanales',
              content: 'Compite en desafíos semanales por premios de 3 SOL. Los desafíos rotan entre: Tarjeta Más Querida, Rey de Ganancias, Campeón de Tasa de Victoria, Líder de Volumen y Mejor Trade Individual.'
            },
            {
              title: 'Comparación de Tarjetas',
              content: 'Compara tu tarjeta DegenScore con cualquier otra billetera para ver cómo te comparas con otros traders.'
            }
          ]
        },
        {
          title: '❓ Preguntas Frecuentes',
          items: [
            {
              title: '¿Cuánto cuesta?',
              content: 'Generar una tarjeta es GRATIS. Las características premium (minteo) cuestan 1 SOL, que incluye una prueba PRO de 30 días y acceso PREMIUM permanente.'
            },
            {
              title: '¿Qué blockchain está soportado?',
              content: 'Actualmente, solo soportamos Solana. El soporte para otras cadenas puede ser agregado en el futuro.'
            },
            {
              title: '¿Con qué frecuencia se actualizan los datos?',
              content: 'FREE: 72h de retraso, PREMIUM: 6h de retraso, PRO: 1h de retraso (casi tiempo real). Las estadísticas de la tarjeta se actualizan cuando regeneras tu tarjeta.'
            },
            {
              title: '¿Puedo compartir mi tarjeta?',
              content: '¡Sí! Después de mintear, puedes compartir tu tarjeta en Twitter/X y participar en nuestro programa de compartición viral.'
            },
            {
              title: '¿Qué billeteras están soportadas?',
              content: 'Soportamos Phantom, Solflare y todas las billeteras principales de Solana a través del Solana Wallet Adapter.'
            }
          ]
        },
        {
          title: '💎 Precios',
          items: [
            {
              title: 'Nivel FREE',
              content: '• Genera tarjetas ilimitadas\n• Ver estadísticas básicas\n• Alpha Feed con 72h de retraso\n• Limitado a 5 trades visibles'
            },
            {
              title: 'Nivel PREMIUM (1 SOL único pago)',
              content: '• Prueba PRO de 30 días\n• Acceso PREMIUM permanente después de la prueba\n• Alpha Feed con 6h de retraso\n• 10 trades visibles\n• Visibilidad completa de estadísticas\n• Acceso al modal de compartir\n• Participación en desafíos semanales'
            },
            {
              title: 'Nivel PRO ($10/mes o prueba)',
              content: '• Alpha Feed casi en tiempo real (1h de retraso)\n• 20 trades visibles\n• Transparencia completa\n• Analíticas prioritarias\n• Métricas avanzadas'
            }
          ]
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text-gold">
              📖 {t('docsTitle')}
            </h1>
            <p className="text-gray-400 mt-2">{t('docsDescription')}</p>
          </div>
          <div className="flex gap-3">
            <LanguageSwitch />
            <Link href="/">
              <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition">
                ← {t('title')}
              </button>
            </Link>
          </div>
        </div>

        {/* Documentation Content */}
        <div className="space-y-8">
          {currentContent.sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx}>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/50 text-center">
          <h2 className="text-3xl font-bold gradient-text-gold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-6">
            Generate your DegenScore card now and join the community!
          </p>
          <Link href="/">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-lg hover:scale-105 transition shadow-lg">
              🎴 Generate My Card
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

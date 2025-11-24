import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic imports - NO ejecutar en servidor, solo en cliente
const PublicLeaderboard = dynamic(
  () => import('./leaderboard/PublicLeaderboard').then((m) => ({ default: m.PublicLeaderboard })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800/50 rounded-2xl h-96"></div>,
  }
);

export function Leaderboard() {
  return (
    <>
      <Head>
        <title>Leaderboard | DegenScore</title>
        <meta name="description" content="Top Solana traders ranked by DegenScore" />
      </Head>

      <style jsx global>{`
        @keyframes shine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .shine-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 3s infinite;
        }
      `}</style>

      <PublicLeaderboard initialPeriod="all" />
    </>
  );
}

// Component only - no static props needed
// This will be loaded dynamically from pages/leaderboard.tsx
export default Leaderboard;

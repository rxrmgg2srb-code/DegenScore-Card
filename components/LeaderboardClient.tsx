import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports - NO ejecutar en servidor, solo en cliente
const RankingsWidget = dynamic(() => import('./RankingsWidget'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800/50 rounded-2xl h-96"></div>
});

const ChallengeWinnersWidget = dynamic(() => import('./ChallengeWinnersWidget'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-800/50 rounded-2xl h-96"></div>
});

import { BadgesDisplay } from './BadgesDisplay';
import { LanguageSelector } from './LanguageSelector';

// All the leaderboard logic and components
export { LeaderboardClient as default };

// ... (rest of leaderboard implementation will be here)

import React from 'react';

export default function Header() {
    return (
        <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                🚀 SUPER TOKEN SCORER
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
                The MOST COMPLETE Token Analysis System in Web3
            </p>
            <p className="text-md text-gray-400">
                Integrates 15+ APIs · 50+ Metrics · Real-Time Analysis
            </p>
        </div>
    );
}

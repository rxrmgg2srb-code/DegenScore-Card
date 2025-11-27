import React from 'react';
import { WhaleWallet } from '@/hooks/useWhaleRadar';
import { formatAddress, formatTime } from '@/lib/utils/whale-radar';

interface WhaleCardProps {
  whale: WhaleWallet;
  isFollowing: boolean;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
  isAuthenticated: boolean;
}

export default function WhaleCard({
  whale,
  isFollowing,
  onFollow,
  onUnfollow,
  isAuthenticated,
}: WhaleCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🐋</span>
            <h4 className="font-bold text-white">
              {whale.nickname || formatAddress(whale.walletAddress)}
            </h4>
          </div>
          <p className="text-xs text-gray-500">{formatAddress(whale.walletAddress)}</p>
        </div>
        <button
          onClick={() => (isFollowing ? onUnfollow(whale.id) : onFollow(whale.id))}
          disabled={!isAuthenticated}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            isFollowing
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isFollowing ? 'Following' : '+ Follow'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-500">Volume</div>
          <div className="text-sm font-bold text-green-400">
            ${whale.totalVolume.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-500">Win Rate</div>
          <div className="text-sm font-bold text-blue-400">{whale.winRate.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-500">Avg Position</div>
          <div className="text-sm font-bold text-purple-400">
            ${whale.avgPositionSize.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-500">Profit</div>
          <div
            className={`text-sm font-bold ${whale.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            ${whale.totalProfit.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{whale.followersCount} followers</span>
        </div>
        <div>Active {formatTime(whale.lastActive)}</div>
      </div>

      {whale.topTokens && whale.topTokens.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Top tokens:</div>
          <div className="flex flex-wrap gap-1">
            {whale.topTokens.slice(0, 3).map((token, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

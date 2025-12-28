'use client';

import React, { useState, useEffect } from 'react';

interface BuilderStats {
  githubProgress: number;
  onchainProgress: number;
  miniAppsProgress: number;
  estimatedRewards: string;
  rank: number;
  totalBuilders: number;
}

export default function BaseBuilderStats() {
  const [stats, setStats] = useState<BuilderStats>({
    githubProgress: 15.0,
    onchainProgress: 0.08,
    miniAppsProgress: 0.0,
    estimatedRewards: '<0.01',
    rank: 278,
    totalBuilders: 40829,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const getProgressColor = (progress: number): string => {
    if (progress >= 50) return 'bg-green-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRankTier = (rank: number): { tier: string; color: string } => {
    if (rank <= 10) return { tier: '🏆 Top 10', color: 'text-yellow-400' };
    if (rank <= 50) return { tier: '🥈 Top 50', color: 'text-gray-300' };
    if (rank <= 100) return { tier: '🥉 Top 100', color: 'text-orange-400' };
    if (rank <= 500) return { tier: '⭐ Top 500', color: 'text-blue-400' };
    return { tier: '📈 Rising', color: 'text-purple-400' };
  };

  const rankInfo = getRankTier(stats.rank);

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-lg">🏗️</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Base Builder Stats</h3>
            <p className={`text-sm ${rankInfo.color}`}>
              Rank #{stats.rank} • {rankInfo.tier}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">{stats.estimatedRewards} ETH</p>
          <p className="text-xs text-gray-400">Est. Rewards</p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t border-purple-500/30">
          {/* GitHub Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">GitHub Progress</span>
              <span className="text-white font-medium">{stats.githubProgress.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(stats.githubProgress)} transition-all duration-500`}
                style={{ width: `${Math.min(stats.githubProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Onchain Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Onchain Progress</span>
              <span className="text-white font-medium">{stats.onchainProgress.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(stats.onchainProgress)} transition-all duration-500`}
                style={{ width: `${Math.min(stats.onchainProgress * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Mini Apps Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Mini Apps Progress</span>
              <span className="text-white font-medium">{stats.miniAppsProgress.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(stats.miniAppsProgress)} transition-all duration-500`}
                style={{ width: `${Math.min(stats.miniAppsProgress * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">🎯 Action Items</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Push daily commits to public repos</li>
              <li>• Deploy smart contracts on Base</li>
              <li>• Build & register Farcaster MiniApps</li>
              <li>• Contribute to base-org repositories</li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex gap-2 mt-3">
            <a 
              href="https://talent.app/~/earn/base-december" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
            >
              View Leaderboard
            </a>
            <a 
              href="https://github.com/base-org" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
            >
              Base GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


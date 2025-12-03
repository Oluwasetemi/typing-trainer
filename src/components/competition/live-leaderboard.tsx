import type { LeaderboardEntry } from '../../types/competition.types';

import { Icons } from '../../utils/icons';
import { formatTime } from '../../utils/metrics';

type LiveLeaderboardProps = {
  leaderboard: LeaderboardEntry[];
  isCompetitionActive: boolean;
};

export default function LiveLeaderboard({
  leaderboard,
  isCompetitionActive,
}: LiveLeaderboardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icons.Trophy size={24} />
          Leaderboard
        </h2>
        {isCompetitionActive && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[600px]">
        {leaderboard.length === 0
          ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                Waiting for participants...
              </p>
            )
          : (
              leaderboard.map(entry => (
                <LeaderboardCard key={entry.userId} entry={entry} />
              ))
            )}
      </div>
    </div>
  );
}

function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Icons.Medal1st size={20} className="text-yellow-500" />;
      case 2:
        return <Icons.Medal2nd size={20} className="text-gray-400" />;
      case 3:
        return <Icons.Medal3rd size={20} className="text-orange-500" />;
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300';
      case 2:
        return 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300';
      case 3:
        return 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-3 transition-all ${
        entry.isYou
          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500 shadow-md'
          : getRankColor(entry.rank)
      }`}
    >
      {/* Rank Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-lg">
        {getMedalIcon(entry.rank)}
      </div>

      <div className="ml-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {entry.username}
              {entry.isYou && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-bold">
                  (You)
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {entry.wpm}
                {' '}
                WPM
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {entry.accuracy}
                % Acc
              </span>
            </div>
          </div>

          {entry.finished
            ? (
                <div className="text-right">
                  <span className="px-2 py-1 bg-green-500 dark:bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1">
                    <Icons.Check size={12} />
                    Finished
                  </span>
                  {entry.finishTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(entry.finishTime)}
                    </p>
                  )}
                </div>
              )
            : (
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {entry.progress.toFixed(0)}
                    %
                  </span>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full mt-1">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

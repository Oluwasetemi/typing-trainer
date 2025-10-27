import type { LeaderboardEntry } from '../../types/competition.types';

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
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          🏆 Leaderboard
        </h2>
        {isCompetitionActive && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[600px]">
        {leaderboard.length === 0
          ? (
              <p className="text-center text-gray-500 text-sm py-8">
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
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 2:
        return 'bg-gray-100 border-gray-300 text-gray-700';
      case 3:
        return 'bg-orange-100 border-orange-300 text-orange-700';
      default:
        return 'bg-white border-gray-200 text-gray-700';
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-3 transition-all ${
        entry.isYou
          ? 'bg-blue-50 border-blue-400 shadow-md'
          : getRankColor(entry.rank)
      }`}
    >
      {/* Rank Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-lg">
        {getMedalEmoji(entry.rank)}
      </div>

      <div className="ml-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-800">
              {entry.username}
              {entry.isYou && (
                <span className="ml-2 text-xs text-blue-600 font-bold">
                  (You)
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600">
                {entry.wpm}
                {' '}
                WPM
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-medium text-gray-600">
                {entry.accuracy}
                % Acc
              </span>
            </div>
          </div>

          {entry.finished
            ? (
                <div className="text-right">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                    ✓ Finished
                  </span>
                  {entry.finishTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(entry.finishTime)}
                    </p>
                  )}
                </div>
              )
            : (
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700">
                    {entry.progress.toFixed(0)}
                    %
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
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

import type { LeaderboardEntry } from '../../types/competition.types';

import { Icons } from '../../utils/icons';
import { formatTime } from '../../utils/metrics';

type CompetitionResultsProps = {
  leaderboard: LeaderboardEntry[];
  competitionName: string;
  onRaceAgain: () => void;
  onNewCompetition: () => void;
};

export default function CompetitionResults({
  leaderboard,
  competitionName,
  onRaceAgain,
  onNewCompetition,
}: CompetitionResultsProps) {
  const yourEntry = leaderboard.find(entry => entry.isYou);
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
            <Icons.Flag size={36} />
            Race Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{competitionName}</p>
        </header>

        {/* Podium */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
            Top 3 Winners
          </h2>
          <div className="flex items-end justify-center gap-4">
            {topThree[1] && (
              <PodiumCard entry={topThree[1]} position={2} />
            )}
            {topThree[0] && (
              <PodiumCard entry={topThree[0]} position={1} />
            )}
            {topThree[2] && (
              <PodiumCard entry={topThree[2]} position={3} />
            )}
          </div>
        </div>

        {/* Your Result - Enhanced Stats */}
        {yourEntry && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
              Your Performance
            </h3>
            <div className="bg-white dark:bg-zinc-900">
              <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-px bg-gray-900/5 dark:bg-gray-100/5 sm:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                  <EnhancedStatCard
                    name="Final Rank"
                    value={`#${yourEntry.rank}`}
                    isHighlighted={yourEntry.rank <= 3}
                  />
                  <EnhancedStatCard
                    name="Words Per Minute"
                    value={yourEntry.wpm.toString()}
                    unit="WPM"
                  />
                  <EnhancedStatCard
                    name="Accuracy"
                    value={yourEntry.accuracy.toString()}
                    unit="%"
                    isHighlighted={yourEntry.accuracy >= 95}
                  />
                  <EnhancedStatCard
                    name="Completion Time"
                    value={formatTime(yourEntry.finishTime || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
            Full Results
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {leaderboard.map(entry => (
              <ResultRow key={entry.userId} entry={entry} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onRaceAgain}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Icons.Reload size={20} />
            Race Again
          </button>
          <button
            type="button"
            onClick={onNewCompetition}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Icons.Add size={20} />
            New Competition
          </button>
        </div>
      </div>
    </div>
  );
}

function EnhancedStatCard({
  name,
  value,
  unit,
  isHighlighted = false,
}: {
  name: string;
  value: string;
  unit?: string;
  isHighlighted?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-zinc-900 px-4 py-6 sm:px-6 lg:px-8 ${isHighlighted ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30' : ''}`}>
      <p className={`text-sm/6 font-medium ${isHighlighted ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {name}
      </p>
      <p className="mt-2 flex items-baseline gap-x-2">
        <span className={`text-4xl font-semibold tracking-tight ${isHighlighted ? 'text-purple-900 dark:text-purple-200' : 'text-gray-900 dark:text-gray-100'}`}>
          {value}
        </span>
        {unit
          ? (
              <span className={`text-sm ${isHighlighted ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {unit}
              </span>
            )
          : null}
      </p>
    </div>
  );
}

function PodiumCard({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: number;
}) {
  const heights = {
    1: 'h-48',
    2: 'h-36',
    3: 'h-28',
  };

  const MedalIcon = {
    1: () => <Icons.Medal1st size={40} className="text-yellow-100" />,
    2: () => <Icons.Medal2nd size={40} className="text-white" />,
    3: () => <Icons.Medal3rd size={40} className="text-white" />,
  };

  const colors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600',
  };

  const MedalComponent = MedalIcon[position as keyof typeof MedalIcon];

  return (
    <div
      className={`flex flex-col items-center ${
        position === 1 ? 'transform scale-110' : ''
      }`}
    >
      <div
        className={`bg-gradient-to-b ${colors[position as keyof typeof colors]} text-white rounded-t-lg px-6 py-4 ${heights[position as keyof typeof heights]} flex flex-col items-center justify-center shadow-lg`}
      >
        <div className="mb-2">
          <MedalComponent />
        </div>
        <p className="font-bold text-lg text-center">{entry.username}</p>
        <p className="text-sm font-semibold">
          {entry.wpm}
          {' '}
          WPM
        </p>
        <p className="text-xs">
          {entry.accuracy}
          % Acc
        </p>
      </div>
      <div className="bg-gray-700 text-white px-4 py-2 rounded-b-lg font-bold">
        #
        {position}
      </div>
    </div>
  );
}

function ResultRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        entry.isYou
          ? 'bg-blue-100 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-500'
          : 'bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-700 dark:text-gray-300 w-8">
          #
          {entry.rank}
        </span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{entry.username}</span>
        {entry.isYou && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">(You)</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {entry.wpm}
          {' '}
          WPM
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {entry.accuracy}
          % Acc
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatTime(entry.finishTime || 0)}
        </span>
      </div>
    </div>
  );
}

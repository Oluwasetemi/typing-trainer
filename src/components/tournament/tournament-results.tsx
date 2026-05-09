import { Award, Medal, Trophy } from 'lucide-react';

import type { Tournament } from '@/types/tournament.types';

type TournamentResultsProps = {
  tournament: Tournament;
  userId: string;
  onBackToHome: () => void;
};

export function TournamentResults({ tournament, userId, onBackToHome }: TournamentResultsProps) {
  const participants = Object.values(tournament.participants);

  // Get podium finishers
  const winner = tournament.winnerId ? tournament.participants[tournament.winnerId] : null;
  const runnerUp = tournament.runnerUpId ? tournament.participants[tournament.runnerUpId] : null;
  const thirdPlace = tournament.thirdPlaceId ? tournament.participants[tournament.thirdPlaceId] : null;

  // Sort all participants by wins, then by losses
  const standings = [...participants].sort((a, b) => {
    if (b.wins !== a.wins)
      return b.wins - a.wins;
    if (a.losses !== b.losses)
      return a.losses - b.losses;
    return a.seed - b.seed;
  });

  const userPlacement = standings.findIndex(p => p.userId === userId) + 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tournament Complete
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {tournament.name}
        </p>
      </div>

      {/* User Placement */}
      {userPlacement > 0 && (
        <div className="mb-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 p-6 text-center">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
            Your Placement
          </p>
          <p className="mt-1 text-4xl font-bold text-purple-600 dark:text-purple-400">
            #
            {userPlacement}
          </p>
        </div>
      )}

      {/* Podium */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Podium</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* 2nd Place */}
          {runnerUp && (
            <div className="order-2 sm:order-1">
              <PodiumCard
                participant={runnerUp}
                placement={2}
                icon={<Medal className="h-8 w-8 text-gray-400" />}
                isUser={runnerUp.userId === userId}
              />
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="order-1 sm:order-2">
              <PodiumCard
                participant={winner}
                placement={1}
                icon={<Trophy className="h-10 w-10 text-yellow-500" />}
                isUser={winner.userId === userId}
                highlight
              />
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="order-3">
              <PodiumCard
                participant={thirdPlace}
                placement={3}
                icon={<Award className="h-6 w-6 text-amber-700 dark:text-amber-600" />}
                isUser={thirdPlace.userId === userId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Full Standings */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Final Standings</h2>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Record
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
              {standings.map((participant, index) => (
                <tr
                  key={participant.userId}
                  className={participant.userId === userId ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    #
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {participant.username}
                      </span>
                      {participant.userId === userId && (
                        <span className="rounded bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {participant.wins}
                    W -
                    {' '}
                    {participant.losses}
                    L
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {participant.matchesPlayed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBackToHome}
          className="rounded-md bg-purple-600 dark:bg-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 dark:hover:bg-purple-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

type PodiumCardProps = {
  participant: {
    username: string;
    wins: number;
    losses: number;
  };
  placement: number;
  icon: React.ReactNode;
  isUser: boolean;
  highlight?: boolean;
};

function PodiumCard({ participant, placement, icon, isUser, highlight }: PodiumCardProps) {
  const placementColors = {
    1: 'border-yellow-500 dark:border-yellow-400',
    2: 'border-gray-400 dark:border-gray-500',
    3: 'border-amber-700 dark:border-amber-600',
  };

  return (
    <div
      className={`
        rounded-lg bg-white dark:bg-zinc-800 p-6 shadow-sm ring-2
        ${placementColors[placement as keyof typeof placementColors] || 'ring-gray-200 dark:ring-zinc-700'}
        ${highlight ? 'scale-105 shadow-lg' : ''}
        ${isUser ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
      `}
    >
      <div className="mb-4 flex justify-center">
        {icon}
      </div>

      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {placement === 1 ? '1st Place' : placement === 2 ? '2nd Place' : '3rd Place'}
        </div>
        <div className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {participant.username}
        </div>
        {isUser && (
          <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">You</div>
        )}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {participant.wins}
          W -
          {' '}
          {participant.losses}
          L
        </div>
      </div>
    </div>
  );
}

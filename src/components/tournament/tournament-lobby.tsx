import { Check, Clock, Copy, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

import type { Tournament } from '@/types/tournament.types';

type TournamentLobbyProps = {
  tournament: Tournament;
  userId: string;
  isHost: boolean;
  onStartTournament: () => void;
  onLeaveTournament: () => void;
};

export function TournamentLobby({
  tournament,
  userId,
  isHost,
  onStartTournament,
  onLeaveTournament,
}: TournamentLobbyProps) {
  const [copied, setCopied] = useState(false);

  const participants = Object.values(tournament.participants);
  const connectedCount = participants.filter(p => p.isConnected).length;
  const isFull = connectedCount >= tournament.settings.size;
  const canStart = isHost && connectedCount >= 2 && tournament.state === 'registration';

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(tournament.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // display the toast
    }
    catch (error) {
      console.error('Failed to copy join code:', error);
    }
  };

  const formatName = (format: string) => {
    return format.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const conditionName = (condition: string) => {
    return condition.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {tournament.name}
          </h1>
        </div>

        {/* Join Code */}
        <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 px-4 py-2">
          <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
            Join Code:
          </span>
          <code className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {tournament.code}
          </code>
          <button
            type="button"
            onClick={copyJoinCode}
            className="rounded p-1 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-800/30"
            title="Copy join code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Tournament Info */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Format</div>
          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatName(tournament.settings.format)}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Condition</div>
          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {conditionName(tournament.settings.winCondition)}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</div>
          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {tournament.settings.size}
            {' '}
            Players
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="mb-8 rounded-lg bg-white dark:bg-zinc-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Participants
            </h2>
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {connectedCount}
            {' '}
            /
            {' '}
            {tournament.settings.size}
          </div>
        </div>

        <div className="space-y-2">
          {participants.map(participant => (
            <div
              key={participant.userId}
              className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-zinc-900 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${participant.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
                  title={participant.isConnected ? 'Connected' : 'Disconnected'}
                />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {participant.username}
                </span>
                {participant.userId === tournament.hostUserId && (
                  <span className="rounded bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                    Host
                  </span>
                )}
                {participant.userId === userId && (
                  <span className="rounded bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                    You
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Seed #
                {participant.seed}
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, tournament.settings.size - participants.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-700 px-4 py-3"
            >
              <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-zinc-600" />
              <span className="text-gray-400 dark:text-gray-600">Waiting for player...</span>
            </div>
          ))}
        </div>

        {isFull && (
          <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Tournament is full! Waiting for host to start...
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {tournament.state === 'ready' && (
        <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Clock className="h-5 w-5" />
            <p className="font-medium">Tournament is starting soon...</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {canStart && (
          <button
            type="button"
            onClick={onStartTournament}
            className="rounded-md bg-purple-600 dark:bg-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 dark:hover:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Start Tournament
          </button>
        )}

        <button
          type="button"
          onClick={onLeaveTournament}
          className="rounded-md bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
        >
          Leave Tournament
        </button>
      </div>

      {/* Host Instructions */}
      {isHost && !canStart && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {connectedCount < 2
              ? 'Waiting for at least 2 players to join...'
              : 'Share the join code with other players to fill the tournament.'}
          </p>
        </div>
      )}
    </div>
  );
}

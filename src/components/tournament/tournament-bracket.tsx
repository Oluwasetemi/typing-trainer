import { CheckCircle, Clock, Trophy } from 'lucide-react';

import type { Match, Round, Tournament } from '@/types/tournament.types';

import { getRoundName } from '@/utils/tournament-brackets';

type TournamentBracketProps = {
  tournament: Tournament;
  userId: string;
  onMatchClick?: (match: Match) => void;
};

export function TournamentBracket({ tournament, userId, onMatchClick }: TournamentBracketProps) {
  const winnersBracketRounds = tournament.rounds.filter(r => r.bracket === 'winners');
  const losersBracketRounds = tournament.rounds.filter(r => r.bracket === 'losers');
  const hasLosersBracket = losersBracketRounds.length > 0;

  return (
    <div className="space-y-8">
      {/* Winners Bracket */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          {hasLosersBracket ? 'Winners Bracket' : 'Tournament Bracket'}
        </h2>
        <BracketView
          rounds={winnersBracketRounds}
          tournament={tournament}
          userId={userId}
          onMatchClick={onMatchClick}
        />
      </div>

      {/* Losers Bracket */}
      {hasLosersBracket && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Losers Bracket
          </h2>
          <BracketView
            rounds={losersBracketRounds}
            tournament={tournament}
            userId={userId}
            onMatchClick={onMatchClick}
          />
        </div>
      )}
    </div>
  );
}

type BracketViewProps = {
  rounds: Round[];
  tournament: Tournament;
  userId: string;
  onMatchClick?: (match: Match) => void;
};

function BracketView({ rounds, tournament, userId, onMatchClick }: BracketViewProps) {
  if (rounds.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No rounds available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-8 pb-4">
        {rounds.map(round => (
          <RoundColumn
            key={round.number}
            round={round}
            tournament={tournament}
            userId={userId}
            onMatchClick={onMatchClick}
          />
        ))}
      </div>
    </div>
  );
}

type RoundColumnProps = {
  round: Round;
  tournament: Tournament;
  userId: string;
  onMatchClick?: (match: Match) => void;
};

function RoundColumn({ round, tournament, userId, onMatchClick }: RoundColumnProps) {
  const totalRounds = tournament.rounds.filter(r => r.bracket === round.bracket).length;
  const roundName = getRoundName(round.number, totalRounds);

  return (
    <div className="flex flex-col px-4" style={{ minWidth: '360px' }}>
      {/* Round Header */}
      <div className="mb-4 text-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Round
          {' '}
          {round.number}
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {roundName}
        </div>
      </div>

      {/* Matches */}
      <div className="flex flex-1 flex-col justify-around gap-4">
        {round.matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            tournament={tournament}
            userId={userId}
            onClick={onMatchClick}
          />
        ))}
      </div>
    </div>
  );
}

type MatchCardProps = {
  match: Match;
  tournament: Tournament;
  userId: string;
  onClick?: (match: Match) => void;
};

function MatchCard({ match, tournament, userId, onClick }: MatchCardProps) {
  const participants = match.participants.map(pid => tournament.participants[pid]).filter(Boolean);
  const isUserInMatch = match.participants.includes(userId);
  const isClickable = onClick && (match.state === 'ready' || match.state === 'active') && isUserInMatch;

  const getStateIcon = () => {
    switch (match.state) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'ready':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStateLabel = () => {
    switch (match.state) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'In Progress';
      case 'ready':
        return 'Ready';
      case 'countdown':
        return 'Starting...';
      default:
        return 'Waiting';
    }
  };

  return (
    <button
      type="button"
      onClick={() => isClickable && onClick(match)}
      disabled={!isClickable}
      className={`
        rounded-lg bg-white dark:bg-zinc-800 p-4 text-left shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700 transition-all
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:ring-purple-500 dark:hover:ring-purple-400' : 'cursor-default'}
        ${isUserInMatch ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}
      `}
    >
      {/* Match Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Match
          {' '}
          {match.matchNumber}
        </div>
        <div className="flex items-center gap-1 text-xs">
          {getStateIcon()}
          <span className="font-medium text-gray-600 dark:text-gray-400">
            {getStateLabel()}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-2">
        {participants.length > 0
          ? (
              participants.map((participant) => {
                const result = match.results?.[participant.userId];
                const isWinner = match.winnerId === participant.userId;
                const isLoser = match.state === 'completed' && !isWinner;

                return (
                  <div
                    key={participant.userId}
                    className={`
                  flex items-center justify-between rounded px-2 py-1.5
                  ${isWinner ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'bg-gray-50 dark:bg-zinc-900'}
                  ${isLoser ? 'opacity-60' : ''}
                `}
                  >
                    <div className="flex items-center gap-2">
                      {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                      <span className={`text-sm font-medium ${isWinner ? 'text-green-900 dark:text-green-300 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                        {participant.username}
                      </span>
                    </div>

                    {result && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className={`font-semibold ${isWinner ? 'text-green-700 dark:text-green-400' : ''}`}>
                          {Math.round(result.wpm)}
                          {' '}
                          WPM
                        </span>
                        <span>
                          {result.accuracy.toFixed(1)}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )
          : (
              <div className="space-y-2">
                <div className="rounded bg-gray-50 dark:bg-zinc-900 px-2 py-1.5 text-sm text-gray-400 dark:text-gray-600">
                  TBD
                </div>
                <div className="rounded bg-gray-50 dark:bg-zinc-900 px-2 py-1.5 text-sm text-gray-400 dark:text-gray-600">
                  TBD
                </div>
              </div>
            )}
      </div>
    </button>
  );
}

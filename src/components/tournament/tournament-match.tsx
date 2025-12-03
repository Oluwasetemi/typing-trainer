import { ArrowLeft, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Match, MatchResult, Tournament } from '@/types/tournament.types';

import Competition from '@/components/competition/competition';
import { useCompetition } from '@/hooks/use-competition';
import { getRoundName } from '@/utils/tournament-brackets';

type TournamentMatchProps = {
  tournament: Tournament;
  match: Match;
  userId: string;
  username: string;
  onMatchComplete: (matchId: string, results: MatchResult[]) => void;
  onReadyForMatch: (matchId: string) => void;
  onBackToBracket: () => void;
};

export function TournamentMatch({
  tournament,
  match,
  userId,
  username,
  onMatchComplete,
  onReadyForMatch,
  onBackToBracket,
}: TournamentMatchProps) {
  const [showCompetition, setShowCompetition] = useState(false);

  // Check if current user is ready based on server state
  const isReady = match.readyParticipants?.includes(userId) || false;

  const round = tournament.rounds.find(r => r.number === match.roundNumber);
  const totalRounds = tournament.rounds.filter(r => r.bracket === match.bracket).length;
  const roundName = round ? getRoundName(round.number, totalRounds) : `Round ${match.roundNumber}`;
  const opponent = match.participants.find(p => p !== userId);
  const opponentData = opponent ? tournament.participants[opponent] : null;

  console.warn('[TournamentMatch] Match state:', {
    matchId: match.id,
    state: match.state,
    readyParticipants: match.readyParticipants,
    isReady,
    userId,
    opponent,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // Auto-show competition when match becomes active
    if (match.state === 'active' && match.competitionId) {
      timeoutId = setTimeout(() => setShowCompetition(true), 0);
    }

    // Don't hide competition until match is completed
    // This ensures results can be reported
    if (match.state === 'completed') {
      setShowCompetition(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [match.state, match.competitionId]);

  const handleReady = () => {
    console.warn('[TournamentMatch] handleReady clicked, calling onReadyForMatch');
    onReadyForMatch(match.id);
  };

  // If match is completed, show results
  if (match.state === 'completed') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          type="button"
          onClick={onBackToBracket}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bracket
        </button>

        <div className="rounded-lg bg-white dark:bg-zinc-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
          <div className="mb-6 text-center">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Match Complete</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {roundName}
              {' '}
              - Match
              {' '}
              {match.matchNumber}
            </p>
          </div>

          <div className="space-y-3">
            {match.participants.map((participantId) => {
              const participant = tournament.participants[participantId];
              const result = match.results?.[participantId];
              const isWinner = match.winnerId === participantId;

              if (!participant || !result)
                return null;

              return (
                <div
                  key={participantId}
                  className={`
                    rounded-lg p-4 ${isWinner ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'bg-gray-50 dark:bg-zinc-900'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                      <div>
                        <div className={`font-semibold ${isWinner ? 'text-green-900 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {participant.username}
                          {participantId === userId && ' (You)'}
                        </div>
                        {isWinner && (
                          <div className="text-sm font-medium text-green-700 dark:text-green-400">
                            Winner
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {Math.round(result.wpm)}
                        {' '}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">WPM</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.accuracy.toFixed(1)}
                        % accuracy
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onBackToBracket}
            className="mt-6 w-full rounded-md bg-purple-600 dark:bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 dark:hover:bg-purple-600"
          >
            Back to Bracket
          </button>
        </div>
      </div>
    );
  }

  // If competition is active, show the typing competition with results monitoring
  if (showCompetition && match.competitionId) {
    return (
      <TournamentCompetitionWrapper
        competitionId={match.competitionId}
        matchId={match.id}
        userId={userId}
        username={username}
        onMatchComplete={onMatchComplete}
        onBackToBracket={onBackToBracket}
      />
    );
  }

  // Waiting room / Ready state
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={onBackToBracket}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bracket
      </button>

      <div className="rounded-lg bg-white dark:bg-zinc-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {roundName}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Match
            {' '}
            {match.matchNumber}
          </p>
        </div>

        {/* Matchup Display */}
        <div className="mb-8 flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-purple-600 dark:text-purple-400">
              {username}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">You</div>
          </div>

          <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">VS</div>

          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
              {opponentData?.username || 'Waiting...'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Opponent</div>
          </div>
        </div>

        {/* Ready Status */}
        <div className="space-y-4">
          {(match.state === 'pending' || match.state === 'ready') && (
            <>
              {!isReady
                ? (
                    <button
                      type="button"
                      onClick={handleReady}
                      className="w-full rounded-md bg-purple-600 dark:bg-purple-700 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-500 dark:hover:bg-purple-600"
                    >
                      I'm Ready
                    </button>
                  )
                : (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
                      <p className="font-medium text-green-800 dark:text-green-300">
                        You're ready!
                        {' '}
                        {match.readyParticipants?.length === match.participants.length
                          ? 'Match starting...'
                          : 'Waiting for opponent...'}
                      </p>
                    </div>
                  )}

              {/* Show ready status for both players */}
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className={`font-medium ${match.readyParticipants?.includes(userId) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {match.readyParticipants?.includes(userId) ? '✓ Ready' : 'Not Ready'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">You</div>
                </div>
                <div>
                  <div className={`font-medium ${opponent && match.readyParticipants?.includes(opponent) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {opponent && match.readyParticipants?.includes(opponent) ? '✓ Ready' : 'Not Ready'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Opponent</div>
                </div>
              </div>
            </>
          )}

          {match.state === 'countdown' && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Match starting soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper component that monitors competition completion and reports results
function TournamentCompetitionWrapper({
  competitionId,
  matchId,
  userId,
  username,
  onMatchComplete,
  onBackToBracket,
}: {
  competitionId: string;
  matchId: string;
  userId: string;
  username: string;
  onMatchComplete: (matchId: string, results: MatchResult[]) => void;
  onBackToBracket: () => void;
}) {
  const { session, leaderboard } = useCompetition(competitionId, userId);
  const hasReportedResults = useRef(false);

  // Monitor for competition completion and report results
  useEffect(() => {
    console.warn('[TournamentCompetitionWrapper] State check:', {
      sessionState: session?.state,
      hasLeaderboard: !!leaderboard,
      leaderboardLength: leaderboard?.length,
      hasReported: hasReportedResults.current,
      matchId,
    });

    if (session?.state === 'finished' && leaderboard && leaderboard.length > 0 && !hasReportedResults.current) {
      console.warn('[TournamentCompetitionWrapper] Competition finished, reporting results IMMEDIATELY');
      hasReportedResults.current = true;

      // Convert leaderboard to match results
      const results: MatchResult[] = leaderboard.map((entry, index) => ({
        userId: entry.userId,
        username: entry.username,
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        completedAt: entry.finishedAt || Date.now(),
        score: entry.wpm * (entry.accuracy / 100), // Calculate score
        placement: index + 1,
      }));

      console.warn('[TournamentCompetitionWrapper] Reporting results:', results);

      // Report immediately
      onMatchComplete(matchId, results);

      console.warn('[TournamentCompetitionWrapper] Results reported successfully');
    }

    // Cleanup: ensure results are reported even if component unmounts
    return () => {
      if (session?.state === 'finished' && leaderboard && leaderboard.length > 0 && !hasReportedResults.current) {
        console.warn('[TournamentCompetitionWrapper] Component unmounting, reporting results in cleanup');
        hasReportedResults.current = true;

        const results: MatchResult[] = leaderboard.map((entry, index) => ({
          userId: entry.userId,
          username: entry.username,
          wpm: entry.wpm,
          accuracy: entry.accuracy,
          completedAt: entry.finishedAt || Date.now(),
          score: entry.wpm * (entry.accuracy / 100),
          placement: index + 1,
        }));

        onMatchComplete(matchId, results);
      }
    };
  }, [session?.state, leaderboard, matchId, onMatchComplete]);

  return (
    <Competition
      competitionId={competitionId}
      userId={userId}
      username={username}
      tournamentMode
      onLeave={onBackToBracket}
    />
  );
}

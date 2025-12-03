import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { TournamentBracket } from '@/components/tournament/tournament-bracket';
import { TournamentMatch } from '@/components/tournament/tournament-match';
import { TournamentResults } from '@/components/tournament/tournament-results';
import { useTournament } from '@/hooks/use-tournament';
import type { Match, MatchResult } from '@/types/tournament.types';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/tournament/$tournamentId/bracket')({
  component: TournamentBracketRoute,
});

function TournamentBracketRoute() {
  const navigate = useNavigate();
  const { tournamentId } = Route.useParams();
  const { username, userId } = Route.useSearch();

  const [localUserId] = useState(() => {
    if (userId) {
      sessionStorage.setItem('typing-tournament-userId', userId);
      return userId;
    }
    return sessionStorage.getItem('typing-tournament-userId') || `user-${Date.now()}`;
  });

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [manuallyViewingBracket, setManuallyViewingBracket] = useState(false);
  const hasUpdatedUrl = useRef(false);

  const {
    tournament,
    error,
    isConnected,
    readyForMatch,
    matchComplete,
    leaveTournament,
  } = useTournament(tournamentId, localUserId);

  // Add userId to URL if missing
  useEffect(() => {
    if (username && !userId && !hasUpdatedUrl.current) {
      hasUpdatedUrl.current = true;
      navigate({
        to: '/tournament/$tournamentId/bracket',
        params: { tournamentId },
        search: { username, userId: localUserId },
        replace: true,
      });
    }
  }, [username, userId, localUserId, tournamentId, navigate]);

  // Redirect to lobby if tournament isn't started yet
  useEffect(() => {
    console.warn('[TournamentBracket] Tournament state check:', {
      hasTournament: !!tournament,
      state: tournament?.state,
      roundsCount: tournament?.rounds.length,
      currentRound: tournament?.currentRound,
    });

    if (tournament && (tournament.state === 'registration' || tournament.state === 'ready')) {
      console.warn('[TournamentBracket] Redirecting back to lobby - tournament not started yet');
      navigate({
        to: '/tournament/$tournamentId/lobby',
        params: { tournamentId },
        search: { username, userId: localUserId },
        replace: true,
      });
    }
  }, [tournament, tournamentId, username, localUserId, navigate]);

  // Auto-select and update user's active or ready match
  useEffect(() => {
    if (!tournament)
      return;

    // Don't auto-select if user manually chose to view the bracket
    if (manuallyViewingBracket)
      return;

    // Find a match that the user is in and is ready or active
    for (const round of tournament.rounds) {
      for (const match of round.matches) {
        if (
          match.participants.includes(localUserId)
          && (match.state === 'ready' || match.state === 'active')
        ) {
          // Update selected match if it's the same match but state changed
          if (selectedMatch?.id === match.id) {
            setSelectedMatch(match);
          }
          // Auto-select if no match selected
          else if (!selectedMatch) {
            setSelectedMatch(match);
          }
          return;
        }
      }
    }
  }, [tournament, localUserId, selectedMatch, manuallyViewingBracket]);

  const handleMatchClick = (match: Match) => {
    if (match.participants.includes(localUserId)) {
      setSelectedMatch(match);
      setManuallyViewingBracket(false); // Clear the flag when manually selecting a match
    }
  };

  const handleBackToBracket = () => {
    setSelectedMatch(null);
    setManuallyViewingBracket(true); // Set flag to prevent auto-reselection
  };

  const handleMatchComplete = (matchId: string, results: MatchResult[]) => {
    console.warn('[TournamentBracket] handleMatchComplete called:', { matchId, resultsCount: results.length });
    matchComplete(matchId, results);
    console.warn('[TournamentBracket] matchComplete hook called');
  };

  const handleReadyForMatch = (matchId: string) => {
    readyForMatch(matchId);
  };

  const handleLeaveTournament = () => {
    leaveTournament();
    navigate({ to: '/tournament' });
  };

  const handleBackToHome = () => {
    navigate({ to: '/tournament' });
  };

  if (!username || !localUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">Missing required parameters</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-300">Error</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => navigate({ to: '/tournament' })}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  console.warn('[TournamentBracket] Render check:', {
    isConnected,
    hasTournament: !!tournament,
    tournamentState: tournament?.state,
  });

  if (!isConnected || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {!isConnected ? 'Connecting...' : 'Loading tournament...'}
          </p>
        </div>
      </div>
    );
  }

  // Tournament completed - show results
  if (tournament.state === 'completed') {
    return (
      <TournamentResults
        tournament={tournament}
        userId={localUserId}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Selected match view
  if (selectedMatch) {
    return (
      <TournamentMatch
        tournament={tournament}
        match={selectedMatch}
        userId={localUserId}
        username={username || ''}
        onMatchComplete={handleMatchComplete}
        onReadyForMatch={handleReadyForMatch}
        onBackToBracket={handleBackToBracket}
      />
    );
  }

  // Show bracket
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Round
            {' '}
            {tournament.currentRound}
            {' '}
            of
            {' '}
            {tournament.rounds.filter(r => r.bracket === 'winners').length}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLeaveTournament}
          className="rounded-md bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
        >
          Leave Tournament
        </button>
      </div>

      <TournamentBracket
        tournament={tournament}
        userId={localUserId}
        onMatchClick={handleMatchClick}
      />
    </div>
  );
}

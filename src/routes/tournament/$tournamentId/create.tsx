import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { TournamentCreator } from '@/components/tournament/tournament-creator';
import { useTournament } from '@/hooks/use-tournament';
import type { TournamentSettings } from '@/types/tournament.types';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/tournament/$tournamentId/create')({
  component: CreateTournamentRoute,
});

function CreateTournamentRoute() {
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

  const hasUpdatedUrl = useRef(false);

  const {
    tournament,
    error,
    isConnected,
    createTournament,
  } = useTournament(tournamentId, localUserId);

  // Add userId to URL if missing
  useEffect(() => {
    if (username && !userId && !hasUpdatedUrl.current) {
      hasUpdatedUrl.current = true;
      navigate({
        to: '/tournament/$tournamentId/create',
        params: { tournamentId },
        search: { username, userId: localUserId },
        replace: true,
      });
    }
  }, [username, userId, localUserId, tournamentId, navigate]);

  // Redirect to lobby once tournament is created
  useEffect(() => {
    if (tournament && tournament.state === 'registration') {
      navigate({
        to: '/tournament/$tournamentId/lobby',
        params: { tournamentId },
        search: { username, userId: localUserId },
        replace: true,
      });
    }
  }, [tournament, tournamentId, username, localUserId, navigate]);

  const handleCreateTournament = (settings: TournamentSettings, name: string, hostUsername: string) => {
    createTournament(settings, name, hostUsername);
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

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Connecting to tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <TournamentCreator
      username={username}
      onCreateTournament={handleCreateTournament}
    />
  );
}

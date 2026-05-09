import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import TournamentSessionManager from '@/components/tournament/tournament-session-manager';

export const Route = createFileRoute('/tournament/')({
  component: TournamentIndexRoute,
});

function TournamentIndexRoute() {
  const navigate = useNavigate();

  const [userId] = useState(() => {
    const stored = sessionStorage.getItem('typing-tournament-userId');
    if (stored) return stored;
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('typing-tournament-userId', newId);
    return newId;
  });

  const handleCreateTournament = (hostUsername: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tournamentCode = 'TOUR-';
    for (let i = 0; i < 4; i++) {
      tournamentCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    navigate({
      to: '/tournament/$tournamentId/create',
      params: { tournamentId: tournamentCode },
      search: { username: hostUsername, userId },
    });
  };

  const handleJoinTournament = (tournamentCode: string, joinUsername: string) => {
    navigate({
      to: '/tournament/$tournamentId/lobby',
      params: { tournamentId: tournamentCode },
      search: { username: joinUsername, userId },
    });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tournaments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Create or join a tournament. Single elimination, round-robin, and more.
          </p>
        </div>
        <TournamentSessionManager
          onCreateTournament={handleCreateTournament}
          onJoinTournament={handleJoinTournament}
        />
      </div>
    </div>
  );
}

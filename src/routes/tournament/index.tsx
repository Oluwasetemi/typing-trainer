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
    if (stored) {
      return stored;
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('typing-tournament-userId', newId);
    return newId;
  });

  const handleCreateTournament = (hostUsername: string) => {
    // Generate a unique tournament ID
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tournamentCode = 'TOUR-';
    for (let i = 0; i < 4; i++) {
      tournamentCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    navigate({
      to: '/tournament/$tournamentId/create',
      params: { tournamentId: tournamentCode },
      search: {
        username: hostUsername,
        userId,
      },
    });
  };

  const handleJoinTournament = (tournamentCode: string, joinUsername: string) => {
    navigate({
      to: '/tournament/$tournamentId/lobby',
      params: { tournamentId: tournamentCode },
      search: {
        username: joinUsername,
        userId,
      },
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '900px' }}>
      <TournamentSessionManager
        onCreateTournament={handleCreateTournament}
        onJoinTournament={handleJoinTournament}
      />
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import Competition from '../components/competition/competition';
import CompetitionSessionManager from '../components/competition/competition-session-manager';

type SearchParams = {
  competitionId?: string;
  username?: string;
  userId?: string;
};

export const Route = createFileRoute('/competition')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      competitionId: search.competitionId as string | undefined,
      username: search.username as string | undefined,
      userId: search.userId as string | undefined,
    };
  },
  component: CompetitionRoute,
});

function CompetitionRoute() {
  const navigate = useNavigate();
  const { competitionId, username, userId: urlUserId } = Route.useSearch();

  // Use userId from URL if present, otherwise try sessionStorage, otherwise generate new
  // This allows per-tab userId while persisting across refreshes
  const [userId] = useState(() => {
    console.log('[CompetitionRoute] Initializing userId. urlUserId:', urlUserId);

    if (urlUserId) {
      // URL has userId - use it and store in sessionStorage
      console.log('[CompetitionRoute] Using userId from URL:', urlUserId);
      sessionStorage.setItem('typing-competition-userId', urlUserId);
      return urlUserId;
    }

    // Check sessionStorage for this tab's userId
    const stored = sessionStorage.getItem('typing-competition-userId');
    console.log('[CompetitionRoute] sessionStorage userId:', stored);

    if (stored && competitionId) {
      // We have a stored userId for this tab - use it
      console.log('[CompetitionRoute] Using userId from sessionStorage:', stored);
      return stored;
    }

    // Generate new userId
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[CompetitionRoute] Generated new userId:', newId);
    sessionStorage.setItem('typing-competition-userId', newId);
    return newId;
  });

  // Track if we've already updated the URL to prevent infinite loops
  const hasUpdatedUrl = useRef(false);

  // IMPORTANT: If we're in a competition but userId is not in URL, add it
  // This ensures the userId persists across page refreshes
  useEffect(() => {
    if (competitionId && username && !urlUserId && !hasUpdatedUrl.current) {
      console.log('[Competition] Adding userId to URL for persistence:', userId);
      hasUpdatedUrl.current = true;
      navigate({
        to: '/competition',
        search: { competitionId, username, userId },
        replace: true, // Use replace to not add to history
      });
    }
  }, [competitionId, username, urlUserId, userId, navigate]);

  const handleCreateCompetition = (competitionName: string) => {
    // For now, prompt for username. In a real app, this could come from auth
    // eslint-disable-next-line no-alert
    const userUsername = prompt('Enter your username:');
    if (!userUsername)
      return;

    // Generate a unique competition code that will also be the room ID
    // Format: RACE-XXXX where XXXX is random alphanumeric
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RACE-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Use the existing userId from state, don't generate a new one
    // This ensures the same user maintains their identity across navigation
    const currentUserId = userId;

    navigate({
      to: '/competition',
      search: {
        competitionId: code,
        username: userUsername,
        userId: currentUserId,
      },
    });
  };

  const handleJoinCompetition = (competitionCode: string, joinUsername: string) => {
    // Use the existing userId from state, don't generate a new one
    // This ensures the same user maintains their identity across navigation
    const currentUserId = userId;

    // The competition code IS the competition ID/room ID
    navigate({
      to: '/competition',
      search: {
        competitionId: competitionCode.toUpperCase(),
        username: joinUsername,
        userId: currentUserId,
      },
    });
  };

  const handleLeave = () => {
    navigate({ to: '/competition' });
  };

  // Show session manager if no competition ID
  if (!competitionId || !username) {
    return (
      <CompetitionSessionManager
        onCreateCompetition={handleCreateCompetition}
        onJoinCompetition={handleJoinCompetition}
      />
    );
  }

  // Show competition view
  return (
    <Competition
      competitionId={competitionId}
      userId={userId}
      username={username}
      onLeave={handleLeave}
    />
  );
}

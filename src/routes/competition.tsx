import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Notification } from '../components/common';
import Competition from '../components/competition/competition';
import CompetitionSessionManager from '../components/competition/competition-session-manager';
import { useNotification } from '../hooks/use-notification';

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
  const { notification, hideNotification, showSuccess } = useNotification();

  const [userId] = useState(() => {
    if (urlUserId) {
      sessionStorage.setItem('typing-competition-userId', urlUserId);
      return urlUserId;
    }
    const stored = sessionStorage.getItem('typing-competition-userId');
    if (stored && competitionId) return stored;
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('typing-competition-userId', newId);
    return newId;
  });

  const hasUpdatedUrl = useRef(false);

  useEffect(() => {
    if (competitionId && username && !urlUserId && !hasUpdatedUrl.current) {
      hasUpdatedUrl.current = true;
      navigate({
        to: '/competition',
        search: { competitionId, username, userId },
        replace: true,
      });
    }
  }, [competitionId, username, urlUserId, userId, navigate]);

  const copyClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      showSuccess('Competition code copied!', `Code ${code} has been copied to clipboard. Share it with friends!`);
    }).catch(() => {});
  };

  const handleCreateCompetition = (_competitionName: string, userUsername: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RACE-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    copyClipboard(code);
    navigate({
      to: '/competition',
      search: { competitionId: code, username: userUsername, userId },
    });
  };

  const handleJoinCompetition = (competitionCode: string, joinUsername: string) => {
    navigate({
      to: '/competition',
      search: { competitionId: competitionCode.toUpperCase(), username: joinUsername, userId },
    });
  };

  const handleLeave = () => {
    navigate({ to: '/competition' });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <h1
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Live Competitions
            </h1>
            {competitionId && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {competitionId}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {competitionId && username
              ? `Racing as ${username}`
              : 'Create a room or join an existing competition.'}
          </p>
        </div>

        {!competitionId || !username
          ? (
              <CompetitionSessionManager
                onCreateCompetition={handleCreateCompetition}
                onJoinCompetition={handleJoinCompetition}
              />
            )
          : (
              <Competition
                competitionId={competitionId}
                userId={userId}
                username={username}
                onLeave={handleLeave}
              />
            )}

        <Notification
          show={notification.show}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { RealtimeTypingTrainer } from '../components/realtime-typing-trainer';
import { SessionManager } from '../components/session-manager';
import { generateSessionOGImageUrl } from '../utils/og-image';

type SessionSearchParams = {
  sessionId?: string;
  userId?: string;
  sessionName?: string;
};

export const Route = createFileRoute('/session')({
  ssr: true,
  validateSearch: (search: Record<string, unknown>): SessionSearchParams => {
    return {
      sessionId: search.sessionId as string | undefined,
      userId: search.userId as string | undefined,
      sessionName: search.sessionName as string | undefined,
    };
  },
  head: ({ match }) => {
    const { sessionId } = match.search;
    if (!sessionId) {
      return {
        title: 'Sessions — KeyRush',
        meta: [
          {
            name: 'description',
            content: 'Create or join real-time typing sessions with live spectators and collaboration features.',
          },
        ],
      };
    }
    return {
      title: `Session ${sessionId} — KeyRush`,
      meta: [
        {
          name: 'description',
          content: `Join this real-time typing session (${sessionId}) and improve your typing skills with live collaboration.`,
        },
        {
          property: 'og:title',
          content: `Session ${sessionId} — KeyRush`,
        },
        {
          property: 'og:description',
          content: 'Real-time typing practice session. Join and start typing.',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:image',
          content: generateSessionOGImageUrl(sessionId),
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: `Session ${sessionId} — KeyRush`,
        },
        {
          name: 'twitter:description',
          content: 'Real-time typing practice session.',
        },
        {
          name: 'twitter:image',
          content: generateSessionOGImageUrl(sessionId),
        },
      ],
    };
  },
  component: SessionPage,
});

function SessionPage() {
  const navigate = useNavigate();
  const { sessionId, userId, sessionName } = Route.useSearch();
  const [generatedUserId] = useState(
    () => userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );

  const handleStartSession = (
    newSessionId: string,
    role: 'typist' | 'spectator',
    newSessionName?: string,
  ) => {
    if (role === 'typist') {
      navigate({
        to: '/session',
        search: { sessionId: newSessionId, ...(newSessionName && { sessionName: newSessionName }) },
      });
    }
    else {
      navigate({
        to: '/spectator',
        search: { sessionId: newSessionId, ...(newSessionName && { sessionName: newSessionName }) },
      });
    }
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
              Sessions
            </h1>
            {sessionId && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {sessionId}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {sessionId
              ? (sessionName ?? 'Live session in progress')
              : 'Create or join a shared typing session.'}
          </p>
        </div>

        {!sessionId
          ? <SessionManager onStartSession={handleStartSession} />
          : <RealtimeTypingTrainer sessionId={sessionId} userId={generatedUserId} sessionName={sessionName} />}
      </div>
    </div>
  );
}

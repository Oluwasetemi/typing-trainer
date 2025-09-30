import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { RealtimeTypingTrainer } from '../components/realtime-typing-trainer';
import { generateSessionOGImageUrl } from '../utils/og-image';

type SessionSearchParams = {
  sessionId: string;
  userId?: string;
};

export const Route = createFileRoute('/session')({
  validateSearch: (search: Record<string, unknown>): SessionSearchParams => {
    const sessionId = search.sessionId as string;
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    return {
      sessionId,
      userId: search.userId as string | undefined,
    };
  },
  head: ({ match }) => ({
    title: `Typing Session - ${match.search.sessionId}`,
    meta: [
      {
        name: 'description',
        content: `Join this real-time typing session (${match.search.sessionId}) and improve your typing skills with live collaboration.`,
      },
      {
        property: 'og:title',
        content: `Typing Session - ${match.search.sessionId}`,
      },
      {
        property: 'og:description',
        content: `Real-time typing practice session. Join and start typing to improve your speed and accuracy.`,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: generateSessionOGImageUrl(match.search.sessionId),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: `Typing Session - ${match.search.sessionId}`,
      },
      {
        name: 'twitter:description',
        content: `Real-time typing practice session. Join and start typing to improve your speed and accuracy.`,
      },
      {
        name: 'twitter:image',
        content: generateSessionOGImageUrl(match.search.sessionId),
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: `https://deploy-preview-3--realtime-typing-trainer.netlify.app/session?sessionId=${match.search.sessionId}`,
      },
    ],
  }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId, userId } = Route.useSearch();
  const [generatedUserId] = useState(
    () => userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );

  return <RealtimeTypingTrainer sessionId={sessionId} userId={generatedUserId} />;
}

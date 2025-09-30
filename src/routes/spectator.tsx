import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { SpectatorView } from '../components/spectator-view';
import { generateSpectatorOGImageUrl } from '../utils/og-image';

type SpectatorSearchParams = {
  sessionId: string;
  userId?: string;
};

export const Route = createFileRoute('/spectator')({
  validateSearch: (search: Record<string, unknown>): SpectatorSearchParams => {
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
    title: `Watch Typing Session - ${match.search.sessionId}`,
    meta: [
      {
        name: 'description',
        content: `Watch this real-time typing session (${match.search.sessionId}) and see live typing progress from other users.`,
      },
      {
        property: 'og:title',
        content: `Watch Typing Session - ${match.search.sessionId}`,
      },
      {
        property: 'og:description',
        content: `Spectate a real-time typing session. Watch live typing progress and learn from others.`,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: generateSpectatorOGImageUrl(match.search.sessionId),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: `Watch Typing Session - ${match.search.sessionId}`,
      },
      {
        name: 'twitter:description',
        content: `Spectate a real-time typing session. Watch live typing progress and learn from others.`,
      },
      {
        name: 'twitter:image',
        content: generateSpectatorOGImageUrl(match.search.sessionId),
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: `https://typing-trainer.vercel.app/spectator?sessionId=${match.search.sessionId}`,
      },
    ],
  }),
  component: SpectatorPage,
});

function SpectatorPage() {
  const { sessionId, userId } = Route.useSearch();
  const [generatedUserId] = useState(
    () => userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );

  return <SpectatorView sessionId={sessionId} userId={generatedUserId} />;
}

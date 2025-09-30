import { TanstackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import Header from '../components/header';
import { generateDefaultOGImageUrl } from '../utils/og-image';

export const Route = createRootRoute({
  head: () => ({
    title: 'Real-time Typing Trainer',
    meta: [
      {
        name: 'description',
        content: 'Practice typing with real-time collaboration. Create sessions, join as spectator, or practice solo.',
      },
      {
        name: 'keywords',
        content: 'typing, practice, real-time, collaboration, typing trainer, wpm, accuracy',
      },
      {
        property: 'og:title',
        content: 'Real-time Typing Trainer',
      },
      {
        property: 'og:description',
        content: 'Practice typing with real-time collaboration. Create sessions, join as spectator, or practice solo.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://deploy-preview-3--realtime-typing-trainer.netlify.app',
      },
      {
        property: 'og:image',
        content: generateDefaultOGImageUrl(),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Real-time Typing Trainer',
      },
      {
        name: 'twitter:description',
        content: 'Practice typing with real-time collaboration. Create sessions, join as spectator, or practice solo.',
      },
      {
        name: 'twitter:image',
        content: generateDefaultOGImageUrl(),
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'canonical',
        href: 'https://deploy-preview-3--realtime-typing-trainer.netlify.app',
      },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <HeadContent />
      <Header />
      <main className="flex items-center justify-center p-4">
        <Outlet />
      </main>
      {import.meta.env.DEV && (
        <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="text-center text-2xl">Not Found</main>
    </div>
  ),
});

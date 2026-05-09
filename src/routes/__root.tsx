import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import NotFound404Page from '../components/404-page';
import Navbar from '../components/common/navbar';
import OfflineIndicator from '../components/common/offline-indicator';
import UpdatePrompt from '../components/common/update-prompt';
import { SettingsProvider } from '../context/settings-context';
import { ThemeProvider } from '../context/theme-context';
import { generateDefaultOGImageUrl } from '../utils/og-image';

export const Route = createRootRoute({
  head: () => ({
    title: 'KeyRush — Type faster. Win every room.',
    meta: [
      {
        name: 'description',
        content:
          'Real-time multiplayer typing competitions, solo practice, and tournament brackets — built for professionals who move fast.',
      },
      {
        name: 'keywords',
        content:
          'typing, practice, real-time, competition, typing trainer, wpm, accuracy, tournament, keyrush',
      },
      {
        property: 'og:title',
        content: 'KeyRush — Type faster. Win every room.',
      },
      {
        property: 'og:description',
        content:
          'Real-time multiplayer typing competitions, solo practice, and tournament brackets — built for professionals who move fast.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content:
          'https://deploy-preview-3--realtime-typing-trainer.netlify.app',
      },
      {
        property: 'og:image',
        content: generateDefaultOGImageUrl(),
      },
      {
        property: 'og:logo',
        content:
          'https://deploy-preview-3--realtime-typing-trainer.netlify.app/favicon.ico',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'KeyRush — Type faster. Win every room.',
      },
      {
        name: 'twitter:description',
        content:
          'Real-time multiplayer typing competitions, solo practice, and tournament brackets — built for professionals who move fast.',
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
    <ThemeProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
          <OfflineIndicator />
          <Navbar />
          <main>
            <Outlet />
          </main>
          <UpdatePrompt />
          {import.meta.env.DEV && (
            <TanStackDevtools
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
      </SettingsProvider>
    </ThemeProvider>
  ),
  notFoundComponent: NotFound404Page,
});

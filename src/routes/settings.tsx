import { createFileRoute } from '@tanstack/react-router';
import {
  Accessibility,
  BarChart3,
  KeyboardIcon,
  Monitor,
  Music,
  Settings as SettingsIcon,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import SettingsPage from '../components/settings/settings-page';

export const Route = createFileRoute('/settings')({
  ssr: true,
  head: () => ({
    title: 'Settings — KeyRush',
    meta: [
      {
        name: 'description',
        content: 'Configure your KeyRush preferences: display, keyboard, audio, accessibility, and more.',
      },
    ],
  }),
  component: SettingsRoute,
});

const secondaryNavigation = [
  { name: 'Display', icon: Monitor, section: 'display' },
  { name: 'Keyboard', icon: KeyboardIcon, section: 'keyboard' },
  { name: 'Progress & Stats', icon: BarChart3, section: 'progress' },
  { name: 'Audio', icon: Music, section: 'audio' },
  { name: 'Behavior', icon: SettingsIcon, section: 'behavior' },
  { name: 'Competition', icon: Trophy, section: 'competition' },
  { name: 'Session', icon: Users, section: 'session' },
  { name: 'Accessibility', icon: Accessibility, section: 'accessibility' },
];

function SettingsRoute() {
  const [currentSection, setCurrentSection] = useState('display');

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage your typing preferences and display options.
          </p>
        </div>

        <div className="lg:flex lg:gap-x-10 pb-16">
          {/* Sticky sidebar */}
          <aside className="lg:w-52 lg:flex-none mb-8 lg:mb-0">
            <nav
              className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:sticky"
              style={{ top: 'calc(56px + 2rem)' }}
            >
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.section;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setCurrentSection(item.section)}
                    className={`flex items-center gap-2.5 whitespace-nowrap w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-zinc-800'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon
                      className={`size-4 flex-shrink-0 ${isActive ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Settings content card */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
              <SettingsPage currentSection={currentSection} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from '@tanstack/react-router';
import { Accessibility, BarChart3, KeyboardIcon, Monitor, Music, Settings as SettingsIcon, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

import SettingsPage from '../components/settings/settings-page';

export const Route = createFileRoute('/settings')({
  ssr: true,
  head: () => ({
    title: 'Settings - Typing Trainer',
    meta: [
      {
        name: 'description',
        content:
          'Configure your typing trainer preferences including display options, keyboard settings, and more.',
      },
    ],
  }),
  component: SettingsRoute,
});

// const navigation = [
//   { name: 'Solo', href: '/solo' },
//   { name: 'Session', href: '/session' },
//   { name: 'Competition', href: '/competition' },
// ];

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
    <>
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-col items-center gap-y-6">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                ⌨️ Typing Trainer
              </Link>
            </div>
            {/* <nav className="hidden md:flex md:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/settings"
                className="text-sm font-medium text-indigo-600"
              >
                Settings
              </Link>
            </nav> */}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
        <h1 className="sr-only">Settings</h1>

        {/* Sidebar Navigation */}
        <aside className="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-8">
          <nav className="flex-none px-4 sm:px-6 lg:px-0">
            <ul
              role="list"
              className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
            >
              {secondaryNavigation.map(item => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => setCurrentSection(item.section)}
                    className={`group flex w-full gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6 ${
                      currentSection === item.section
                        ? 'bg-gray-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        currentSection === item.section
                          ? 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-indigo-600'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="px-4 py-8 sm:px-6 lg:flex-auto lg:px-0">
          <SettingsPage currentSection={currentSection} />
        </main>
      </div>
    </>
  );
}

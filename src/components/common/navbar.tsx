import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Link, useRouterState } from '@tanstack/react-router';

import { capitalizeFirst } from '@/utils/texts';

import { useTheme } from '../../context/theme-context';
import { Icons } from '../../utils/icons';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Solo Practice', href: '/solo' },
  { name: 'Competition', href: '/competition' },
  { name: 'Session', href: '/session' },
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { themeMode, toggleMode } = useTheme();

  return (
    <Disclosure
      as="nav"
      className="relative bg-gray-800 dark:bg-gray-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-purple-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Icons.Menu aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <Icons.CloseMenu aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link to="/">
                <img
                  alt="Typing Trainer Logo"
                  src="/icon.svg"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const isCurrent = currentPath === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={classNames(
                        isCurrent
                          ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium',
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              onClick={toggleMode}
              className="relative rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-purple-500 transition-colors"
              title={`Theme: ${capitalizeFirst(themeMode)}`}
            >
              <span className="sr-only">
                Toggle theme (currently
                {themeMode}
                )
              </span>
              {themeMode === 'light' && <Icons.Sun aria-hidden="true" className="size-5" />}
              {themeMode === 'dark' && <Icons.Moon aria-hidden="true" className="size-5" />}
              {themeMode === 'auto' && <Icons.Sparkles aria-hidden="true" className="size-5" />}
            </button>
            <Link
              to="/settings"
              className="relative rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-purple-500 transition-colors"
            >
              <span className="sr-only">Settings</span>
              <Icons.Settings aria-hidden="true" className="size-5" />
            </Link>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => {
            const isCurrent = currentPath === item.href;
            return (
              <DisclosureButton
                key={item.name}
                as={Link}
                to={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={classNames(
                  isCurrent
                    ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium',
                )}
              >
                {item.name}
              </DisclosureButton>
            );
          })}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

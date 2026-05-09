import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, Settings, X } from 'lucide-react';

import { useTheme } from '../../context/theme-context';
import { Icons } from '../../utils/icons';

const navigation = [
  { name: 'Solo', href: '/solo' },
  { name: 'Compete', href: '/competition' },
  { name: 'Sessions', href: '/session' },
  { name: 'Tournament', href: '/tournament' },
];

export default function Navbar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { themeMode, toggleMode } = useTheme();

  const isActive = (href: string) =>
    currentPath === href || (href !== '/' && currentPath.startsWith(href));

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Wordmark */}
          <Link
            to="/"
            className="flex-shrink-0 font-bold text-lg text-white tracking-tight hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ⚡ KeyRush
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-0.5">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={
                  isActive(item.href)
                    ? 'relative px-3.5 py-1.5 text-sm font-semibold text-white rounded-lg bg-zinc-800'
                    : 'px-3.5 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors duration-150'
                }
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-violet-500" />
                )}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMode}
              title={`Theme: ${themeMode}`}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              <span className="sr-only">Toggle theme</span>
              {themeMode === 'light' && <Icons.Sun className="size-[18px]" aria-hidden="true" />}
              {themeMode === 'dark' && <Icons.Moon className="size-[18px]" aria-hidden="true" />}
              {themeMode === 'auto' && <Icons.Sparkles className="size-[18px]" aria-hidden="true" />}
            </button>
            <Link
              to="/settings"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'text-white bg-zinc-800'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <span className="sr-only">Settings</span>
              <Settings className="size-[18px]" aria-hidden="true" />
            </Link>

            {/* Mobile hamburger */}
            <DisclosureButton className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/60 transition-colors">
              <span className="sr-only">Open menu</span>
              <Menu className="size-[18px] group-data-open:hidden" aria-hidden="true" />
              <X className="size-[18px] hidden group-data-open:block" aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden border-t border-zinc-800/80 bg-zinc-950">
        <div className="px-4 py-3 space-y-0.5">
          {navigation.map(item => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={
                isActive(item.href)
                  ? 'flex px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-zinc-800'
                  : 'flex px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800/60 transition-colors'
              }
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

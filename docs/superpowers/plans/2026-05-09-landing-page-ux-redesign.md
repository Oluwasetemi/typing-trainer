# KeyRush Landing Page & UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the typing trainer app as "KeyRush" — a bold, premium product with a full landing page and consistent design across all inner pages.

**Architecture:** New landing components live in `src/components/landing/`. The root layout main wrapper loses its centering so each page controls its own layout. Inner pages get a consistent page-header block above their existing content; no typing logic changes.

**Tech Stack:** React 19, TailwindCSS 4, motion v12 (Framer Motion), Headless UI, lucide-react, TanStack Router

---

## File Map

### New files
- `src/components/landing/hero.tsx` — full-viewport hero with animated WPM counter and two CTAs
- `src/components/landing/features-grid.tsx` — bento grid of four product modes
- `src/components/landing/stats-bar.tsx` — dark strip with three product stats
- `src/components/landing/footer-cta.tsx` — closing CTA section and site footer

### Modified files
- `src/styles.css` — add `--navbar-height: 56px` update; no other changes needed (Tailwind handles tokens)
- `src/components/common/navbar.tsx` — full redesign: glass effect, KeyRush wordmark, Tournament link, violet active indicator
- `src/routes/__root.tsx` — remove centering/padding from `<main>` so each page controls its own layout; update root title to "KeyRush"
- `src/routes/index.tsx` — rewrite: compose landing sections, preserve deep-link redirect logic
- `src/routes/solo.tsx` — add page header block above `<TypingTrainer />`
- `src/routes/competition.tsx` — add page header block, consistent max-w container
- `src/routes/session.tsx` — add page header block with session code badge when active
- `src/routes/settings.tsx` — already has sidebar; convert sections to cards, make sidebar sticky

---

## Task 1: Update navbar height CSS variable

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Update the navbar height custom property**

In `src/styles.css`, find the `:root` block inside `@layer base` and change `--navbar-height` from `50px` to `56px`:

```css
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }

  :root {
    --navbar-height: 56px;
    scroll-padding-top: var(--navbar-height);
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
npx tsc --noEmit 2>&1 | grep -v "vite\|vitest\|pwa" | head -20
```

Expected: no output (no errors in app files).

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "style: update navbar height to 56px"
```

---

## Task 2: Redesign the navbar

**Files:**
- Modify: `src/components/common/navbar.tsx`

- [ ] **Step 1: Rewrite navbar.tsx in full**

Replace the entire file with:

```tsx
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

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Wordmark */}
          <Link to="/" className="flex-shrink-0 text-white font-bold text-xl tracking-tight">
            KeyRush
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {navigation.map((item) => {
              const isCurrent = currentPath === item.href || currentPath.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={
                    isCurrent
                      ? 'px-3 py-1.5 text-sm font-medium text-white border-b-2 border-violet-500 pb-1'
                      : 'px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors'
                  }
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMode}
              title={`Theme: ${themeMode}`}
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Toggle theme</span>
              {themeMode === 'light' && <Icons.Sun className="size-5" aria-hidden="true" />}
              {themeMode === 'dark' && <Icons.Moon className="size-5" aria-hidden="true" />}
              {themeMode === 'auto' && <Icons.Sparkles className="size-5" aria-hidden="true" />}
            </button>
            <Link
              to="/settings"
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Settings</span>
              <Settings className="size-5" aria-hidden="true" />
            </Link>

            {/* Mobile hamburger */}
            <DisclosureButton className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Open menu</span>
              <Menu className="size-5 group-data-open:hidden" aria-hidden="true" />
              <X className="size-5 hidden group-data-open:block" aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden border-t border-zinc-800">
        <div className="px-4 py-3 space-y-1">
          {navigation.map((item) => {
            const isCurrent = currentPath === item.href || currentPath.startsWith(item.href + '/');
            return (
              <DisclosureButton
                key={item.name}
                as={Link}
                to={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent
                    ? 'block px-3 py-2 rounded-lg text-sm font-medium text-white bg-zinc-800'
                    : 'block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors'
                }
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "navbar" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/navbar.tsx
git commit -m "feat: redesign navbar with KeyRush brand and glass effect"
```

---

## Task 3: Update root layout

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Remove centering from main, update root title**

Replace the component function body in `src/routes/__root.tsx`. The only changes are: `<main>` loses `flex items-center justify-center p-4`, and the root title becomes `KeyRush`:

```tsx
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "__root" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: update root layout title to KeyRush, remove main centering"
```

---

## Task 4: Create the landing Hero component

**Files:**
- Create: `src/components/landing/hero.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p /Users/oluwasetemi/r/typing/src/components/landing
```

- [ ] **Step 2: Write hero.tsx**

Create `src/components/landing/hero.tsx`:

```tsx
import { Link } from '@tanstack/react-router';
import { animate } from 'motion';
import { useEffect, useRef } from 'react';

function WpmCounter() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, 127, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate(v) {
        node.textContent = Math.round(v).toString();
      },
    });

    return () => controls.stop();
  }, []);

  return <span ref={ref}>0</span>;
}

export default function Hero() {
  return (
    <section className="bg-zinc-950 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="text-white block">Type faster.</span>
          <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Win every room.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Real-time multiplayer typing competitions, solo practice, and tournament brackets —
          built for professionals who move fast.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/solo"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Practicing
          </Link>
          <Link
            to="/competition"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl transition-all"
          >
            Compete Now
          </Link>
        </div>

        {/* Animated stat */}
        <div className="text-center">
          <div className="text-5xl font-black text-white tabular-nums">
            <WpmCounter />
            <span> WPM</span>
          </div>
          <p className="text-gray-500 text-sm mt-2 tracking-wide">
            avg WPM gained by users in 30 days
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "hero" | head -10
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat: add landing Hero component with animated WPM counter"
```

---

## Task 5: Create the Features Grid component

**Files:**
- Create: `src/components/landing/features-grid.tsx`

- [ ] **Step 1: Write features-grid.tsx**

Create `src/components/landing/features-grid.tsx`:

```tsx
import { Link } from '@tanstack/react-router';

const features = [
  {
    title: 'Solo Practice',
    description:
      'Train at your own pace with real-time error feedback, keyboard visualization, and detailed session stats. No pressure, full focus.',
    href: '/solo',
    cta: 'Try it',
    size: 'large',
  },
  {
    title: 'Live Competitions',
    description:
      'Race others in real-time. The leaderboard updates keystroke-by-keystroke as you type.',
    href: '/competition',
    cta: null,
    size: 'small',
  },
  {
    title: 'Tournaments',
    description:
      'Single elimination, double elimination, round-robin, and swiss brackets. Serious competition for serious typists.',
    href: '/tournament',
    cta: null,
    size: 'small',
  },
  {
    title: 'Sessions',
    description:
      'Shared typing sessions with spectator mode and live participant stats. Perfect for teams and pair practice.',
    href: '/session',
    cta: 'Join a session',
    size: 'wide',
  },
] as const;

export default function FeaturesGrid() {
  return (
    <section className="bg-gray-50 dark:bg-zinc-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
          Everything you need to type faster
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
          Four modes. One platform.
        </h2>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solo — tall left card */}
          <div className="md:row-span-2 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {features[0].title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {features[0].description}
              </p>
            </div>
            <Link
              to={features[0].href}
              className="mt-8 self-start text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              {features[0].cta} →
            </Link>
          </div>

          {/* Live Competitions — top right */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {features[1].title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              {features[1].description}
            </p>
          </div>

          {/* Tournaments — bottom right */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {features[2].title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              {features[2].description}
            </p>
          </div>

          {/* Sessions — full width bottom */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {features[3].title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                {features[3].description}
              </p>
            </div>
            <Link
              to={features[3].href}
              className="flex-shrink-0 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
            >
              {features[3].cta} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "features-grid" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/features-grid.tsx
git commit -m "feat: add landing FeaturesGrid bento component"
```

---

## Task 6: Create Stats Bar and Footer CTA components

**Files:**
- Create: `src/components/landing/stats-bar.tsx`
- Create: `src/components/landing/footer-cta.tsx`

- [ ] **Step 1: Write stats-bar.tsx**

Create `src/components/landing/stats-bar.tsx`:

```tsx
const stats = [
  { value: '10K+', label: 'matches played' },
  { value: '127 WPM', label: 'average improvement' },
  { value: '4', label: 'game modes' },
];

export default function StatsBar() {
  return (
    <section className="bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-zinc-800">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:px-8">
              <div className="text-4xl font-black text-white tabular-nums">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write footer-cta.tsx**

Create `src/components/landing/footer-cta.tsx`:

```tsx
import { Link } from '@tanstack/react-router';

const footerLinks = [
  { name: 'Solo', href: '/solo' },
  { name: 'Compete', href: '/competition' },
  { name: 'Sessions', href: '/session' },
  { name: 'Tournament', href: '/tournament' },
  { name: 'Settings', href: '/settings' },
];

export default function FooterCta() {
  return (
    <section className="bg-zinc-950 border-t border-zinc-800 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-8">
          Ready to get fast?
        </h2>
        <Link
          to="/solo"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start for free →
        </Link>

        {/* Footer links */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs text-gray-600">© 2026 KeyRush</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep -E "stats-bar|footer-cta" | head -10
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/stats-bar.tsx src/components/landing/footer-cta.tsx
git commit -m "feat: add landing StatsBar and FooterCta components"
```

---

## Task 7: Rewrite the landing page route

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Rewrite index.tsx**

Replace the entire file:

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import FooterCta from '../components/landing/footer-cta';
import FeaturesGrid from '../components/landing/features-grid';
import Hero from '../components/landing/hero';
import StatsBar from '../components/landing/stats-bar';

type SearchParams = {
  session?: string;
  role?: string;
};

export const Route = createFileRoute('/')({
  ssr: true,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      session: search.session as string | undefined,
      role: search.role as string | undefined,
    };
  },
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { session, role } = Route.useSearch();

  // Preserve deep-link handling for shared session URLs
  useEffect(() => {
    if (session && role) {
      if (role === 'spectator') {
        navigate({ to: '/spectator', search: { sessionId: session } });
      }
      else if (role === 'typist') {
        navigate({ to: '/session', search: { sessionId: session } });
      }
    }
  }, [session, role, navigate]);

  return (
    <>
      <Hero />
      <FeaturesGrid />
      <StatsBar />
      <FooterCta />
    </>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "index" | grep -v "node_modules" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: rewrite home route as KeyRush landing page"
```

---

## Task 8: Add page header to Solo page

**Files:**
- Modify: `src/routes/solo.tsx`

- [ ] **Step 1: Add page wrapper with header**

Replace `src/routes/solo.tsx` with:

```tsx
import { createFileRoute } from '@tanstack/react-router';

import TypingTrainer from '../components/typing-trainer';
import { generateSoloOGImageUrl } from '../utils/og-image';

export const Route = createFileRoute('/solo')({
  ssr: true,
  head: () => ({
    title: 'Solo Practice — KeyRush',
    meta: [
      {
        name: 'description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization. Improve your speed and accuracy.',
      },
      {
        property: 'og:title',
        content: 'Solo Practice — KeyRush',
      },
      {
        property: 'og:description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: generateSoloOGImageUrl(),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Solo Practice — KeyRush',
      },
      {
        name: 'twitter:description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization.',
      },
      {
        name: 'twitter:image',
        content: generateSoloOGImageUrl(),
      },
    ],
  }),
  component: SoloPage,
});

function SoloPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Solo Practice
          </h1>
          <p className="text-gray-500 mt-1">
            Train at your own pace. No distractions.
          </p>
        </div>
        <TypingTrainer />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "solo" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/solo.tsx
git commit -m "feat: add page header and consistent layout to Solo page"
```

---

## Task 9: Add page header to Competition page

**Files:**
- Modify: `src/routes/competition.tsx`

- [ ] **Step 1: Add page wrapper and header**

In `src/routes/competition.tsx`, replace both return statements (the `!competitionId || !username` branch and the active competition branch) with a consistent layout wrapper. Keep all existing logic unchanged — only the JSX structure changes:

```tsx
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
        {/* Page header */}
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Live Competitions
          </h1>
          <p className="text-gray-500 mt-1">
            {competitionId && username
              ? `Room: ${competitionId}`
              : 'Create a room or join an existing one.'}
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "competition" | grep -v "node_modules" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/competition.tsx
git commit -m "feat: add page header and consistent layout to Competition page"
```

---

## Task 10: Add page header to Session page

**Files:**
- Modify: `src/routes/session.tsx`

- [ ] **Step 1: Add page wrapper and header with session code badge**

Replace `src/routes/session.tsx` with:

```tsx
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
          content: 'Real-time typing practice session. Join and start typing to improve your speed and accuracy.',
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
        {/* Page header */}
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sessions
            </h1>
            {sessionId && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-mono font-semibold">
                {sessionId}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {sessionId
              ? (sessionName || 'Live session')
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "session" | grep -v "node_modules" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/routes/session.tsx
git commit -m "feat: add page header with session code badge to Session page"
```

---

## Task 11: Update Settings page to card sections with sticky sidebar

**Files:**
- Modify: `src/routes/settings.tsx`

- [ ] **Step 1: Read current settings.tsx to understand section structure**

The settings route at `src/routes/settings.tsx` already has a sidebar with `secondaryNavigation` sections. The change: make the sidebar sticky, wrap each section in a card, and apply the consistent page header.

Replace `src/routes/settings.tsx` with:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router';
import { Accessibility, BarChart3, KeyboardIcon, Monitor, Music, Settings as SettingsIcon, Trophy, Users } from 'lucide-react';
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
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm">
              KeyRush
            </Link>
            <span className="text-gray-300 dark:text-zinc-600">/</span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-gray-500 mt-1">Manage your typing preferences and display options.</p>
        </div>

        <div className="lg:flex lg:gap-x-12 pb-16">
          {/* Sticky sidebar */}
          <aside className="lg:w-56 lg:flex-none mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-[calc(56px+2rem)]">
              {/* Mobile: horizontal scroll */}
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.section;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setCurrentSection(item.section)}
                      className={`flex items-center gap-2.5 whitespace-nowrap w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-zinc-700'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="size-4 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Settings content in a card */}
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "settings" | grep -v "node_modules" | head -20
```

Expected: no output (or only pre-existing errors unrelated to settings).

- [ ] **Step 4: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "feat: update Settings page with sticky sidebar and card layout"
```

---

## Task 12: Add page headers to Tournament pages

**Files:**
- Modify: `src/routes/tournament/index.tsx`
- Modify: `src/routes/tournament/$tournamentId.tsx`

- [ ] **Step 1: Update tournament index with page wrapper**

Replace `src/routes/tournament/index.tsx` with:

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import TournamentSessionManager from '@/components/tournament/tournament-session-manager';

export const Route = createFileRoute('/tournament/')({
  component: TournamentIndexRoute,
});

function TournamentIndexRoute() {
  const navigate = useNavigate();

  const [userId] = useState(() => {
    const stored = sessionStorage.getItem('typing-tournament-userId');
    if (stored) return stored;
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('typing-tournament-userId', newId);
    return newId;
  });

  const handleCreateTournament = (hostUsername: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tournamentCode = 'TOUR-';
    for (let i = 0; i < 4; i++) {
      tournamentCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    navigate({
      to: '/tournament/$tournamentId/create',
      params: { tournamentId: tournamentCode },
      search: { username: hostUsername, userId },
    });
  };

  const handleJoinTournament = (tournamentCode: string, joinUsername: string) => {
    navigate({
      to: '/tournament/$tournamentId/lobby',
      params: { tournamentId: tournamentCode },
      search: { username: joinUsername, userId },
    });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tournaments
          </h1>
          <p className="text-gray-500 mt-1">
            Create or join a tournament. Single elimination, round-robin, and more.
          </p>
        </div>
        <TournamentSessionManager
          onCreateTournament={handleCreateTournament}
          onJoinTournament={handleJoinTournament}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update tournament layout to apply consistent wrapper to all sub-pages**

Replace `src/routes/tournament/$tournamentId.tsx` with:

```tsx
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';

type TournamentSearchParams = {
  username?: string;
  userId?: string;
};

export const Route = createFileRoute('/tournament/$tournamentId')({
  validateSearch: (search: Record<string, unknown>): TournamentSearchParams => {
    return {
      username: search.username as string | undefined,
      userId: search.userId as string | undefined,
    };
  },
  component: TournamentLayout,
});

function TournamentLayout() {
  const { tournamentId } = useParams({ from: '/tournament/$tournamentId' });

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tournament
          </h1>
          <p className="text-gray-500 mt-1 font-mono text-sm">
            {tournamentId}
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify type check**

```bash
npx tsc --noEmit 2>&1 | grep "tournament" | grep -v "node_modules" | head -10
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/routes/tournament/index.tsx "src/routes/tournament/\$tournamentId.tsx"
git commit -m "feat: add page headers and consistent layout to Tournament pages"
```

---

## Task 13: Final verification

- [ ] **Step 1: Full type check**

```bash
npx tsc --noEmit 2>&1 | grep -v "vite\|vitest\|pwa\|node_modules" | head -30
```

Expected: no output (no errors in app source files).

- [ ] **Step 2: Lint check**

```bash
bun run lint 2>&1 | grep -E "error|warning" | grep -v "node_modules" | head -20
```

Expected: no errors in modified files.

- [ ] **Step 3: Manual checklist**

Start the dev server (`bun run dev`) and verify:

- [ ] `/` — Landing page renders: hero with animated counter, bento grid, stats bar, footer CTA
- [ ] `/` — Clicking "Start Practicing" navigates to `/solo`
- [ ] `/` — Clicking "Compete Now" navigates to `/competition`
- [ ] `/?session=ABC&role=typist` — redirects to `/session?sessionId=ABC` (deep link preserved)
- [ ] `/solo` — page header "Solo Practice" visible above typing trainer
- [ ] `/competition` — page header "Live Competitions" visible, room code shows in subtitle when active
- [ ] `/session` — session code badge visible when session is active
- [ ] `/settings` — sidebar is sticky on desktop; sections render inside a card
- [ ] Navbar — "KeyRush" wordmark links to `/`, Tournament link present, violet underline on active link
- [ ] Dark mode toggle still works across all pages
- [ ] Mobile — hamburger menu collapses all nav links correctly

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete KeyRush landing page and UX redesign"
```

# KeyRush — Landing Page & UX Redesign Spec
**Date:** 2026-05-09
**Branch:** ui/updates

---

## Overview

Redesign the typing trainer app into a cohesive, premium product called **KeyRush**. The goal is a bold, energetic visual identity (inspired by Raycast/Clerk) targeting professionals who want to improve typing speed and productivity. The landing page is new; all existing inner pages get consistent design treatment.

**Tagline:** *Type faster. Think less. Win more.*

**Primary CTAs:** "Start Practicing" (solo) + "Compete Now" (competition) — two entry points, no forced choice.

---

## Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| Primary gradient | `violet-600` → `purple-500` | Hero text, CTAs, active nav, focus rings |
| Dark background | `zinc-950` | Hero, navbar, footer, dark cards |
| Dark card | `zinc-900` | Cards in dark mode |
| Dark border | `zinc-800` | Card borders in dark mode |
| Light background | `gray-50` | Features section, page backgrounds (light mode) |
| Light card | `white` | Cards in light mode |
| Light border | `gray-100` | Card borders in light mode |
| Body text (dark bg) | `white` | Primary text on dark |
| Secondary text | `gray-400` / `gray-500` | Subtitles, nav inactive, metadata |
| Success | `emerald-500` | Correct keystrokes, win states |
| Error | `red-500` | Wrong keystrokes, error feedback |
| Warning | `amber-500` | Caution states |

### Typography
| Role | Classes | Notes |
|---|---|---|
| Display (hero) | `text-6xl lg:text-7xl font-black tracking-tight` | Headline only |
| Page heading | `text-3xl font-bold tracking-tight` | Per-page title |
| Section heading | `text-2xl font-bold` | Feature cards, section labels |
| Body | `text-base font-medium` | General content |
| Small / meta | `text-sm text-gray-500` | Labels, timestamps |
| Monospace | `font-mono` | Active typing areas only |
| Section label | `text-xs font-semibold tracking-widest uppercase text-gray-500` | Above section headings |

### Spacing & Layout
- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card padding: `p-6` (standard), `p-8` (hero cards)
- Card border radius: `rounded-2xl` — used uniformly everywhere
- Card style: `bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800`

### Buttons
| Variant | Classes |
|---|---|
| Primary | `bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-3 transition-all hover:scale-[1.02]` |
| Secondary | `border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl px-6 py-3 transition-all` |
| Ghost | `text-gray-400 hover:text-white transition-colors` |

### No decorative effects
- No radial glows, gradients on backgrounds, or corner highlights
- No emojis anywhere in the UI
- Depth comes from border contrast and shadow, not decorative overlays

---

## Navbar (all pages)

Single shared navbar component replacing the existing one.

**Structure:**
- `bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50`
- Height: 56px
- Left: "KeyRush" wordmark — `text-white font-bold text-xl`
- Center (desktop): Nav links — Solo · Compete · Sessions · Tournament
  - Active: `text-white border-b-2 border-violet-500 pb-1`
  - Inactive: `text-gray-400 hover:text-white transition-colors`
- Right: theme toggle icon + settings gear icon — `text-gray-400 hover:text-white`
- Mobile: hamburger collapses center links into a drawer

---

## Landing Page (`/`)

The landing page replaces the current `SessionModeSelector`-only home. Deep-link query params (`?session=`, `?role=`) are preserved — if present, skip the landing and route directly.

### Section 1 — Hero
- Full viewport height, `bg-zinc-950`
- Navbar at top
- Vertically centered content:
  - Headline line 1: *"Type faster."* — `text-white font-black text-6xl lg:text-7xl`
  - Headline line 2: *"Win every room."* — violet gradient text, same size
  - Subtext: *"Real-time multiplayer typing competitions, solo practice, and tournament brackets — built for professionals who move fast."* — `text-gray-400 text-lg max-w-xl`
  - CTA row: **"Start Practicing"** (primary button → `/solo`) + **"Compete Now"** (secondary button → `/competition`)
  - Below CTAs: animated counter — WPM number animates 0 → 127 on mount using `motion` library, labeled `"avg WPM gained by users in 30 days"` in `text-gray-500 text-sm`

### Section 2 — Features Bento Grid
- `bg-gray-50 dark:bg-zinc-900` background
- Section label: "EVERYTHING YOU NEED TO TYPE FASTER"
- Section heading: "Four modes. One platform."
- Bento grid layout (CSS grid, 2 columns desktop, 1 column mobile):
  - **Solo Practice** — large card spanning full left column height. Title + description + "Try it →" link
  - **Live Competitions** — top-right card. Title + description
  - **Tournaments** — bottom-right card. Title + description
  - **Sessions** — full-width bottom card. Title + description + "Join a session →" link
- Each card: standard card style, title `text-xl font-bold`, description `text-gray-500`
- No icons, no emojis — typography and layout carry the visual weight

### Section 3 — Stats Bar
- `bg-zinc-950` dark strip
- Three stats centered, separated by dividers:
  - `10K+` matches played
  - `127 WPM` average improvement
  - `4` game modes
- Each stat: number in `text-4xl font-black text-white`, label in `text-gray-400 text-sm`

### Section 4 — Footer CTA
- `bg-zinc-950`
- Headline: *"Ready to get fast?"* — `text-4xl font-black text-white`
- Single CTA: **"Start for free →"** (primary button → `/solo`)
- Links row: Solo · Compete · Sessions · Tournament · Settings — `text-gray-500 hover:text-gray-300 text-sm`
- Bottom: `© 2026 KeyRush` — `text-gray-600 text-xs`

---

## Inner Page Consistency

All inner pages (Solo, Competition, Session, Tournament, Settings) get:

1. **Shared navbar** (described above)
2. **Page header block** at the top of content:
   - `pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800`
   - Title: `text-3xl font-bold text-gray-900 dark:text-white`
   - Optional subtitle: `text-gray-500 mt-1`
3. **Consistent card pattern** for all panels, stat boxes, and UI sections
4. **`bg-gray-50 dark:bg-zinc-950`** page background throughout

### Solo Page
- Two-column layout on desktop: typing area (left, wider) + stats sidebar (right)
- Stats panel as a card: WPM, accuracy, time — updated live
- Keyboard display in a collapsible card below the typing area
- Error feedback panel appears below typing area after completion

### Competition Page
- Waiting room: card layout with participant list grid, session code displayed prominently at top
- Active competition: typing area full-width top, live leaderboard as fixed right sidebar card
- Results: podium-style card at top, full results table below

### Session Page
- Session code shown in a prominent badge at the very top of the page
- Spectator count in the page header subtitle area
- Participant list as a card in the sidebar

### Tournament Pages
- Lobby: card with participant grid, host controls as a separate action card
- Bracket: full-width layout, each match as a styled card with participant names and result
- Results: winner card prominent at top, full standings table below

### Settings Page
- Sticky sidebar navigation on desktop (same visual as navbar active state)
- Each settings section is its own card with a section title
- Toggle/select controls use consistent styling from the existing component library

---

## File Changes

### New files
- `src/routes/index.tsx` — rewritten as full landing page (replaces SessionModeSelector)
- `src/components/landing/hero.tsx`
- `src/components/landing/features-grid.tsx`
- `src/components/landing/stats-bar.tsx`
- `src/components/landing/footer-cta.tsx`

### Modified files
- `src/components/common/navbar.tsx` — redesigned to match new system
- `src/routes/__root.tsx` — update page wrapper background tokens
- `src/styles.css` — add any new CSS variables needed
- `src/routes/solo.tsx` — apply page header + consistent card layout
- `src/routes/competition.tsx` — apply page header + consistent card layout
- `src/routes/session.tsx` — apply page header + consistent card layout
- `src/routes/settings.tsx` — sticky sidebar + card sections
- `src/components/common/navbar.tsx` — full redesign

### Unchanged
- All typing logic, hooks, PartyKit servers, tournament bracket logic
- Component APIs — only visual treatment changes, not behavior

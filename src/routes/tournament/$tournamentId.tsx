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
          <div className="flex items-center gap-4 flex-wrap">
            <h1
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tournament
            </h1>
            <span
              className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {tournamentId}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Bracket competition in progress.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

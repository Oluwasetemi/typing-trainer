import { createFileRoute, Outlet } from '@tanstack/react-router';

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
  return <Outlet />;
}

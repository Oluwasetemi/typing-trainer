import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { SessionManager } from '../components/session-manager';

type SearchParams = {
  session?: string;
  role?: 'typist' | 'spectator';
};

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      session: search.session as string | undefined,
      role: (search.role as 'typist' | 'spectator') || undefined,
    };
  },
  beforeLoad: ({ location }) => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session');
    const role = urlParams.get('role') as 'typist' | 'spectator';

    if (sessionId === 'solo') {
      throw redirect({ to: '/solo' });
    }

    if (sessionId && role === 'typist') {
      throw redirect({
        to: '/session',
        search: { sessionId },
      });
    }

    if (sessionId && role === 'spectator') {
      throw redirect({
        to: '/spectator',
        search: { sessionId },
      });
    }
  },
  component: App,
});

function App() {
  const navigate = useNavigate();

  const handleStartSession = (
    newSessionId: string,
    newRole: 'typist' | 'spectator',
  ) => {
    if (newSessionId === 'solo') {
      navigate({ to: '/solo' });
      return;
    }

    if (newRole === 'typist') {
      navigate({
        to: '/session',
        search: { sessionId: newSessionId },
      });
    }
    else {
      navigate({
        to: '/spectator',
        search: { sessionId: newSessionId },
      });
    }
  };

  return <SessionManager onStartSession={handleStartSession} />;
}

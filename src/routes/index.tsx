import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import SessionModeSelector from '../components/session-manager/session-mode-selector';

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

  // Handle session sharing URL
  useEffect(() => {
    if (session && role) {
      if (role === 'spectator') {
        navigate({
          to: '/spectator',
          search: { sessionId: session },
        });
      }
      else if (role === 'typist') {
        navigate({
          to: '/session',
          search: { sessionId: session },
        });
      }
    }
  }, [session, role, navigate]);

  const handleSelectMode = (mode: 'session' | 'solo' | 'competition') => {
    if (mode === 'solo') {
      navigate({ to: '/solo' });
    }
    else if (mode === 'competition') {
      navigate({ to: '/competition' });
    }
    else if (mode === 'session') {
      navigate({ to: '/session' });
    }
  };

  return <SessionModeSelector onSelectMode={handleSelectMode} />;
}

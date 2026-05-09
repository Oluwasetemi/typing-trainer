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

  // Preserve deep-link handling for shared session/spectator URLs
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

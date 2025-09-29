import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import RealtimeTypingTrainer from '../components/realtime-typing-trainer/realtime-typing-trainer';
import SessionManager from '../components/session-manager/session-manager';
import SpectatorView from '../components/spectator-view/spectator-view';
import TypingTrainer from '../components/typing-trainer';

export const Route = createFileRoute('/')({
  component: App,
});

type AppMode = 'session-manager' | 'typing' | 'spectator' | 'solo';

function App() {
  const [userId] = useState(
    () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  // a dummy state to force re-render
  const [, forceUpdate] = useState({});

  // Derive state from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  const role = (urlParams.get('role') as 'typist' | 'spectator') || 'spectator';
  const mode: AppMode = sessionId
    ? sessionId === 'solo'
      ? 'solo'
      : role === 'typist'
        ? 'typing'
        : 'spectator'
    : 'session-manager';

  const handleStartSession = (
    newSessionId: string,
    newRole: 'typist' | 'spectator',
  ) => {
    // Update URL and force re-render
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('session', newSessionId);
    newUrl.searchParams.set('role', newRole);
    window.history.pushState({}, '', newUrl.toString());

    // Force re-render to pick up new URL parameters
    forceUpdate({});
  };

  // const handleBackToSessions = () => {
  //   setMode('session-manager')
  //   setSessionId(null)

  //   // Clear URL parameters
  //   const newUrl = new URL(window.location.href)
  //   newUrl.search = ''
  //   window.history.pushState({}, '', newUrl.toString())
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {mode === 'session-manager' && (
        <SessionManager onStartSession={handleStartSession} />
      )}

      {mode === 'typing' && sessionId && (
        <RealtimeTypingTrainer sessionId={sessionId} userId={userId} />
      )}

      {mode === 'spectator' && sessionId && (
        <SpectatorView sessionId={sessionId} userId={userId} />
      )}

      {mode === 'solo' && (
        <TypingTrainer />
      )}
    </div>
  );
}

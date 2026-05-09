import { useCallback, useState } from 'react';

export type TypingSession = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
  spectatorCount: number;
};

export function useTypingSession() {
  const [currentSession, setCurrentSession] = useState<TypingSession | null>(
    null,
  );
  const [sessions, setSessions] = useState<TypingSession[]>([]);

  const createSession = useCallback((sessionName?: string) => {
    const sessionId = generateSessionId();
    const session: TypingSession = {
      id: sessionId,
      name: sessionName || `Typing Session ${sessionId.slice(-6)}`,
      isActive: false,
      createdAt: Date.now(),
      spectatorCount: 0,
    };

    setCurrentSession(session);
    setSessions(prev => [...prev, session]);

    return session;
  }, []);

  const joinSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        return session;
      }

      // If session doesn't exist locally, create a placeholder
      const newSession: TypingSession = {
        id: sessionId,
        name: `Session ${sessionId.slice(-6)}`,
        isActive: false,
        createdAt: Date.now(),
        spectatorCount: 0,
      };

      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    },
    [sessions],
  );

  const leaveSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const updateSession = useCallback(
    (updates: Partial<TypingSession>) => {
      if (!currentSession)
        return;

      const updatedSession = { ...currentSession, ...updates };
      setCurrentSession(updatedSession);

      setSessions(prev =>
        prev.map(session =>
          session.id === currentSession.id ? updatedSession : session,
        ),
      );
    },
    [currentSession],
  );

  const getSessionUrl = useCallback(
    (sessionId: string, role: 'typist' | 'spectator' = 'spectator') => {
      const baseUrl = window.location.origin;
      if (role === 'spectator') {
        return `${baseUrl}/spectator?sessionId=${sessionId}`;
      }
      else {
        return `${baseUrl}/session?sessionId=${sessionId}`;
      }
    },
    [],
  );

  return {
    currentSession,
    sessions,
    createSession,
    joinSession,
    leaveSession,
    updateSession,
    getSessionUrl,
  };
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

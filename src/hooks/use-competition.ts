import PartySocket from 'partysocket';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  CompetitionClientMessage,
  CompetitionServerMessage,
  CompetitionSession,
  LeaderboardEntry,
} from '@/types/competition.types';

export type CompetitionState = {
  session: CompetitionSession | null;
  leaderboard: LeaderboardEntry[];
  isConnected: boolean;
  connectionError: string | null;
  currentUserId: string | null;
};

// TODO: Use usePartySocket instead of PartySocket
export function useCompetition(competitionId: string, userId: string) {
  const [competitionState, setCompetitionState] = useState<CompetitionState>({
    session: null,
    leaderboard: [],
    isConnected: false,
    connectionError: null,
    currentUserId: userId,
  });

  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!competitionId)
      return;

    const protocol = import.meta.env.DEV ? 'ws' : 'wss';
    const host = import.meta.env.DEV ? 'localhost:1999' : 'typing-trainer.oluwasetemi.partykit.dev';

    const socket = new PartySocket({
      host,
      room: competitionId,
      party: 'competition',
      protocol,
    });

    socketRef.current = socket;

    const handleServerOpening = () => {
      setCompetitionState(prev => ({
        ...prev,
        isConnected: true,
        connectionError: null,
      }));
    };

    const handleServerMessage = (message: CompetitionServerMessage) => {
      switch (message.type) {
        case 'COMPETITION_STATE':
          setCompetitionState(prev => ({
            ...prev,
            session: message.session,
            leaderboard: calculateLeaderboard(message.session, competitionState.currentUserId),
          }));
          break;
        case 'PARTICIPANT_JOINED':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;

            const updatedParticipants = {
              ...prev.session.participants,
              [message.participant.userId]: message.participant,
            };

            return {
              ...prev,
              session: {
                ...prev.session,
                participants: updatedParticipants,
              },
              leaderboard: calculateLeaderboard(
                { ...prev.session, participants: updatedParticipants },
                prev.currentUserId,
              ),
            };
          });
          break;

        case 'PARTICIPANT_LEFT':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;

            const participant = prev.session.participants[message.userId];
            if (!participant)
              return prev;

            // Mark participant as disconnected instead of removing them
            // This allows them to reconnect and maintain their state
            return {
              ...prev,
              session: {
                ...prev.session,
                participants: {
                  ...prev.session.participants,
                  [message.userId]: {
                    ...participant,
                    isConnected: false,
                  },
                },
              },
              leaderboard: calculateLeaderboard(
                {
                  ...prev.session,
                  participants: {
                    ...prev.session.participants,
                    [message.userId]: {
                      ...participant,
                      isConnected: false,
                    },
                  },
                },
                prev.currentUserId,
              ),
            };
          });
          break;

        case 'PARTICIPANT_READY':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;
            const participant = prev.session.participants[message.userId];
            if (!participant)
              return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                participants: {
                  ...prev.session.participants,
                  [message.userId]: {
                    ...participant,
                    isReady: message.isReady,
                  },
                },
              },
            };
          });
          break;

        case 'COUNTDOWN_START':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                state: 'countdown',
                countdownStartTime: message.countdownStartTime,
              },
            };
          });
          break;

        case 'COMPETITION_START':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                state: 'active',
                startTime: message.startTime,
              },
            };
          });
          break;

        case 'LEADERBOARD_UPDATE':
          setCompetitionState(prev => ({
            ...prev,
            leaderboard: message.leaderboard.map(entry => ({
              ...entry,
              isYou: entry.userId === prev.currentUserId,
            })),
          }));
          break;

        case 'COMPETITION_END':
          setCompetitionState((prev) => {
            if (!prev.session)
              return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                state: 'finished',
              },
              leaderboard: message.finalLeaderboard.map(entry => ({
                ...entry,
                isYou: entry.userId === prev.currentUserId,
              })),
            };
          });
          break;

        case 'ERROR':
          setCompetitionState(prev => ({
            ...prev,
            connectionError: message.message,
          }));
          break;
      }
    };

    const handleServerMessaging = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as CompetitionServerMessage;
        handleServerMessage(message);
      }
      catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    const handleServerError = () => {
      setCompetitionState(prev => ({
        ...prev,
        connectionError: 'Connection error',
        isConnected: false,
      }));
    };

    const handleServerClosing = () => {
      setCompetitionState(prev => ({ ...prev, isConnected: false }));
    };

    socket.addEventListener('open', handleServerOpening);
    socket.addEventListener('message', handleServerMessaging);
    socket.addEventListener('error', handleServerError);
    socket.addEventListener('close', handleServerClosing);

    return () => {
      socket.removeEventListener('open', handleServerOpening);
      socket.removeEventListener('message', handleServerMessaging);
      socket.removeEventListener('error', handleServerError);
      socket.removeEventListener('close', handleServerClosing);

      socketRef.current = null;
      socket.close();
    };
  }, [competitionId, competitionState.currentUserId]);

  const sendMessage = useCallback((message: CompetitionClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinCompetition = useCallback(
    (username: string) => {
      sendMessage({
        type: 'JOIN_COMPETITION',
        username,
        userId,
      });
    },
    [sendMessage, userId],
  );

  const setReady = useCallback(
    (isReady: boolean) => {
      sendMessage({
        type: 'READY_UP',
        isReady,
      });
    },
    [sendMessage],
  );

  const startCompetition = useCallback(() => {
    sendMessage({
      type: 'START_COMPETITION',
    });
  }, [sendMessage]);

  const sendTypingUpdate = useCallback(
    (stats: {
      currentIndex: number;
      errors: number;
      wpm: number;
      accuracy: number;
      progress: number;
    }) => {
      sendMessage({
        type: 'TYPING_UPDATE',
        ...stats,
      });
    },
    [sendMessage],
  );

  const finishTyping = useCallback(
    (finalStats: any) => {
      sendMessage({
        type: 'FINISH_TYPING',
        finalStats,
      });
    },
    [sendMessage],
  );

  const leaveCompetition = useCallback(() => {
    sendMessage({
      type: 'LEAVE_COMPETITION',
    });
  }, [sendMessage]);

  return {
    ...competitionState,
    joinCompetition,
    setReady,
    startCompetition,
    sendTypingUpdate,
    finishTyping,
    leaveCompetition,
  };
}

function calculateLeaderboard(
  session: CompetitionSession,
  currentUserId: string | null,
): LeaderboardEntry[] {
  return Object.values(session.participants)
    .filter(p => p.isConnected)
    .map(p => ({
      rank: 0, // Will be set after sorting
      userId: p.userId,
      username: p.username,
      wpm: p.stats.wpm,
      accuracy: p.stats.accuracy,
      progress: p.stats.progress,
      finished: p.stats.finished,
      finishTime: p.stats.finishTime,
      isYou: p.userId === currentUserId,
    }))
    .sort((a, b) => {
      // Sort by: finished first, then by WPM, then by accuracy
      if (a.finished && !b.finished)
        return -1;
      if (!a.finished && b.finished)
        return 1;
      if (a.finished && b.finished) {
        // Both finished, sort by finish time
        return (a.finishTime || 0) - (b.finishTime || 0);
      }
      // Both not finished, sort by progress then WPM
      if (a.progress !== b.progress)
        return b.progress - a.progress;
      return b.wpm - a.wpm;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

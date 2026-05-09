import usePartySocket from 'partysocket/react';
import { useCallback, useState } from 'react';

import type {
  MatchResult,
  Tournament,
  TournamentClientMessage,
  TournamentServerMessage,
  TournamentSettings,
} from '@/types/tournament.types';

export type TournamentState = {
  tournament: Tournament | null;
  error: string | null;
};

export function useTournament(tournamentId: string, userId: string) {
  const [state, setState] = useState<TournamentState>({
    tournament: null,
    error: null,
  });
  const [isConnected, setIsConnected] = useState(false);

  const socket = usePartySocket({
    host: import.meta.env.DEV ? 'localhost:1999' : 'typing-trainer.oluwasetemi.partykit.dev',
    room: tournamentId,
    party: 'tournament',
    onOpen(event) {
      console.warn('[useTournament] WebSocket connected');
      setIsConnected(true);

      // Update connection ID on server
      console.warn('[useTournament] Sending UPDATE_CONNECTION for userId:', userId);
      // @ts-expect-error - socket is the websocket instance
      event.target.send(JSON.stringify({
        type: 'UPDATE_CONNECTION',
        userId,
      }));
    },
    onClose() {
      console.warn('[useTournament] WebSocket disconnected');
      setIsConnected(false);
    },
    onMessage(event: MessageEvent) {
      try {
        const message = JSON.parse(event.data) as TournamentServerMessage;
        // eslint-disable-next-line ts/no-use-before-define
        handleServerMessage(message);
      }
      catch (error) {
        console.error('[useTournament] Error parsing message:', error);
      }
    },
    onError() {
      console.warn('[useTournament] WebSocket error');
      setIsConnected(false);
      setState(prev => ({
        ...prev,
        error: 'Connection error',
      }));
    },
  });

  const handleServerMessage = useCallback((message: TournamentServerMessage) => {
    console.warn('[useTournament] Received:', message.type);
    switch (message.type) {
      case 'TOURNAMENT_STATE':
      case 'TOURNAMENT_STARTED':
      case 'TOURNAMENT_COMPLETED':
        setState(prev => ({
          ...prev,
          tournament: message.tournament,
          error: null,
        }));
        break;

      case 'PARTICIPANT_JOINED':
        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              participants: {
                ...prev.tournament.participants,
                [message.participant.userId]: message.participant,
              },
            },
          };
        });
        break;

      case 'PARTICIPANT_LEFT':
        setState((prev) => {
          if (!prev.tournament)
            return prev;

          const participant = prev.tournament.participants[message.userId];
          if (!participant)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              participants: {
                ...prev.tournament.participants,
                [message.userId]: {
                  ...participant,
                  isConnected: false,
                },
              },
            },
          };
        });
        break;

      case 'ROUND_STARTED':
        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              currentRound: message.round.number,
              rounds: prev.tournament.rounds.map(r =>
                r.number === message.round.number ? message.round : r,
              ),
            },
          };
        });
        break;

      case 'MATCH_READY':
        console.warn('[useTournament] MATCH_READY received:', {
          matchId: message.match.id,
          readyParticipants: message.match.readyParticipants,
          participants: message.match.participants,
        });

        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              rounds: prev.tournament.rounds.map(round => ({
                ...round,
                matches: round.matches.map(match =>
                  match.id === message.match.id ? message.match : match,
                ),
              })),
            },
          };
        });
        break;

      case 'MATCH_STARTED':
        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              rounds: prev.tournament.rounds.map(round => ({
                ...round,
                matches: round.matches.map(match =>
                  match.id === message.matchId
                    ? { ...match, state: 'active', competitionId: message.competitionId }
                    : match,
                ),
              })),
            },
          };
        });
        break;

      case 'MATCH_COMPLETED':
        console.warn('[useTournament] MATCH_COMPLETED received:', {
          matchId: message.matchId,
          winnerId: message.winnerId,
          resultsCount: message.results.length,
        });

        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              rounds: prev.tournament.rounds.map(round => ({
                ...round,
                matches: round.matches.map((match) => {
                  if (match.id === message.matchId) {
                    const results: Record<string, MatchResult> = {};
                    message.results.forEach((r) => {
                      results[r.userId] = r;
                    });

                    console.warn('[useTournament] Updating match:', match.id, 'to completed');

                    return {
                      ...match,
                      state: 'completed',
                      results,
                      winnerId: message.winnerId,
                    };
                  }
                  return match;
                }),
              })),
            },
          };
        });
        break;

      case 'ROUND_COMPLETED':
        setState((prev) => {
          if (!prev.tournament)
            return prev;

          return {
            ...prev,
            tournament: {
              ...prev.tournament,
              rounds: prev.tournament.rounds.map(round =>
                round.number === message.roundNumber
                  ? { ...round, state: 'completed' }
                  : round,
              ),
            },
          };
        });
        break;

      case 'ERROR':
        console.error('[useTournament] Server error:', message.message);
        setState(prev => ({
          ...prev,
          error: message.message,
        }));
        break;
    }
  }, []);

  const sendMessage = useCallback((message: TournamentClientMessage) => {
    console.warn('[useTournament] sendMessage called:', {
      type: message.type,
      isConnected,
      socketReadyState: socket?.readyState,
    });

    if (isConnected) {
      console.warn('[useTournament] Sending message:', message.type, message);
      socket.send(JSON.stringify(message));
    }
    else {
      console.error('[useTournament] Cannot send message, not connected. IsConnected:', isConnected);
    }
  }, [socket, isConnected]);

  const createTournament = useCallback(
    (settings: TournamentSettings, name: string, username: string) => {
      sendMessage({
        type: 'CREATE_TOURNAMENT',
        settings,
        name,
        hostUsername: username,
        hostUserId: userId,
      });
    },
    [sendMessage, userId],
  );

  const joinTournament = useCallback(
    (username: string) => {
      sendMessage({
        type: 'JOIN_TOURNAMENT',
        username,
        userId,
      });
    },
    [sendMessage, userId],
  );

  const startTournament = useCallback(() => {
    sendMessage({
      type: 'START_TOURNAMENT',
    });
  }, [sendMessage]);

  const readyForMatch = useCallback(
    (matchId: string) => {
      sendMessage({
        type: 'READY_FOR_MATCH',
        matchId,
      });
    },
    [sendMessage],
  );

  const matchComplete = useCallback(
    (matchId: string, results: MatchResult[]) => {
      sendMessage({
        type: 'MATCH_COMPLETE',
        matchId,
        results,
      });
    },
    [sendMessage],
  );

  const leaveTournament = useCallback(() => {
    sendMessage({
      type: 'LEAVE_TOURNAMENT',
    });
  }, [sendMessage]);

  return {
    ...state,
    isConnected,
    createTournament,
    joinTournament,
    startTournament,
    readyForMatch,
    matchComplete,
    leaveTournament,
  };
}

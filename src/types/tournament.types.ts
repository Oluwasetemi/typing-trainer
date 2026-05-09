export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss-system';

export type WinCondition = 'fastest-completion' | 'highest-wpm' | 'best-score' | 'race-to-target';

export type TournamentState = 'registration' | 'ready' | 'in-progress' | 'completed' | 'cancelled';

export type MatchState = 'pending' | 'ready' | 'countdown' | 'active' | 'completed';

export type BracketType = 'winners' | 'losers'; // For double elimination

export type TournamentSettings = {
  format: TournamentFormat;
  winCondition: WinCondition;
  size: number; // 4, 8, 16, 32, 64
  minAccuracy?: number; // For highest-wpm condition (default 95%)
  targetWpm?: number; // For race-to-target
  targetProgress?: number; // For race-to-target (percentage)
  advanceDelay: number; // Delay between rounds in ms (default 10000)
};

export type TournamentParticipant = {
  userId: string;
  username: string;
  seed: number; // Seeding position (1 = highest seed)
  isEliminated: boolean;
  currentBracket?: BracketType; // For double elimination
  wins: number;
  losses: number;
  matchesPlayed: number;
  connectionId: string;
  isConnected: boolean;
};

export type MatchResult = {
  userId: string;
  wpm: number;
  accuracy: number;
  finishTime?: number; // Duration in ms
  score: number; // Calculated based on win condition
  placement: number; // 1st, 2nd, etc.
};

export type Match = {
  id: string;
  roundNumber: number;
  matchNumber: number; // Position in round (1, 2, 3...)
  bracket: BracketType;
  state: MatchState;
  participants: string[]; // User IDs (2 for 1v1, more for group)
  readyParticipants?: string[]; // User IDs of participants who clicked "I'm Ready"
  winnerId?: string;
  loserId?: string;
  competitionId?: string; // Links to actual competition session
  startTime?: number;
  endTime?: number;
  results?: Record<string, MatchResult>;
};

export type Round = {
  number: number;
  bracket: BracketType;
  matches: Match[];
  state: 'pending' | 'in-progress' | 'completed';
  startTime?: number;
  endTime?: number;
};

export type Tournament = {
  id: string;
  name: string;
  code: string; // Join code like "TOUR-AB12"
  state: TournamentState;
  settings: TournamentSettings;
  participants: Record<string, TournamentParticipant>;
  rounds: Round[];
  currentRound: number;
  hostUserId: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  winnerId?: string;
  runnerUpId?: string;
  thirdPlaceId?: string;
};

// Client → Server tournament messages
export type TournamentClientMessage
  = | { type: 'CREATE_TOURNAMENT'; settings: TournamentSettings; name: string; hostUsername: string; hostUserId: string }
    | { type: 'JOIN_TOURNAMENT'; username: string; userId: string }
    | { type: 'LEAVE_TOURNAMENT' }
    | { type: 'START_TOURNAMENT' }
    | { type: 'UPDATE_CONNECTION'; userId: string }
    | { type: 'READY_FOR_MATCH'; matchId: string }
    | { type: 'MATCH_COMPLETE'; matchId: string; results: MatchResult[] };

// Server → Client tournament messages
export type TournamentServerMessage
  = | { type: 'TOURNAMENT_STATE'; tournament: Tournament }
    | { type: 'PARTICIPANT_JOINED'; participant: TournamentParticipant }
    | { type: 'PARTICIPANT_LEFT'; userId: string }
    | { type: 'TOURNAMENT_STARTED'; tournament: Tournament }
    | { type: 'ROUND_STARTED'; round: Round }
    | { type: 'MATCH_READY'; match: Match }
    | { type: 'MATCH_STARTED'; matchId: string; competitionId: string }
    | { type: 'MATCH_COMPLETED'; matchId: string; results: MatchResult[]; winnerId: string }
    | { type: 'ROUND_COMPLETED'; roundNumber: number }
    | { type: 'TOURNAMENT_COMPLETED'; tournament: Tournament }
    | { type: 'ERROR'; message: string };

export type TournamentMessage
  = | TournamentClientMessage
    | TournamentServerMessage;

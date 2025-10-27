export type CompetitionState = 'waiting' | 'countdown' | 'active' | 'finished';

export type ParticipantStats = {
  wpm: number;
  accuracy: number;
  progress: number; // percentage 0-100
  currentIndex: number;
  errors: number;
  finished: boolean;
  finishTime?: number; // timestamp when finished
};

export type Participant = {
  userId: string;
  username: string;
  connectionId: string;
  isReady: boolean;
  isHost: boolean;
  joinedAt: number;
  stats: ParticipantStats;
  isConnected: boolean;
};

export type CompetitionSettings = {
  maxParticipants: number;
  timeLimit?: number; // optional time limit in ms
  minParticipants: number;
};

export type CompetitionSession = {
  id: string;
  name: string;
  code: string; // e.g., "RACE-1234"
  state: CompetitionState;
  sourceText: string;
  participants: Record<string, Participant>;
  startTime?: number;
  endTime?: number;
  countdownStartTime?: number;
  settings: CompetitionSettings;
  createdAt: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
  finishTime?: number;
  isYou: boolean;
};

// Client → Server messages
export type CompetitionClientMessage =
  | { type: 'JOIN_COMPETITION'; username: string; userId: string }
  | { type: 'READY_UP'; isReady: boolean }
  | { type: 'START_COMPETITION' }
  | {
      type: 'TYPING_UPDATE';
      currentIndex: number;
      errors: number;
      wpm: number;
      accuracy: number;
      progress: number;
    }
  | { type: 'FINISH_TYPING'; finalStats: ParticipantStats }
  | { type: 'LEAVE_COMPETITION' };

// Server → Client messages
export type CompetitionServerMessage =
  | { type: 'COMPETITION_STATE'; session: CompetitionSession }
  | { type: 'PARTICIPANT_JOINED'; participant: Participant }
  | { type: 'PARTICIPANT_LEFT'; userId: string }
  | { type: 'PARTICIPANT_READY'; userId: string; isReady: boolean }
  | { type: 'COUNTDOWN_START'; countdownStartTime: number }
  | { type: 'COMPETITION_START'; startTime: number }
  | { type: 'LEADERBOARD_UPDATE'; leaderboard: LeaderboardEntry[] }
  | { type: 'PARTICIPANT_UPDATE'; userId: string; stats: ParticipantStats }
  | { type: 'COMPETITION_END'; finalLeaderboard: LeaderboardEntry[] }
  | { type: 'ERROR'; message: string };

export type CompetitionMessage =
  | CompetitionClientMessage
  | CompetitionServerMessage;

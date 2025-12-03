# Tournament Mode Implementation Plan

## Overview

Add a tournament-style competition mode to the typing application, allowing users to create and participate in structured multi-round competitions with bracket progression.

## User Requirements

- **Tournament Formats**: Single Elimination, Double Elimination, Round Robin, Swiss System (user selectable)
- **Win Conditions**: Multiple options (Fastest Completion, Highest WPM, Best Score, Race to Target) - user selectable
- **Progression**: Automatic advancement with winners moving to next round
- **Tournament Size**: User-configurable (4, 8, 16, 32, 64 players)

## Current Architecture Analysis

### Existing Competition System

- **Structure**: WebSocket-based real-time competition using PartyKit
- **Flow**: Create → Join → Waiting Room → Countdown → Active → Results
- **Server**: `party/competition-server.ts` - handles participant management, state, leaderboard
- **Client Hook**: `use-competition.ts` - WebSocket connection, state management
- **Components**:
  - `competition-session-manager.tsx` - Create/join UI
  - `competition-waiting-room.tsx` - Pre-match lobby
  - `competition-typing-view.tsx` - Active competition
  - `competition-results.tsx` - Final results
  - `live-leaderboard.tsx` - Real-time standings

### Current Limitations for Tournaments

- Single-round only (no bracket progression)
- No match/round structure
- No tournament-level state management
- No bracket visualization
- No seeding or pairing logic

---

## Tournament Architecture Design

### 1. Data Structure

#### Tournament Types (`src/types/tournament.types.ts`)

```typescript
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
};

export type Match = {
  id: string;
  roundNumber: number;
  matchNumber: number; // Position in round (1, 2, 3...)
  bracket: BracketType;
  state: MatchState;
  participants: string[]; // User IDs (2 for 1v1, more for group)
  winnerId?: string;
  competitionId?: string; // Links to actual competition session
  startTime?: number;
  endTime?: number;
  results?: Record<string, MatchResult>;
};

export type MatchResult = {
  userId: string;
  wpm: number;
  accuracy: number;
  finishTime?: number; // Duration in ms
  score: number; // Calculated based on win condition
  placement: number; // 1st, 2nd, etc.
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
```

#### Message Types (extend `competition.types.ts`)

```typescript
// Client → Server tournament messages
export type TournamentClientMessage
  = | { type: 'CREATE_TOURNAMENT'; settings: TournamentSettings; name: string; hostUsername: string }
    | { type: 'JOIN_TOURNAMENT'; username: string; userId: string }
    | { type: 'LEAVE_TOURNAMENT' }
    | { type: 'START_TOURNAMENT' } // Host only
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
    | { type: 'MATCH_STARTED'; matchId: string }
    | { type: 'MATCH_COMPLETED'; matchId: string; results: MatchResult[] }
    | { type: 'ROUND_COMPLETED'; roundNumber: number }
    | { type: 'TOURNAMENT_COMPLETED'; tournament: Tournament }
    | { type: 'ERROR'; message: string };
```

### 2. Bracket Generation Logic (`src/utils/tournament-brackets.ts`)

```typescript
// Core bracket generation functions

export function generateSingleEliminationBracket(
  participants: TournamentParticipant[],
  tournamentId: string
): Round[] {
  const rounds: Round[] = [];
  const totalRounds = Math.log2(participants.length);

  // Round 1: Pair participants by seed
  const round1Matches = pairParticipantsBySeeding(participants, 1);
  rounds.push({
    number: 1,
    bracket: 'winners',
    matches: round1Matches,
    state: 'pending',
  });

  // Subsequent rounds: Create placeholder matches
  for (let i = 2; i <= totalRounds; i++) {
    const matchCount = 2 ** (totalRounds - i);
    const roundMatches: Match[] = [];

    for (let j = 0; j < matchCount; j++) {
      roundMatches.push({
        id: `${tournamentId}-r${i}-m${j + 1}`,
        roundNumber: i,
        matchNumber: j + 1,
        bracket: 'winners',
        state: 'pending',
        participants: [], // Will be filled by winners
      });
    }

    rounds.push({
      number: i,
      bracket: 'winners',
      matches: roundMatches,
      state: 'pending',
    });
  }

  return rounds;
}

export function generateDoubleEliminationBracket(
  participants: TournamentParticipant[],
  tournamentId: string
): Round[] {
  // Winners bracket
  const winnersBracket = generateSingleEliminationBracket(participants, tournamentId);

  // Losers bracket (more complex - feeds from winners bracket)
  const losersBracket = generateLosersBracket(participants.length, tournamentId);

  // Grand finals
  const grandFinals = createGrandFinalsMatch(tournamentId);

  return [...winnersBracket, ...losersBracket, grandFinals];
}

export function generateRoundRobinGroups(
  participants: TournamentParticipant[],
  tournamentId: string
): Round[] {
  // All participants play each other once
  const rounds: Round[] = [];
  const matchups = generateRoundRobinMatchups(participants);

  matchups.forEach((roundMatchups, index) => {
    rounds.push({
      number: index + 1,
      bracket: 'winners',
      matches: roundMatchups.map((pair, matchIndex) => ({
        id: `${tournamentId}-rr${index + 1}-m${matchIndex + 1}`,
        roundNumber: index + 1,
        matchNumber: matchIndex + 1,
        bracket: 'winners',
        state: 'pending',
        participants: pair,
      })),
      state: 'pending',
    });
  });

  return rounds;
}

export function generateSwissSystemPairings(
  participants: TournamentParticipant[],
  currentRound: number,
  tournamentId: string
): Match[] {
  // Pair participants with similar W-L records
  const sorted = [...participants].sort((a, b) => {
    if (b.wins !== a.wins)
      return b.wins - a.wins;
    return a.losses - b.losses;
  });

  const matches: Match[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    if (sorted[i + 1]) {
      matches.push({
        id: `${tournamentId}-swiss${currentRound}-m${(i / 2) + 1}`,
        roundNumber: currentRound,
        matchNumber: (i / 2) + 1,
        bracket: 'winners',
        state: 'pending',
        participants: [sorted[i].userId, sorted[i + 1].userId],
      });
    }
  }

  return matches;
}

// Helper: Standard tournament seeding
function pairParticipantsBySeeding(
  participants: TournamentParticipant[],
  roundNumber: number
): Match[] {
  const n = participants.length;
  const matches: Match[] = [];

  // Standard seeding: 1 vs n, 2 vs n-1, etc.
  for (let i = 0; i < n / 2; i++) {
    matches.push({
      id: `match-r${roundNumber}-${i + 1}`,
      roundNumber,
      matchNumber: i + 1,
      bracket: 'winners',
      state: 'pending',
      participants: [participants[i].userId, participants[n - 1 - i].userId],
    });
  }

  return matches;
}

// Win condition evaluation
export function determineMatchWinner(
  results: MatchResult[],
  winCondition: WinCondition
): string {
  const scored = results.map(result => ({
    ...result,
    calculatedScore: calculateScore(result, winCondition),
  }));

  scored.sort((a, b) => b.calculatedScore - a.calculatedScore);
  return scored[0].userId;
}

function calculateScore(result: MatchResult, condition: WinCondition): number {
  switch (condition) {
    case 'fastest-completion':
      return result.finishTime ? 1000000 - result.finishTime : 0;
    case 'highest-wpm':
      return result.accuracy >= 95 ? result.wpm : 0;
    case 'best-score':
      return result.wpm * (result.accuracy / 100);
    case 'race-to-target':
      // Assumes target already met, score by time
      return result.finishTime ? 1000000 - result.finishTime : 0;
    default:
      return result.wpm;
  }
}
```

### 3. PartyKit Tournament Server (`party/tournament-server.ts`)

```typescript
import type * as Party from 'partykit/server';

import type {
  Match,
  MatchResult,
  Round,
  Tournament,
  TournamentClientMessage,
  TournamentServerMessage,
} from '@/types/tournament.types';

import {
  determineMatchWinner,
  generateDoubleEliminationBracket,
  generateRoundRobinGroups,
  generateSingleEliminationBracket,
  generateSwissSystemPairings,
} from '@/utils/tournament-brackets';

export default class TournamentServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private tournament: Tournament | null = null;
  private activeMatches = new Map<string, string>(); // matchId → competitionRoomId

  async onStart() {
    const stored = await this.room.storage.get<Tournament>('tournament');
    if (stored) {
      this.tournament = stored;
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as TournamentClientMessage;

    switch (msg.type) {
      case 'CREATE_TOURNAMENT':
        await this.handleCreateTournament(msg, sender);
        break;
      case 'JOIN_TOURNAMENT':
        await this.handleJoinTournament(msg, sender);
        break;
      case 'START_TOURNAMENT':
        await this.handleStartTournament(sender);
        break;
      case 'READY_FOR_MATCH':
        await this.handleReadyForMatch(msg, sender);
        break;
      case 'MATCH_COMPLETE':
        await this.handleMatchComplete(msg, sender);
        break;
      case 'LEAVE_TOURNAMENT':
        await this.handleLeaveTournament(sender);
        break;
    }
  }

  private async handleCreateTournament(
    msg: { settings: TournamentSettings; name: string; hostUsername: string },
    sender: Party.Connection
  ) {
    const hostUserId = sender.id;

    this.tournament = {
      id: this.room.id,
      name: msg.name,
      code: generateTournamentCode(),
      state: 'registration',
      settings: msg.settings,
      participants: {
        [hostUserId]: {
          userId: hostUserId,
          username: msg.hostUsername,
          seed: 1,
          isEliminated: false,
          wins: 0,
          losses: 0,
          matchesPlayed: 0,
        },
      },
      rounds: [],
      currentRound: 0,
      hostUserId,
      createdAt: Date.now(),
    };

    await this.persistTournament();
    this.broadcastTournamentState();
  }

  private async handleJoinTournament(
    msg: { username: string; userId: string },
    sender: Party.Connection
  ) {
    if (!this.tournament)
      return;

    if (this.tournament.state !== 'registration') {
      this.sendError(sender, 'Tournament has already started');
      return;
    }

    const participantCount = Object.keys(this.tournament.participants).length;
    if (participantCount >= this.tournament.settings.size) {
      this.sendError(sender, 'Tournament is full');
      return;
    }

    this.tournament.participants[msg.userId] = {
      userId: msg.userId,
      username: msg.username,
      seed: participantCount + 1,
      isEliminated: false,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
    };

    await this.persistTournament();
    this.broadcastTournamentState();
  }

  private async handleStartTournament(sender: Party.Connection) {
    if (!this.tournament)
      return;

    if (sender.id !== this.tournament.hostUserId) {
      this.sendError(sender, 'Only the host can start the tournament');
      return;
    }

    const participantCount = Object.keys(this.tournament.participants).length;
    if (participantCount < 2) {
      this.sendError(sender, 'Need at least 2 participants');
      return;
    }

    // Generate bracket based on format
    const participants = Object.values(this.tournament.participants);

    switch (this.tournament.settings.format) {
      case 'single-elimination':
        this.tournament.rounds = generateSingleEliminationBracket(participants, this.tournament.id);
        break;
      case 'double-elimination':
        this.tournament.rounds = generateDoubleEliminationBracket(participants, this.tournament.id);
        break;
      case 'round-robin':
        this.tournament.rounds = generateRoundRobinGroups(participants, this.tournament.id);
        break;
      case 'swiss-system':
        // Swiss generates rounds dynamically
        const rounds = Math.ceil(Math.log2(participantCount));
        this.tournament.rounds = [];
        for (let i = 1; i <= rounds; i++) {
          this.tournament.rounds.push({
            number: i,
            bracket: 'winners',
            matches: [],
            state: 'pending',
          });
        }
        break;
    }

    this.tournament.state = 'in-progress';
    this.tournament.startedAt = Date.now();
    this.tournament.currentRound = 1;

    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'TOURNAMENT_STARTED',
      tournament: this.tournament,
    }));

    // Start first round
    await this.startRound(1);
  }

  private async startRound(roundNumber: number) {
    if (!this.tournament)
      return;

    const round = this.tournament.rounds[roundNumber - 1];
    if (!round)
      return;

    // For Swiss, generate pairings dynamically
    if (this.tournament.settings.format === 'swiss-system' && round.matches.length === 0) {
      const participants = Object.values(this.tournament.participants).filter(p => !p.isEliminated);
      round.matches = generateSwissSystemPairings(participants, roundNumber, this.tournament.id);
    }

    round.state = 'in-progress';
    round.startTime = Date.now();

    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'ROUND_STARTED',
      round,
    }));

    // Start all matches in the round
    for (const match of round.matches) {
      if (match.participants.length >= 2) {
        await this.startMatch(match);
      }
    }
  }

  private async startMatch(match: Match) {
    // Create a competition session for this match
    const competitionId = `${this.tournament!.id}-${match.id}`;
    this.activeMatches.set(match.id, competitionId);

    match.state = 'ready';
    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'MATCH_READY',
      match,
    }));

    // Participants will join the competition room
    // Competition will start when both are ready
  }

  private async handleMatchComplete(
    msg: { matchId: string; results: MatchResult[] },
    sender: Party.Connection
  ) {
    if (!this.tournament)
      return;

    const match = this.findMatch(msg.matchId);
    if (!match)
      return;

    match.state = 'completed';
    match.endTime = Date.now();
    match.results = {};
    msg.results.forEach((r) => {
      match.results![r.userId] = r;
    });

    // Determine winner
    const winnerId = determineMatchWinner(msg.results, this.tournament.settings.winCondition);
    match.winnerId = winnerId;

    // Update participant records
    msg.results.forEach((result) => {
      const participant = this.tournament!.participants[result.userId];
      if (participant) {
        participant.matchesPlayed++;
        if (result.userId === winnerId) {
          participant.wins++;
        }
        else {
          participant.losses++;
          if (this.tournament!.settings.format === 'single-elimination') {
            participant.isEliminated = true;
          }
        }
      }
    });

    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'MATCH_COMPLETED',
      matchId: msg.matchId,
      results: msg.results,
    }));

    // Check if round is complete
    await this.checkRoundCompletion(match.roundNumber);
  }

  private async checkRoundCompletion(roundNumber: number) {
    if (!this.tournament)
      return;

    const round = this.tournament.rounds[roundNumber - 1];
    if (!round)
      return;

    const allMatchesComplete = round.matches.every(m => m.state === 'completed');

    if (allMatchesComplete) {
      round.state = 'completed';
      round.endTime = Date.now();

      this.room.broadcast(JSON.stringify({
        type: 'ROUND_COMPLETED',
        roundNumber,
      }));

      // Advance winners to next round (for elimination formats)
      if (this.tournament.settings.format.includes('elimination')) {
        await this.advanceWinners(roundNumber);
      }

      // Check if tournament is complete
      if (this.isTournamentComplete()) {
        await this.completeTournament();
      }
      else {
        // Start next round after delay
        setTimeout(() => {
          this.startRound(roundNumber + 1);
        }, this.tournament!.settings.advanceDelay);
      }

      await this.persistTournament();
    }
  }

  private async advanceWinners(roundNumber: number) {
    if (!this.tournament)
      return;

    const currentRound = this.tournament.rounds[roundNumber - 1];
    const nextRound = this.tournament.rounds[roundNumber];

    if (!nextRound)
      return;

    currentRound.matches.forEach((match, index) => {
      if (match.winnerId) {
        const nextMatchIndex = Math.floor(index / 2);
        const nextMatch = nextRound.matches[nextMatchIndex];

        if (nextMatch) {
          nextMatch.participants.push(match.winnerId);
        }
      }
    });
  }

  private isTournamentComplete(): boolean {
    if (!this.tournament)
      return false;

    const lastRound = this.tournament.rounds[this.tournament.rounds.length - 1];
    if (!lastRound || lastRound.state !== 'completed')
      return false;

    // For elimination: Check if finals are complete
    if (this.tournament.settings.format.includes('elimination')) {
      return lastRound.matches.every(m => m.winnerId);
    }

    // For round robin/swiss: Check if all rounds are complete
    return this.tournament.rounds.every(r => r.state === 'completed');
  }

  private async completeTournament() {
    if (!this.tournament)
      return;

    this.tournament.state = 'completed';
    this.tournament.completedAt = Date.now();

    // Determine final placements
    const lastRound = this.tournament.rounds[this.tournament.rounds.length - 1];
    const finalsMatch = lastRound.matches[0];

    if (finalsMatch) {
      this.tournament.winnerId = finalsMatch.winnerId;
      this.tournament.runnerUpId = finalsMatch.participants.find(
        p => p !== finalsMatch.winnerId
      );
    }

    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'TOURNAMENT_COMPLETED',
      tournament: this.tournament,
    }));
  }

  private findMatch(matchId: string): Match | null {
    if (!this.tournament)
      return null;

    for (const round of this.tournament.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (match)
        return match;
    }
    return null;
  }

  private async persistTournament() {
    if (this.tournament) {
      await this.room.storage.put('tournament', this.tournament);
    }
  }

  private broadcastTournamentState() {
    if (this.tournament) {
      this.room.broadcast(JSON.stringify({
        type: 'TOURNAMENT_STATE',
        tournament: this.tournament,
      }));
    }
  }

  private sendError(connection: Party.Connection, message: string) {
    connection.send(JSON.stringify({
      type: 'ERROR',
      message,
    }));
  }
}

function generateTournamentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TOUR-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

### 4. Client Hook (`src/hooks/use-tournament.ts`)

```typescript
import PartySocket from 'partysocket';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  Tournament,
  TournamentClientMessage,
  TournamentServerMessage,
} from '@/types/tournament.types';

export function useTournament(tournamentId: string, userId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!tournamentId)
      return;

    const protocol = import.meta.env.DEV ? 'ws' : 'wss';
    const host = import.meta.env.DEV ? 'localhost:1999' : 'typing-trainer.oluwasetemi.partykit.dev';

    const socket = new PartySocket({
      host,
      room: tournamentId,
      party: 'tournament',
      protocol,
    });

    socketRef.current = socket;

    socket.addEventListener('open', () => setIsConnected(true));
    socket.addEventListener('close', () => setIsConnected(false));
    socket.addEventListener('error', () => setError('Connection error'));

    socket.addEventListener('message', (event: MessageEvent) => {
      const message = JSON.parse(event.data) as TournamentServerMessage;

      switch (message.type) {
        case 'TOURNAMENT_STATE':
        case 'TOURNAMENT_STARTED':
        case 'TOURNAMENT_COMPLETED':
          setTournament(message.tournament);
          break;
        case 'PARTICIPANT_JOINED':
          // Update participants
          setTournament(prev => prev
            ? {
                ...prev,
                participants: {
                  ...prev.participants,
                  [message.participant.userId]: message.participant,
                },
              }
            : null);
          break;
        case 'ROUND_STARTED':
          // Update current round
          setTournament(prev => prev
            ? {
                ...prev,
                currentRound: message.round.number,
                rounds: prev.rounds.map(r =>
                  r.number === message.round.number ? message.round : r
                ),
              }
            : null);
          break;
        case 'MATCH_COMPLETED':
          // Update match results
          setTournament((prev) => {
            if (!prev)
              return null;
            return {
              ...prev,
              rounds: prev.rounds.map(round => ({
                ...round,
                matches: round.matches.map(match =>
                  match.id === message.matchId
                    ? { ...match, state: 'completed', results: message.results }
                    : match
                ),
              })),
            };
          });
          break;
        case 'ERROR':
          setError(message.message);
          break;
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [tournamentId]);

  const sendMessage = useCallback((message: TournamentClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinTournament = useCallback((username: string) => {
    sendMessage({
      type: 'JOIN_TOURNAMENT',
      username,
      userId,
    });
  }, [sendMessage, userId]);

  const startTournament = useCallback(() => {
    sendMessage({ type: 'START_TOURNAMENT' });
  }, [sendMessage]);

  const matchComplete = useCallback((matchId: string, results: any[]) => {
    sendMessage({
      type: 'MATCH_COMPLETE',
      matchId,
      results,
    });
  }, [sendMessage]);

  return {
    tournament,
    isConnected,
    error,
    joinTournament,
    startTournament,
    matchComplete,
  };
}
```

### 5. UI Components

#### Tournament Creation (`src/components/tournament/tournament-creator.tsx`)

```tsx
import { useState } from 'react';

import type { TournamentSettings } from '@/types/tournament.types';

import { FormActions, FormField, FormSection } from '../common/form-components';
import { Select } from '../select';

export function TournamentCreator({ onCreate }: { onCreate: (settings: TournamentSettings, name: string) => void }) {
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss-system'>('single-elimination');
  const [winCondition, setWinCondition] = useState<'fastest-completion' | 'highest-wpm' | 'best-score' | 'race-to-target'>('fastest-completion');
  const [size, setSize] = useState(8);

  const handleCreate = () => {
    const settings: TournamentSettings = {
      format,
      winCondition,
      size,
      advanceDelay: 10000, // 10 seconds between rounds
    };
    onCreate(settings, name);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Create Tournament
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up a multi-round typing competition
        </p>
      </header>

      <FormSection title="Tournament Details" description="Basic tournament information">
        <FormField
          label="Tournament Name"
          id="name"
          value={name}
          onChange={setName}
          placeholder="My Typing Tournament"
          colSpan="full"
          required
        />
      </FormSection>

      <FormSection title="Format Settings" description="How the tournament will be structured">
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tournament Format
          </label>
          <Select value={format} onChange={e => setFormat(e.target.value as any)}>
            <option value="single-elimination">Single Elimination</option>
            <option value="double-elimination">Double Elimination</option>
            <option value="round-robin">Round Robin</option>
            <option value="swiss-system">Swiss System</option>
          </Select>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {getFormatDescription(format)}
          </p>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Win Condition
          </label>
          <Select value={winCondition} onChange={e => setWinCondition(e.target.value as any)}>
            <option value="fastest-completion">Fastest Completion</option>
            <option value="highest-wpm">Highest WPM</option>
            <option value="best-score">Best Score (WPM × Accuracy)</option>
            <option value="race-to-target">Race to Target</option>
          </Select>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tournament Size
          </label>
          <Select value={size} onChange={e => setSize(Number(e.target.value))}>
            <option value={4}>4 Players</option>
            <option value={8}>8 Players</option>
            <option value={16}>16 Players</option>
            <option value={32}>32 Players</option>
            <option value={64}>64 Players</option>
          </Select>
        </div>
      </FormSection>

      <FormActions
        submitText="Create Tournament"
        onSubmit={handleCreate}
        submitDisabled={!name}
      />
    </div>
  );
}

function getFormatDescription(format: string): string {
  switch (format) {
    case 'single-elimination':
      return 'Losers are eliminated. Winners advance to the next round.';
    case 'double-elimination':
      return 'Players get a second chance in a losers bracket.';
    case 'round-robin':
      return 'Everyone plays against everyone once.';
    case 'swiss-system':
      return 'Players face opponents with similar records.';
    default:
      return '';
  }
}
```

#### Tournament Bracket View (`src/components/tournament/tournament-bracket.tsx`)

```tsx
import type { Match, Tournament } from '@/types/tournament.types';

export function TournamentBracket({ tournament }: { tournament: Tournament }) {
  if (tournament.settings.format === 'round-robin' || tournament.settings.format === 'swiss-system') {
    return <RoundListView tournament={tournament} />;
  }

  return <BracketTreeView tournament={tournament} />;
}

function BracketTreeView({ tournament }: { tournament: Tournament }) {
  const winnersBracket = tournament.rounds.filter(r => r.bracket === 'winners');

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 p-4">
        {winnersBracket.map(round => (
          <div key={round.number} className="flex flex-col gap-4 min-w-[200px]">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
              {getRoundName(round.number, winnersBracket.length)}
            </h3>
            {round.matches.map(match => (
              <MatchCard key={match.id} match={match} tournament={tournament} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, tournament }: { match: Match; tournament: Tournament }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-2">
      {match.participants.map((userId) => {
        const participant = tournament.participants[userId];
        const isWinner = match.winnerId === userId;

        return (
          <div
            key={userId}
            className={`py-1 px-2 ${isWinner ? 'font-bold text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {participant?.username || 'TBD'}
            {match.results?.[userId] && (
              <span className="ml-2 text-xs">
                {Math.round(match.results[userId].wpm)}
                {' '}
                WPM
              </span>
            )}
          </div>
        );
      })}
      {match.participants.length === 0 && (
        <div className="text-gray-400 dark:text-gray-500 text-sm">Waiting...</div>
      )}
    </div>
  );
}

function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0)
    return 'Finals';
  if (roundsFromEnd === 1)
    return 'Semi-Finals';
  if (roundsFromEnd === 2)
    return 'Quarter-Finals';

  return `Round ${roundNumber}`;
}

function RoundListView({ tournament }: { tournament: Tournament }) {
  return (
    <div className="space-y-6">
      {tournament.rounds.map(round => (
        <div key={round.number} className="bg-white dark:bg-zinc-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Round
            {round.number}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {round.matches.map(match => (
              <MatchCard key={match.id} match={match} tournament={tournament} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Tournament Match View (Integrated with Competition)

```tsx
// When a match is ready, participants navigate to:
// /tournament/${tournamentId}/match/${matchId}
// This creates a competition session and uses existing competition UI
```

### 6. Integration with Existing Competition

- Each match creates a temporary competition session
- Match uses existing `CompetitionTypingView` component
- After match ends, results are sent back to tournament server
- Tournament server advances winners and starts next matches

---

## Implementation Steps

### Phase 1: Foundation (Types & Utilities)

1. Create `src/types/tournament.types.ts` with all tournament interfaces
2. Create `src/utils/tournament-brackets.ts` with bracket generation logic
3. Add tournament types to existing `competition.types.ts` exports

### Phase 2: Server Implementation

4. Create `party/tournament-server.ts` with full tournament management
5. Update `partykit.json` to register tournament party
6. Test bracket generation for all formats

### Phase 3: Client Hook

7. Create `src/hooks/use-tournament.ts` for WebSocket connection
8. Handle all tournament messages and state updates

### Phase 4: UI Components

9. Create tournament creator component with format selection
10. Create tournament lobby/registration component
11. Create bracket visualization component
12. Create tournament results component

### Phase 5: Integration

13. Add tournament route to router
14. Integrate matches with existing competition system
15. Add tournament option to competition mode selector

### Phase 6: Testing & Polish

16. Test all tournament formats with 4, 8, 16 participants
17. Test automatic progression between rounds
18. Add loading states and error handling
19. Add dark mode to all tournament components

---

## Files to Create

```
src/types/tournament.types.ts
src/utils/tournament-brackets.ts
src/hooks/use-tournament.ts
src/components/tournament/tournament-creator.tsx
src/components/tournament/tournament-lobby.tsx
src/components/tournament/tournament-bracket.tsx
src/components/tournament/tournament-match.tsx
src/components/tournament/tournament-results.tsx
src/routes/tournament/$tournamentId.tsx
src/routes/tournament/$tournamentId/match/$matchId.tsx
party/tournament-server.ts
```

## Files to Modify

```
partykit.json - Register tournament party
src/components/session-manager/session-mode-selector.tsx - Add tournament option
src/types/competition.types.ts - Export tournament types
```

---

## Testing Checklist

- [ ] Single elimination bracket generation (4, 8, 16 players)
- [ ] Double elimination with losers bracket
- [ ] Round robin all-vs-all matchups
- [ ] Swiss system pairing algorithm
- [ ] Winner determination for all win conditions
- [ ] Automatic round progression with delay
- [ ] Match integration with competition system
- [ ] Tournament completion and final standings
- [ ] Participant reconnection during tournament
- [ ] Host controls (start, pause, cancel)
- [ ] Dark mode for all tournament UI
- [ ] Mobile responsiveness for bracket view

---

## Future Enhancements (Out of Scope)

- Spectator mode for tournament matches
- Tournament chat/announcements
- Best-of-3 matches
- Custom bracket seeding
- Tournament scheduling (delayed start)
- Prize/ranking system
- Tournament history and statistics
- Live tournament discovery/browse
- Team-based tournaments

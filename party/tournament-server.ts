import type * as Party from 'partykit/server';

import type {
  Match,
  MatchResult,
  Tournament,
  TournamentClientMessage,
  TournamentParticipant,
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
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  async onStart() {
    try {
      const stored = await this.room.storage.get<Tournament>('tournament');
      if (stored) {
        this.tournament = stored;
      }
    }
    catch (error) {
      console.error('[TournamentServer] Error loading tournament from storage:', error);
    }
  }

  async onConnect(connection: Party.Connection) {
    console.log('[TournamentServer] Connection opened:', connection.id);

    // Send current tournament state to newly connected client
    if (this.tournament) {
      console.log('[TournamentServer] Sending current tournament state to new connection');
      this.sendToConnection(connection, {
        type: 'TOURNAMENT_STATE',
        tournament: this.tournament,
      });
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
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

        case 'UPDATE_CONNECTION':
          await this.handleUpdateConnection(msg, sender);
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
    catch (error) {
      console.error('[TournamentServer] Error handling message:', error);
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Failed to process message',
      });
    }
  }

  async onClose(connection: Party.Connection) {
    if (this.tournament) {
      const participant = Object.values(this.tournament.participants).find(
        p => p.connectionId === connection.id,
      );

      if (participant) {
        participant.isConnected = false;

        const existingTimeout = this.disconnectTimeouts.get(participant.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(async () => {
          if (
            this.tournament
            && this.tournament.participants[participant.userId]
            && !this.tournament.participants[participant.userId].isConnected
          ) {
            await this.persistTournament();
          }
          this.disconnectTimeouts.delete(participant.userId);
        }, 30000); // 30 seconds

        this.disconnectTimeouts.set(participant.userId, timeout);

        this.room.broadcast(JSON.stringify({
          type: 'PARTICIPANT_LEFT',
          userId: participant.userId,
        }));
      }
    }
  }

  private async handleCreateTournament(
    msg: {
      settings: Tournament['settings'];
      name: string;
      hostUsername: string;
      hostUserId: string;
    },
    sender: Party.Connection,
  ) {
    console.warn('[TournamentServer] Creating tournament:', this.room.id);

    this.tournament = {
      id: this.room.id,
      name: msg.name,
      code: this.room.id, // Use the room ID as the tournament code
      state: 'registration',
      settings: msg.settings,
      participants: {
        [msg.hostUserId]: {
          userId: msg.hostUserId,
          username: msg.hostUsername,
          seed: 1,
          isEliminated: false,
          wins: 0,
          losses: 0,
          matchesPlayed: 0,
          connectionId: sender.id,
          isConnected: true,
        },
      },
      rounds: [],
      currentRound: 0,
      hostUserId: msg.hostUserId,
      createdAt: Date.now(),
    };

    await this.persistTournament();
    this.broadcastTournamentState();
  }

  private async handleJoinTournament(
    msg: { username: string; userId: string },
    sender: Party.Connection,
  ) {
    console.warn('[TournamentServer] Join request:', { userId: msg.userId, username: msg.username, roomId: this.room.id });

    if (!this.tournament) {
      console.error('[TournamentServer] Tournament not found for room:', this.room.id);
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Tournament not found. Please make sure the tournament has been created.',
      });
      return;
    }

    if (this.tournament.state !== 'registration') {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Tournament has already started',
      });
      return;
    }

    // Check for existing participant (reconnection)
    const existingParticipant = this.tournament.participants[msg.userId];

    if (existingParticipant) {
      const isReconnection = !existingParticipant.isConnected || existingParticipant.connectionId === sender.id;

      if (!isReconnection) {
        this.sendToConnection(sender, {
          type: 'ERROR',
          message: 'This user is already in the tournament',
        });
        return;
      }

      // Reconnection
      const existingTimeout = this.disconnectTimeouts.get(msg.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.disconnectTimeouts.delete(msg.userId);
      }

      existingParticipant.connectionId = sender.id;
      existingParticipant.isConnected = true;

      await this.persistTournament();

      this.sendToConnection(sender, {
        type: 'TOURNAMENT_STATE',
        tournament: this.tournament,
      });

      this.room.broadcast(JSON.stringify({
        type: 'PARTICIPANT_JOINED',
        participant: existingParticipant,
      }));
      return;
    }

    const participantCount = Object.keys(this.tournament.participants).length;
    if (participantCount >= this.tournament.settings.size) {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Tournament is full',
      });
      return;
    }

    const participant: TournamentParticipant = {
      userId: msg.userId,
      username: msg.username,
      seed: participantCount + 1,
      isEliminated: false,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      connectionId: sender.id,
      isConnected: true,
    };

    this.tournament.participants[msg.userId] = participant;
    await this.persistTournament();

    this.sendToConnection(sender, {
      type: 'TOURNAMENT_STATE',
      tournament: this.tournament,
    });

    this.room.broadcast(JSON.stringify({
      type: 'PARTICIPANT_JOINED',
      participant,
    }));
  }

  private async handleUpdateConnection(
    msg: { userId: string },
    sender: Party.Connection,
  ) {
    if (!this.tournament) {
      return;
    }

    const participant = this.tournament.participants[msg.userId];
    if (participant) {
      console.log('[TournamentServer] Updating connection ID for user:', msg.userId, 'from', participant.connectionId, 'to', sender.id);
      participant.connectionId = sender.id;
      participant.isConnected = true;

      // Clear any disconnect timeout
      const existingTimeout = this.disconnectTimeouts.get(msg.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.disconnectTimeouts.delete(msg.userId);
      }

      await this.persistTournament();
    }
  }

  private async handleStartTournament(sender: Party.Connection) {
    console.warn('[TournamentServer] START_TOURNAMENT received from connection:', sender.id);

    if (!this.tournament) {
      console.error('[TournamentServer] Tournament not found');
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Tournament not found',
      });
      return;
    }

    console.warn('[TournamentServer] Tournament exists:', this.tournament.id);
    console.warn('[TournamentServer] Host user ID:', this.tournament.hostUserId);
    console.warn('[TournamentServer] All participants:', Object.values(this.tournament.participants).map(p => ({
      userId: p.userId,
      username: p.username,
      connectionId: p.connectionId,
    })));

    // Find participant by connection ID
    const senderParticipant = Object.values(this.tournament.participants).find(
      p => p.connectionId === sender.id,
    );

    console.warn('[TournamentServer] Sender participant:', senderParticipant ? {
      userId: senderParticipant.userId,
      username: senderParticipant.username,
      isHost: senderParticipant.userId === this.tournament.hostUserId,
    } : 'NOT FOUND');

    if (!senderParticipant || senderParticipant.userId !== this.tournament.hostUserId) {
      console.error('[TournamentServer] Authorization failed - not host');
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Only the host can start the tournament',
      });
      return;
    }

    const participantCount = Object.keys(this.tournament.participants).length;
    console.warn('[TournamentServer] Participant count:', participantCount);

    if (participantCount < 2) {
      console.error('[TournamentServer] Not enough participants');
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Need at least 2 participants',
      });
      return;
    }

    console.warn('[TournamentServer] Starting tournament with format:', this.tournament.settings.format);

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

      case 'swiss-system': {
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
    }

    this.tournament.state = 'in-progress';
    this.tournament.startedAt = Date.now();
    this.tournament.currentRound = 1;

    console.warn('[TournamentServer] Tournament state set to in-progress, current round:', this.tournament.currentRound);

    await this.persistTournament();
    console.warn('[TournamentServer] Tournament persisted');

    this.room.broadcast(JSON.stringify({
      type: 'TOURNAMENT_STARTED',
      tournament: this.tournament,
    } as TournamentServerMessage));

    console.warn('[TournamentServer] TOURNAMENT_STARTED broadcast sent');

    // Start first round
    await this.startRound(1);
    console.warn('[TournamentServer] First round started');
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
    } as TournamentServerMessage));

    // Notify participants about their matches
    for (const match of round.matches) {
      if (match.participants.length >= 2) {
        await this.notifyMatchReady(match);
      }
    }
  }

  private async notifyMatchReady(match: Match) {
    if (!this.tournament)
      return;

    match.state = 'ready';
    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'MATCH_READY',
      match,
    } as TournamentServerMessage));
  }

  private async handleReadyForMatch(
    msg: { matchId: string },
    sender: Party.Connection,
  ) {
    if (!this.tournament)
      return;

    console.warn('[TournamentServer] Ready for match:', msg.matchId);

    const match = this.findMatch(msg.matchId);
    if (!match) {
      console.error('[TournamentServer] Match not found:', msg.matchId);
      return;
    }

    // Mark this participant as ready
    const participant = Object.values(this.tournament.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant) {
      console.error('[TournamentServer] Participant not found for connection:', sender.id);
      return;
    }

    console.warn('[TournamentServer] Participant ready:', participant.username);

    // Initialize readyParticipants array if it doesn't exist
    if (!match.readyParticipants) {
      match.readyParticipants = [];
    }

    // Add participant to ready list if not already there
    if (!match.readyParticipants.includes(participant.userId)) {
      match.readyParticipants.push(participant.userId);
      console.warn('[TournamentServer] Ready participants:', match.readyParticipants.length, '/', match.participants.length);
    }

    // Check if all participants are ready
    const allReady = match.participants.every(p => match.readyParticipants?.includes(p));

    console.warn('[TournamentServer] All participants ready?', allReady);

    if (allReady && match.state === 'ready') {
      match.state = 'active';

      // Create a competition room ID for this match
      const competitionId = `${this.tournament.id}-${match.id}`;
      match.competitionId = competitionId;

      await this.persistTournament();

      // Broadcast match started
      this.room.broadcast(JSON.stringify({
        type: 'MATCH_STARTED',
        matchId: match.id,
        competitionId,
      }));

      console.warn('[TournamentServer] Match started:', { matchId: match.id, competitionId });
    }
    else {
      // Broadcast updated match state so clients can see who's ready
      await this.persistTournament();

      this.room.broadcast(JSON.stringify({
        type: 'MATCH_READY',
        match,
      }));
    }
  }

  private async handleMatchComplete(
    msg: { matchId: string; results: MatchResult[] },
    _sender: Party.Connection,
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

    // Determine winner based on win condition
    const winnerId = determineMatchWinner(
      msg.results,
      this.tournament.settings.winCondition,
      this.tournament.settings.minAccuracy,
    );
    match.winnerId = winnerId;

    // Find loser
    match.loserId = match.participants.find(p => p !== winnerId);

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
          // Only eliminate in single elimination
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
      winnerId,
    } as TournamentServerMessage));

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
      } as TournamentServerMessage));

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
        this.tournament.currentRound++;
        await this.persistTournament();

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

      // For double elimination, advance losers to losers bracket
      if (this.tournament!.settings.format === 'double-elimination' && match.loserId) {
        // Find corresponding losers bracket match
        const losersBracketRound = this.tournament!.rounds.find(
          r => r.bracket === 'losers' && r.number === roundNumber,
        );

        if (losersBracketRound) {
          const losersMatchIndex = Math.floor(index / 2);
          const losersMatch = losersBracketRound.matches[losersMatchIndex];

          if (losersMatch) {
            losersMatch.participants.push(match.loserId);
          }
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
        p => p !== finalsMatch.winnerId,
      );

      // For third place, find semi-finals losers
      if (this.tournament.rounds.length >= 2) {
        const semiFinals = this.tournament.rounds[this.tournament.rounds.length - 2];
        const semiFinalsLosers = semiFinals.matches
          .map(m => m.participants.find(p => p !== m.winnerId))
          .filter(Boolean);

        if (semiFinalsLosers.length > 0) {
          // Pick first semi-finals loser as 3rd place
          this.tournament.thirdPlaceId = semiFinalsLosers[0];
        }
      }
    }

    await this.persistTournament();

    this.room.broadcast(JSON.stringify({
      type: 'TOURNAMENT_COMPLETED',
      tournament: this.tournament,
    } as TournamentServerMessage));
  }

  private async handleLeaveTournament(sender: Party.Connection) {
    if (!this.tournament)
      return;

    const participant = Object.values(this.tournament.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant)
      return;

    // Only allow leaving during registration
    if (this.tournament.state === 'registration') {
      delete this.tournament.participants[participant.userId];
      await this.persistTournament();

      this.room.broadcast(JSON.stringify({
        type: 'PARTICIPANT_LEFT',
        userId: participant.userId,
      } as TournamentServerMessage));

      // If host leaves, cancel tournament
      if (participant.userId === this.tournament.hostUserId) {
        this.tournament.state = 'cancelled';
        await this.persistTournament();
        this.broadcastTournamentState();
      }
    }
    else {
      // During active tournament, mark as disconnected but don't remove
      participant.isConnected = false;
      await this.persistTournament();

      this.room.broadcast(JSON.stringify({
        type: 'PARTICIPANT_LEFT',
        userId: participant.userId,
      } as TournamentServerMessage));
    }
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
      try {
        await this.room.storage.put('tournament', this.tournament);
      }
      catch (error) {
        console.error('[TournamentServer] Error persisting tournament:', error);
      }
    }
  }

  private broadcastTournamentState() {
    if (this.tournament) {
      this.room.broadcast(JSON.stringify({
        type: 'TOURNAMENT_STATE',
        tournament: this.tournament,
      } as TournamentServerMessage));
    }
  }

  private sendToConnection(
    connection: Party.Connection,
    message: TournamentServerMessage,
  ) {
    connection.send(JSON.stringify(message));
  }
}

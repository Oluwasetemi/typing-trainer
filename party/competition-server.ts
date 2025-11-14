import type * as Party from 'partykit/server';

import type {
  CompetitionClientMessage,
  CompetitionServerMessage,
  CompetitionSession,
  LeaderboardEntry,
  Participant,
} from '@/types/competition.types';

import { getRandomText } from '@/utils/texts';

const COUNTDOWN_DURATION = 3000; // 3 seconds

export default class CompetitionServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private session: CompetitionSession | null = null;
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  async onStart() {
    try {
      const stored = await this.room.storage.get<CompetitionSession>('session');
      if (stored) {
        this.session = stored;
      }
    }
    catch (error) {
      console.error('[CompetitionServer] Error loading session from storage:', error);
    }
  }

  async onConnect(_connection: Party.Connection) {
    // Don't immediately send session state on connect
    // Wait for JOIN_COMPETITION message to properly handle reconnection
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const msg = JSON.parse(message) as CompetitionClientMessage;

      switch (msg.type) {
        case 'JOIN_COMPETITION':
          await this.handleJoinCompetition(msg, sender);
          break;

        case 'READY_UP':
          await this.handleReadyUp(msg, sender);
          break;

        case 'START_COMPETITION':
          await this.handleStartCompetition(sender);
          break;

        case 'TYPING_UPDATE':
          await this.handleTypingUpdate(msg, sender);
          break;

        case 'FINISH_TYPING':
          await this.handleFinishTyping(msg, sender);
          break;

        case 'LEAVE_COMPETITION':
          await this.handleLeaveCompetition(sender);
          break;
      }
    }
    catch (error) {
      console.error('Error handling message:', error);
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Failed to process message',
      });
    }
  }

  async onClose(connection: Party.Connection) {
    if (this.session) {
      const participant = Object.values(this.session.participants).find(
        p => p.connectionId === connection.id,
      );

      if (participant) {
        participant.isConnected = false;

        const existingTimeout = this.disconnectTimeouts.get(participant.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(async () => {
          if (this.session && this.session.participants[participant.userId] && !this.session.participants[participant.userId].isConnected) {
            await this.persistSession();
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

  private async handleJoinCompetition(
    msg: { username: string; userId: string },
    sender: Party.Connection,
  ) {
    if (!this.session) {
      this.session = {
        id: this.room.id,
        name: `Competition ${this.room.id}`,
        code: this.room.id, // Use room ID as the code directly
        state: 'waiting',
        sourceText: getRandomText(),
        participants: {},
        settings: {
          maxParticipants: 20, // TODO: make this configurable in the future
          minParticipants: 2, // TODO: make this configurable in the future
        },
        createdAt: Date.now(),
      };
    }

    const existingParticipant = this.session.participants[msg.userId];

    if (existingParticipant) {
      const isReconnection = !existingParticipant.isConnected || existingParticipant.connectionId === sender.id;

      if (!isReconnection) {
        this.sendToConnection(sender, {
          type: 'ERROR',
          message: 'This user is already in the competition. Please use a different identity.',
        });
        return;
      }

      const existingTimeout = this.disconnectTimeouts.get(msg.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.disconnectTimeouts.delete(msg.userId);
      }

      existingParticipant.connectionId = sender.id;
      existingParticipant.isConnected = true;

      await this.persistSession();

      this.sendToConnection(sender, {
        type: 'COMPETITION_STATE',
        session: this.session,
      });

      this.room.broadcast(JSON.stringify({
        type: 'PARTICIPANT_JOINED',
        participant: existingParticipant,
      }));
      return;
    }

    const participantCount = Object.keys(this.session.participants).length;
    if (participantCount >= this.session.settings.maxParticipants) {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Competition is full',
      });
      return;
    }

    if (this.session.state !== 'waiting') {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Competition has already started',
      });
      return;
    }

    const participant: Participant = {
      userId: msg.userId,
      username: msg.username,
      connectionId: sender.id,
      isReady: false,
      isHost: participantCount === 0, // First person is host
      joinedAt: Date.now(),
      isConnected: true,
      stats: {
        wpm: 0,
        accuracy: 100,
        progress: 0,
        currentIndex: 0,
        errors: 0,
        finished: false,
      },
    };

    this.session.participants[msg.userId] = participant;
    await this.persistSession();

    // Send the full competition state to the new participant
    this.sendToConnection(sender, {
      type: 'COMPETITION_STATE',
      session: this.session,
    });

    // Broadcast to ALL participants (including the sender) that someone joined
    // This ensures everyone sees the updated participant list
    this.room.broadcast(JSON.stringify({
      type: 'PARTICIPANT_JOINED',
      participant,
    }));
  }

  private async handleReadyUp(
    msg: { isReady: boolean },
    sender: Party.Connection,
  ) {
    if (!this.session)
      return;

    const participant = Object.values(this.session.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant)
      return;

    participant.isReady = msg.isReady;
    await this.persistSession();

    this.room.broadcast(JSON.stringify({
      type: 'PARTICIPANT_READY',
      userId: participant.userId,
      isReady: msg.isReady,
    }));
  }

  private async handleStartCompetition(sender: Party.Connection) {
    if (!this.session)
      return;

    const participant = Object.values(this.session.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant?.isHost) {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: 'Only the host can start the competition',
      });
      return;
    }

    const participantCount = Object.keys(this.session.participants).length;
    if (participantCount < this.session.settings.minParticipants) {
      this.sendToConnection(sender, {
        type: 'ERROR',
        message: `Need at least ${this.session.settings.minParticipants} participants`,
      });
      return;
    }

    this.session.state = 'countdown';
    this.session.countdownStartTime = Date.now();
    await this.persistSession();

    this.room.broadcast(JSON.stringify({
      type: 'COUNTDOWN_START',
      countdownStartTime: this.session.countdownStartTime,
    }));

    setTimeout(async () => {
      if (this.session && this.session.state === 'countdown') {
        this.session.state = 'active';
        this.session.startTime = Date.now();
        await this.persistSession();

        this.room.broadcast(JSON.stringify({
          type: 'COMPETITION_START',
          startTime: this.session.startTime,
        }));
      }
    }, COUNTDOWN_DURATION);
  }

  private async handleTypingUpdate(
    msg: {
      currentIndex: number;
      errors: number;
      wpm: number;
      accuracy: number;
      progress: number;
    },
    sender: Party.Connection,
  ) {
    if (!this.session)
      return;

    const participant = Object.values(this.session.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant)
      return;

    participant.stats = {
      ...participant.stats,
      currentIndex: msg.currentIndex,
      errors: msg.errors,
      wpm: msg.wpm,
      accuracy: msg.accuracy,
      progress: msg.progress,
    };

    await this.persistSession();

    const leaderboard = this.calculateLeaderboard();
    this.room.broadcast(JSON.stringify({
      type: 'LEADERBOARD_UPDATE',
      leaderboard,
    }));
  }

  private async handleFinishTyping(
    msg: { finalStats: any },
    sender: Party.Connection,
  ) {
    if (!this.session)
      return;

    const participant = Object.values(this.session.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant)
      return;

    participant.stats = {
      ...msg.finalStats,
      finished: true,
      finishTime: Date.now(),
    };

    await this.persistSession();

    const allFinished = Object.values(this.session.participants).every(
      p => p.stats.finished || !p.isConnected,
    );

    if (allFinished) {
      this.session.state = 'finished';
      this.session.endTime = Date.now();
      await this.persistSession();

      const finalLeaderboard = this.calculateLeaderboard();
      this.room.broadcast(JSON.stringify({
        type: 'COMPETITION_END',
        finalLeaderboard,
      }));
    }
    else {
      // Just update leaderboard
      const leaderboard = this.calculateLeaderboard();
      this.room.broadcast(JSON.stringify({
        type: 'LEADERBOARD_UPDATE',
        leaderboard,
      }));
    }
  }

  private async handleLeaveCompetition(sender: Party.Connection) {
    if (!this.session)
      return;

    const participant = Object.values(this.session.participants).find(
      p => p.connectionId === sender.id,
    );

    if (!participant)
      return;

    delete this.session.participants[participant.userId];
    await this.persistSession();

    this.room.broadcast(JSON.stringify({
      type: 'PARTICIPANT_LEFT',
      userId: participant.userId,
    }));

    if (Object.keys(this.session.participants).length === 0) {
      this.session = null;
      await this.room.storage.delete('session');
    }
  }

  private calculateLeaderboard(): LeaderboardEntry[] {
    if (!this.session)
      return [];

    const entries = Object.values(this.session.participants)
      .filter(p => p.isConnected)
      .map(p => ({
        userId: p.userId,
        username: p.username,
        wpm: p.stats.wpm,
        accuracy: p.stats.accuracy,
        progress: p.stats.progress,
        finished: p.stats.finished,
        finishTime: p.stats.finishTime,
        isYou: false, // Will be set on client side
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

    return entries;
  }

  private async persistSession() {
    if (this.session) {
      try {
        await this.room.storage.put('session', this.session);
      }
      catch (error) {
        console.error('[CompetitionServer] Error persisting session:', error);
      }
    }
  }

  private sendToConnection(
    connection: Party.Connection,
    message: CompetitionServerMessage,
  ) {
    connection.send(JSON.stringify(message));
  }
}

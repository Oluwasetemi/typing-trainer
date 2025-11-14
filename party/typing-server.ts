import type * as Party from 'partykit/server';

export type TypingEvent = {
  type:
    | 'TYPING_UPDATE'
    | 'SESSION_START'
    | 'SESSION_END'
    | 'SPECTATOR_JOIN'
    | 'SPECTATOR_LEAVE';
  data?: any;
  timestamp: number;
};

export type TypingSessionState = {
  sourceText: string;
  currentIndex: number;
  errors: number[];
  startTime: number | null;
  finished: boolean;
  typedText: string;
  isActive: boolean;
  typistId: string | null;
  spectatorCount: number;
  sessionName: string | null;
};

export default class TypingServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private sessionState: TypingSessionState = {
    sourceText: '',
    currentIndex: 0,
    errors: [],
    startTime: null,
    finished: false,
    typedText: '',
    isActive: false,
    typistId: null,
    spectatorCount: 0,
    sessionName: null,
  };

  private typistConnection: Party.Connection | null = null;
  private spectators = new Set<Party.Connection>();

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    // Determine if this is a typist or spectator based on query params
    const url = new URL(ctx.request.url);
    const role = url.searchParams.get('role') || 'spectator';
    const userId = url.searchParams.get('userId') || `user-${Date.now()}`;
    const sessionName = url.searchParams.get('sessionName');

    if (role === 'typist' && !this.typistConnection) {
      // First typist connection
      this.typistConnection = connection;
      this.sessionState.typistId = userId;
      this.sessionState.isActive = true;
      this.sessionState.sessionName = sessionName;

      // Send current session state to the typist
      connection.send(
        JSON.stringify({
          type: 'SESSION_INIT',
          data: this.sessionState,
          timestamp: Date.now(),
        }),
      );

      // Notify spectators that a typist has joined
      this.room.broadcast(JSON.stringify(
        {
          type: 'SESSION_START',
          data: { typistId: userId },
          timestamp: Date.now(),
        },
      ));
    }
    else if (role === 'spectator') {
      // Spectator connection
      this.spectators.add(connection);
      this.sessionState.spectatorCount = this.spectators.size;

      // Send current session state to the spectator
      connection.send(
        JSON.stringify({
          type: 'SPECTATOR_INIT',
          data: this.sessionState,
          timestamp: Date.now(),
        }),
      );

      // Notify others about spectator count update
      this.room.broadcast(JSON.stringify(
        {
          type: 'SPECTATOR_JOIN',
          data: { spectatorCount: this.sessionState.spectatorCount },
          timestamp: Date.now(),
        },
      ));
    }
    else {
      // Reject additional typists
      connection.send(
        JSON.stringify({
          type: 'CONNECTION_REJECTED',
          data: { reason: 'Session already has a typist' },
          timestamp: Date.now(),
        }),
      );
      connection.close(1000, 'Session unavailable');
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const event: TypingEvent = JSON.parse(message);

      if (sender !== this.typistConnection) {
        return;
      }

      switch (event.type) {
        case 'TYPING_UPDATE':
          this.sessionState = {
            ...this.sessionState,
            ...event.data,
          };

          this.broadcastToSpectators({
            type: 'TYPING_UPDATE',
            data: this.sessionState,
            timestamp: Date.now(),
          });
          break;

        case 'SESSION_END':
          this.sessionState.finished = true;
          this.sessionState.isActive = false;

          this.room.broadcast(JSON.stringify({
            type: 'SESSION_END',
            data: this.sessionState,
            timestamp: Date.now(),
          }));
          break;
      }
    }
    catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async onClose(connection: Party.Connection) {
    if (connection === this.typistConnection) {
      this.typistConnection = null;
      this.sessionState.isActive = false;
      this.sessionState.typistId = null;

      this.broadcastToSpectators({
        type: 'SESSION_END',
        data: { reason: 'Typist disconnected' },
        timestamp: Date.now(),
      });
    }
    else if (this.spectators.has(connection)) {
      this.spectators.delete(connection);
      this.sessionState.spectatorCount = this.spectators.size;

      this.room.broadcast(JSON.stringify({
        type: 'SPECTATOR_LEAVE',
        data: { spectatorCount: this.sessionState.spectatorCount },
        timestamp: Date.now(),
      }));
    }
  }

  // to allow API connections
  async onRequest(request: Party.Request) {
    if (request.method === 'GET') {
      // Return current session state
      return new Response(JSON.stringify(this.sessionState), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const sessionData = await request.json();
      this.sessionState = {
        ...this.sessionState,
        sourceText: (sessionData as TypingSessionState).sourceText,
        sessionName: (sessionData as TypingSessionState).sessionName,
        currentIndex: 0,
        errors: [],
        startTime: null,
        finished: false,
        typedText: '',
      };

      return new Response(JSON.stringify(this.sessionState), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }

  private broadcastToSpectators(event: TypingEvent) {
    const message = JSON.stringify(event);
    this.spectators.forEach((spectator) => {
      spectator.send(message);
    });
  }
}

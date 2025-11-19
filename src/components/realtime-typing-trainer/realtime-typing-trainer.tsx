import { useEffect } from 'react';

import ErrorFeedback from '@/components/error-feedback/error-feedback';
import { ProgressBar } from '@/components/progress-bar';
import { StatsPanel } from '@/components/stats-panel';
import { TextDisplay } from '@/components/text-display';
import { TypingInput } from '@/components/typing-input';
import { TypingProvider } from '@/context/typing-context';
import { useRealtimeTyping } from '@/hooks/use-realtime-typing';
import { useTyping } from '@/hooks/use-typing';

type RealtimeTypingTrainerProps = {
  sessionId: string;
  userId?: string;
  sessionName?: string;
};

function RealtimeTypingTrainerContent({
  sessionId,
  userId,
  sessionName,
}: RealtimeTypingTrainerProps) {
  const { state } = useTyping();
  const {
    realtimeState,
    isConnected,
    connectionError,
    broadcastTypingUpdate,
    broadcastSessionEnd,
  } = useRealtimeTyping({
    roomId: sessionId,
    role: 'typist',
    userId,
    sessionName,
    enabled: sessionId !== 'solo',
  });

  // Broadcast typing state changes to spectators
  useEffect(
    function broadcastTypingUpdateEffect() {
      if (sessionId !== 'solo' && isConnected) {
        broadcastTypingUpdate(state);
      }
    },
    [state, broadcastTypingUpdate, isConnected, sessionId],
  );

  // Broadcast session end
  useEffect(
    function broadcastSessionEndEffect() {
      if (sessionId !== 'solo' && state.finished && isConnected) {
        broadcastSessionEnd();
      }
    },
    [state.finished, broadcastSessionEnd, isConnected, sessionId],
  );

  const handleBackToSessions = () => {
    window.location.href = '/';
  };

  if (connectionError && sessionId !== 'solo') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h1>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <div className="space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={handleBackToSessions}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected && sessionId !== 'solo') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Connecting to Session...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <button
            type="button"
            onClick={handleBackToSessions}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBackToSessions}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            ← Back to Sessions
          </button>

          <div className="flex items-center gap-4">
            {sessionId !== 'solo' && (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                >
                </span>
                <span className="text-gray-600">
                  {isConnected ? 'Live Session' : 'Disconnected'}
                </span>
                {realtimeState.spectatorCount > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {realtimeState.spectatorCount}
                      {' '}
                      viewers
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="text-sm text-gray-500">
              Session:
              {' '}
              {sessionId === 'solo'
                ? 'Solo Practice'
                : (realtimeState.sessionName || sessionId.slice(-8))}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {sessionId === 'solo'
            ? 'Solo Typing Practice'
            : (realtimeState.sessionName || 'Live Typing Session')}
        </h1>
        <p className="text-gray-600">
          {sessionId === 'solo'
            ? 'Practice your typing skills'
            : 'Your typing is being broadcast live to spectators'}
        </p>
      </header>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar />
      </div>

      {/* Error Feedback */}
      <div className="mb-6">
        <ErrorFeedback />
      </div>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Display and Input - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <TextDisplay />
          <TypingInput />
        </div>

        {/* Stats Panel - Takes up 1 column on large screens */}
        <aside className="lg:col-span-1">
          <StatsPanel />
        </aside>
      </main>

      {/* Session Info */}
      {sessionId !== 'solo' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📡 Live Session Active
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Spectators can see your typing progress in real-time</p>
            <p>
              • Share this session ID with others:
              {' '}
              <code className="bg-blue-100 px-1 rounded">{sessionId}</code>
            </p>
            <p>• Your typing statistics are being broadcast live</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealtimeTypingTrainer(
  props: RealtimeTypingTrainerProps,
) {
  return (
    <TypingProvider>
      <RealtimeTypingTrainerContent {...props} />
    </TypingProvider>
  );
}

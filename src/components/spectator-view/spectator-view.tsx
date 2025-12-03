import React, { useEffect, useMemo, useState } from 'react';

import { TypingContext } from '../../context/typing-context';
import { useRealtimeTyping } from '../../hooks/use-realtime-typing';
import { Icons } from '../../utils/icons';
import { calcAccuracy, calcWPM, formatTime } from '../../utils/metrics';
import KeyboardDisplay from '../keyboard-display/keyboard-display';
import { StatCard } from '../stats-panel';
import TextDisplay from '../text-display/text-display';

type SpectatorViewProps = {
  sessionId: string;
  userId?: string;
  sessionName?: string;
};

// Mock typing context provider that uses realtime state directly
function SpectatorTypingProvider({ realtimeState, children }: { realtimeState: any; children: React.ReactNode }) {
  // Create a mock state from realtime state
  const mockState = useMemo(() => ({
    sourceText: realtimeState.sourceText || '',
    currentIndex: realtimeState.currentIndex || 0,
    errors: realtimeState.errors || new Set(),
    startTime: realtimeState.startTime || null,
    endTime: realtimeState.endTime || null,
    finished: realtimeState.finished || false,
    typedText: realtimeState.typedText || '',
    currentWordIndex: realtimeState.currentWordIndex || 0,
    typedWords: realtimeState.typedWords || [''],
  }), [realtimeState]);

  const mockDispatch = () => {}; // No-op dispatch for spectators

  const value = useMemo(() => ({
    state: mockState,
    dispatch: mockDispatch,
  }), [mockState]);

  return <TypingContext value={value}>{children}</TypingContext>;
}

// Component to display text using TextDisplay with realtime state
function SpectatorTextDisplay({ realtimeState }: { realtimeState: any }) {
  return (
    <SpectatorTypingProvider realtimeState={realtimeState}>
      <TextDisplay />
    </SpectatorTypingProvider>
  );
}

export default function SpectatorView({
  sessionId,
  userId,
  sessionName,
}: SpectatorViewProps) {
  const { realtimeState, isConnected, connectionError } = useRealtimeTyping({
    roomId: sessionId,
    role: 'spectator',
    userId,
    sessionName,
    enabled: true,
  });

  return (
    <SpectatorViewContent
      sessionId={sessionId}
      userId={userId}
      sessionName={sessionName}
      realtimeState={realtimeState}
      isConnected={isConnected}
      connectionError={connectionError}
    />
  );
}

type SpectatorViewContentProps = SpectatorViewProps & {
  realtimeState: any;
  isConnected: boolean;
  connectionError: string | null;
};

function SpectatorViewContent({
  realtimeState,
  isConnected,
  connectionError,
}: SpectatorViewContentProps) {
  // Use state for current time to trigger recalculation
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time for active sessions
  useEffect(() => {
    if (realtimeState.startTime && !realtimeState.finished) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);
      return () => clearInterval(interval);
    }
  }, [realtimeState.startTime, realtimeState.finished]);

  // Calculate stats directly from realtime state (no context dependency)
  const stats = useMemo(
    function calculateStats() {
      let elapsedTime = 0;

      if (realtimeState.startTime) {
        if (realtimeState.finished && realtimeState.endTime) {
          // For finished tests, use the stored end time
          elapsedTime = realtimeState.endTime - realtimeState.startTime;
        }
        else {
          // For active tests, calculate current elapsed time
          elapsedTime = currentTime - realtimeState.startTime;
        }
      }

      return {
        wpm: calcWPM(realtimeState.currentIndex, elapsedTime),
        accuracy: calcAccuracy(
          realtimeState.errors.size,
          realtimeState.currentIndex,
        ),
        elapsedTime,
        errorCount: realtimeState.errors.size,
        charactersTyped: realtimeState.currentIndex,
      };
    },
    [realtimeState, currentTime],
  );

  if (connectionError) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h1>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Connecting to Session...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!realtimeState.sourceText) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 dark:border-white/10 -mx-6 -mt-6 mb-6">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Eye size={24} />
                {realtimeState.sessionName || 'Spectator Mode'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Waiting for the typing session to begin
              </p>
            </div>
            <div className="mt-4 ml-4 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-green-700">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 pb-12">
          <h3 className="text-sm font-semibold text-blue-800 mb-4">Session Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {/* Connection Event */}
              <li>
                <div className="relative pb-8">
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-blue-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex size-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
                        <Icons.Check className="size-5 text-green-600" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          Connected to session
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>Just now</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Viewer Count Event */}
              <li>
                <div className="relative pb-8">
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-blue-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                        <Icons.Person className="size-5 text-blue-600" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          {realtimeState.spectatorCount}
                          {' '}
                          {realtimeState.spectatorCount === 1 ? 'viewer' : 'viewers'}
                          {' '}
                          watching
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>Now</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Waiting Status */}
              <li>
                <div className="relative pb-0">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex size-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                        <Icons.Timer className="size-5 text-gray-600 animate-pulse" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          Waiting for typist to start...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            The session will begin when the typist starts typing. You'll see their progress in real-time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Icons.Eye size={28} />
          {realtimeState.sessionName || 'Spectator Mode'}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Live Session</span>
          </div>
          <span>•</span>
          <span>
            {realtimeState.spectatorCount}
            {' '}
            viewers
          </span>
          {realtimeState.typistId && (
            <>
              <span>•</span>
              <span>
                Typist:
                {realtimeState.typistId}
              </span>
            </>
          )}
          {realtimeState.sessionName && (
            <>
              <span>•</span>
              <span>
                Session:
                {realtimeState.sessionName}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round(
                (realtimeState.currentIndex / realtimeState.sourceText.length)
                * 100,
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                realtimeState.finished ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.max((realtimeState.currentIndex / realtimeState.sourceText.length) * 100, 0)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Feedback for Spectator */}
      {realtimeState.errors && realtimeState.errors.size > 0 && realtimeState.typedWords && (
        <div className="mb-6">
          <details className="w-full bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <summary className="flex items-center gap-3 cursor-pointer list-none">
              <div className="shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-red-800">
                Display Errors (
                {realtimeState.errors.size}
                )
              </span>
            </summary>
            <div className="mt-3 ml-8">
              <div className="text-sm bg-white rounded px-3 py-2 border border-red-100 flex items-center gap-2 flex-wrap">
                {Array.from(realtimeState.errors as unknown as number[]).map((wordIndex) => {
                  const sourceWords = realtimeState.sourceText.split(' ');
                  const expectedWord = sourceWords[wordIndex] || '';
                  const typedWord = realtimeState.typedWords[wordIndex] || '';

                  if (!typedWord)
                    return null;

                  return (
                    <span
                      key={wordIndex}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="text-gray-600 font-medium">
                        Word
                        {wordIndex + 1}
                        :
                      </span>
                      <span className="line-through text-red-600 font-mono bg-red-100 px-2 py-0.5 rounded">
                        {typedWord}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-mono bg-green-100 px-2 py-0.5 rounded">
                        {expectedWord}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Display */}
        <div className="lg:col-span-2">
          <SpectatorTextDisplay realtimeState={realtimeState} />

          {/* Keyboard Display */}
          {!realtimeState.finished && realtimeState.startTime && (
            <div className="mt-4 bg-white rounded-lg border-2 border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Current Key Being Typed
              </h3>
              <KeyboardDisplay
                currentChar={realtimeState.sourceText[realtimeState.currentIndex] || ''}
              />
            </div>
          )}

          {realtimeState.finished && (
            <div className="mt-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center justify-center gap-2">
                  <Icons.Celebrate size={24} />
                  Session Complete!
                </h3>
                <p className="text-green-600">
                  The typist has finished this session.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Icons.Stats size={24} />
              Live Stats
            </h2>
            <div className="space-y-3">
              <StatCard
                label="Words Per Minute"
                value={stats.wpm}
                unit="WPM"
                icon="Lightning"
                color="blue"
              />
              <StatCard
                label="Accuracy"
                value={stats.accuracy}
                unit="%"
                icon="Target"
                color={
                  stats.accuracy >= 95
                    ? 'green'
                    : stats.accuracy >= 85
                      ? 'yellow'
                      : 'red'
                }
              />
              <StatCard
                label="Time Elapsed"
                value={formatTime(stats.elapsedTime)}
                icon="Timer"
                color="blue"
              />
              <StatCard
                label="Errors Made"
                value={stats.errorCount}
                icon="Close"
                color={
                  stats.errorCount === 0
                    ? 'green'
                    : stats.errorCount <= 5
                      ? 'yellow'
                      : 'red'
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          You are viewing this session in real-time. The typist's progress
          updates live!
        </p>
      </div>
    </div>
  );
}

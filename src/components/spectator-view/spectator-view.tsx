import { useEffect, useMemo, useRef } from 'react';

import { useRealtimeTyping } from '../../hooks/use-realtime-typing';
import { calcAccuracy, calcWPM, formatTime } from '../../utils/metrics';
import { StatCard } from '../stats-panel';

type SpectatorViewProps = {
  sessionId: string;
  userId?: string;
  sessionName?: string;
};

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

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to follow the current typing position
  useEffect(
    function autoScrollEffect() {
      if (!textContainerRef.current || !realtimeState.sourceText)
        return;

      const currentCharIndex = realtimeState.currentIndex;

      // Only scroll if we have a valid current index
      if (
        currentCharIndex >= 0
        && currentCharIndex < realtimeState.sourceText.length
      ) {
        // Find the current character element
        const currentCharElement = textContainerRef.current.querySelector(
          `[data-char-index="${currentCharIndex}"]`,
        );

        if (currentCharElement) {
          // Scroll the character into view with smooth behavior
          currentCharElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }
    },
    [realtimeState.currentIndex, realtimeState.sourceText],
  );

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
          elapsedTime = Date.now() - realtimeState.startTime;
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
    [realtimeState],
  );

  const renderText = () => {
    const words = realtimeState.sourceText.split(' ');
    let charIndex = 0;

    return words.map((word, wordIndex) => {
      const wordSpans = word.split('').map((char, charPos) => {
        const globalIndex = charIndex + charPos;
        let className = 'text-lg font-mono ';

        if (globalIndex === realtimeState.currentIndex) {
          // Current character being typed
          className += 'bg-blue-300 text-white animate-pulse';
        }
        else if (globalIndex < realtimeState.currentIndex) {
          // Already typed character
          if (realtimeState.errors.has(globalIndex)) {
            className += 'bg-red-200 text-red-800'; // Incorrect
          }
          else {
            className += 'bg-green-100 text-green-800'; // Correct
          }
        }
        else {
          // Not yet typed
          className += 'text-gray-600';
        }

        return (
          <span
            key={globalIndex}
            className={className}
            data-char-index={globalIndex}
          >
            {char}
          </span>
        );
      });

      charIndex = charIndex + word.length + 1; // +1 for the space

      return (
        <span key={wordIndex} className="whitespace-nowrap">
          {wordSpans}
          {wordIndex < words.length - 1 && <span className="text-lg font-mono"> </span>}
        </span>
      );
    });
  };

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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            👀 Spectator Mode
          </h1>
          <p className="text-gray-600 mb-4">
            Waiting for the typing session to begin...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>
              Connected •
              {realtimeState.spectatorCount}
              {' '}
              viewers
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {realtimeState.sessionName || '👀 Spectator Mode'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Display */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-200">
            <div
              ref={textContainerRef}
              className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] break-all leading-relaxed overflow-y-auto"
            >
              {renderText()}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                Progress:
                {' '}
                {realtimeState.currentIndex}
                {' '}
                /
                {' '}
                {realtimeState.sourceText.length}
                {' '}
                characters
              </span>
            </div>
          </div>

          {realtimeState.finished && (
            <div className="mt-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Session Complete!
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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              📊 Live Stats
            </h2>
            <div className="space-y-3">
              <StatCard
                label="Words Per Minute"
                value={stats.wpm}
                unit="WPM"
                icon="⚡"
                color="blue"
              />
              <StatCard
                label="Accuracy"
                value={stats.accuracy}
                unit="%"
                icon="🎯"
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
                icon="⏱️"
                color="blue"
              />
              <StatCard
                label="Errors Made"
                value={stats.errorCount}
                icon="❌"
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

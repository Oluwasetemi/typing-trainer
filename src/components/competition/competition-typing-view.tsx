import { useCallback, useEffect, useRef } from 'react';

import type { CompetitionSession } from '../../types/competition.types';

import { TypingProvider } from '../../context/typing-context';
import { useTyping } from '../../hooks/use-typing';
import { calcAccuracy, calcWPM } from '../../utils/metrics';
import ErrorFeedback from '../error-feedback/error-feedback';
import ProgressBar from '../progress-bar/progress-bar';
import StatsPanel from '../stats-panel/stats-panel';
import TextDisplay from '../text-display/text-display';
import TypingInput from '../typing-input/typing-input';
import LiveLeaderboard from './live-leaderboard';

type CompetitionTypingViewProps = {
  session: CompetitionSession;
  leaderboard: any[];
  onTypingUpdate: (stats: any) => void;
  onFinish: (finalStats: any) => void;
};

export default function CompetitionTypingView(
  props: CompetitionTypingViewProps,
) {
  return (
    <TypingProvider initialText={props.session.sourceText}>
      <CompetitionTypingContent {...props} />
    </TypingProvider>
  );
}

function CompetitionTypingContent({
  session,
  leaderboard,
  onTypingUpdate,
  onFinish,
}: CompetitionTypingViewProps) {
  const { state } = useTyping();
  const lastUpdateRef = useRef<number>(0);
  const hasFinishedRef = useRef(false);

  // Initialize lastUpdateRef on mount
  useEffect(() => {
    lastUpdateRef.current = Date.now();
  }, []);

  // Throttled stats update
  const sendStatsUpdate = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 500) {
      // Throttle to 500ms
      return;
    }

    if (!state.startTime)
      return;

    lastUpdateRef.current = now;
    const elapsedTime = now - state.startTime;
    const progress
      = (state.currentIndex / state.sourceText.length) * 100;

    onTypingUpdate({
      currentIndex: state.currentIndex,
      errors: state.errors.size,
      wpm: calcWPM(state.currentIndex, elapsedTime),
      accuracy: calcAccuracy(state.errors.size, state.currentIndex),
      progress,
    });
  }, [state, onTypingUpdate]);

  // Send updates periodically while typing
  useEffect(() => {
    if (!state.startTime || state.finished)
      return;

    sendStatsUpdate();

    const interval = setInterval(sendStatsUpdate, 500);
    return () => clearInterval(interval);
  }, [state.startTime, state.finished, sendStatsUpdate]);

  // Handle finish
  useEffect(() => {
    if (state.finished && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      const elapsedTime = state.endTime! - state.startTime!;

      onFinish({
        wpm: calcWPM(state.currentIndex, elapsedTime),
        accuracy: calcAccuracy(state.errors.size, state.currentIndex),
        progress: 100,
        currentIndex: state.currentIndex,
        errors: state.errors.size,
        finished: true,
        finishTime: elapsedTime,
      });
    }
  }, [state.finished, state.endTime, state.startTime, state.currentIndex, state.errors.size, onFinish]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            🏁
            {' '}
            {session.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Type as fast and accurately as you can!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Typing Area (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
              <ProgressBar />
            </div>

            {/* Error Feedback */}
            <ErrorFeedback />

            {/* Typing Area */}
            <main className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <div className="space-y-4">
                <TextDisplay />
                <TypingInput />
              </div>
            </main>

            {/* Personal Stats */}
            <StatsPanel />
          </div>

          {/* Live Leaderboard (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <LiveLeaderboard
              leaderboard={leaderboard}
              isCompetitionActive={session.state === 'active'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

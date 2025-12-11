import { TypingProvider } from '../context/typing-context';
import ErrorFeedback from './error-feedback/error-feedback';
import ProgressBar from './progress-bar/progress-bar';
import StatsPanel from './stats-panel/stats-panel';
import TextDisplay from './text-display/text-display';
import TypingInput from './typing-input/typing-input';

export default function TypingTrainer() {
  return (
    <TypingProvider>
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Typing Speed Trainer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Test your typing speed and accuracy</p>
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
      </div>
    </TypingProvider>
  );
}

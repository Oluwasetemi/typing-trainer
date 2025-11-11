import { useTyping } from '../../hooks/use-typing';
import { useTypingStats } from '../../hooks/use-typing-stats';
import { formatTime } from '../../utils/metrics';
import { Icons } from '../../utils/icons';
import StatCard from './stat-card';

export default function StatsPanel() {
  const { state } = useTyping();
  const stats = useTypingStats();

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Icons.Stats size={24} />
        Statistics
      </h2>

      <div className="space-y-4">
        {/* WPM */}
        <StatCard
          label="Words Per Minute"
          value={stats.wpm}
          unit="WPM"
          icon="Lightning"
          color="blue"
        />

        {/* Accuracy */}
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

        {/* Time */}
        <StatCard
          label="Time Elapsed"
          value={formatTime(stats.elapsedTime)}
          icon="Timer"
          color="blue"
        />

        {/* Characters */}
        <StatCard
          label="Characters Typed"
          value={`${stats.charactersTyped}/${state.sourceText.length}`}
          icon="FileText"
          color="blue"
        />

        {/* Errors */}
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

      {/* Performance feedback */}
      {state.finished && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Icons.Stats size={20} />
            Performance
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            {stats.wpm >= 40 && (
              <p className="text-green-600 flex items-center gap-2">
                <Icons.Rocket size={16} />
                Excellent typing speed!
              </p>
            )}
            {stats.wpm >= 20 && stats.wpm < 40 && (
              <p className="text-blue-600 flex items-center gap-2">
                <Icons.ThumbUp size={16} />
                Good typing speed!
              </p>
            )}
            {stats.wpm < 20 && (
              <p className="text-yellow-600 flex items-center gap-2">
                <Icons.Muscle size={16} />
                Keep practicing to improve speed!
              </p>
            )}
            {stats.accuracy >= 95 && (
              <p className="text-green-600 flex items-center gap-2">
                <Icons.Target size={16} />
                Outstanding accuracy!
              </p>
            )}
            {stats.accuracy >= 85 && stats.accuracy < 95 && (
              <p className="text-blue-600 flex items-center gap-2">
                <Icons.ThumbUp size={16} />
                Good accuracy!
              </p>
            )}
            {stats.accuracy < 85 && (
              <p className="text-yellow-600 flex items-center gap-2">
                <Icons.Dice size={16} />
                Focus on accuracy over speed!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

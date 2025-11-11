import { useTyping } from '../../hooks/use-typing';
import { Icons } from '../../utils/icons';

export default function ProgressBar() {
  const { state } = useTyping();
  const progress = (state.currentIndex / state.sourceText.length) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">
          {Math.round(progress)}
          %
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-300 ease-out
            ${
    state.finished
      ? 'bg-green-500'
      : progress > 0
        ? 'bg-blue-500'
        : 'bg-gray-300'
    }
          `}
          style={{ width: `${Math.max(progress, 0)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Typing progress: ${Math.round(progress)}% complete`}
        >
          {/* Animated stripes for active progress */}
          {progress > 0 && !state.finished && (
            <div
              className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
              style={{
                backgroundSize: '20px 20px',
              }}
            />
          )}
        </div>
      </div>

      {/* Text summary */}
      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
        <span>
          {state.currentIndex}
          {' '}
          /
          {state.sourceText.length}
          {' '}
          characters
        </span>
        {state.finished && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Icons.Check size={16} />
            Complete!
          </span>
        )}
      </div>
    </div>
  );
}

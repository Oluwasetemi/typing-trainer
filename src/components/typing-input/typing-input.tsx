import { useEffect, useRef, useState } from 'react';

import { useTyping } from '../../hooks/use-typing';
import ConfirmModal from '../common/confirm-modal';
import KeyboardDisplay from '../keyboard-display/keyboard-display';

export default function TypingInput() {
  const { state, dispatch } = useTyping();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Auto-focus the input when component mounts and when reset
  useEffect(
    function autoFocusEffect() {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [state.sourceText],
  ); // Re-focus when text changes (reset)

  // Keep input focused and prevent global keystrokes
  useEffect(
    function handleFocusEffect() {
      const handleFocus = () => {
        if (inputRef.current && !state.finished) {
          inputRef.current.focus();
        }
      };

      const handleGlobalKeyDown = (event: KeyboardEvent) => {
        // Only prevent global keystrokes when typing is active and not finished
        if (!state.finished && state.startTime) {
          // Don't interfere with the typing input field
          if (event.target === inputRef.current) {
            return;
          }

          // Allow only specific keys globally
          const allowedKeys = ['Tab', 'Escape'];
          if (!allowedKeys.includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      };

      document.addEventListener('click', handleFocus);
      document.addEventListener('keydown', handleGlobalKeyDown, true); // Use capture phase

      return () => {
        document.removeEventListener('click', handleFocus);
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
      };
    },
    [state.finished, state.startTime],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent all default behavior and stop propagation
    // event.preventDefault()
    event.stopPropagation();

    // Handle backspace
    if (event.key === 'Backspace') {
      dispatch({ type: 'BACKSPACE' });
      return;
    }

    // Handle printable characters only (including space)
    if (event.key.length === 1) {
      dispatch({ type: 'TYPE_CHAR', char: event.key });
    }

    // Block all other keys including:
    // - Navigation keys (arrows, page up/down, home, end)
    // - Function keys (F1-F12)
    // - Modifier combinations (Ctrl+, Alt+, Cmd+)
    // - Special keys (Enter, Tab, Escape, etc.)
    // - Browser shortcuts (Ctrl+R, Ctrl+F, etc.)
  };

  const handleReset = () => {
    // Show confirmation if user has made progress
    if (state.currentIndex > 0 && !state.finished) {
      setShowResetModal(true);
    }
    else {
      dispatch({ type: 'RESET' });
    }
  };

  const confirmReset = () => {
    dispatch({ type: 'RESET' });
    setShowResetModal(false);
  };

  // const ref = useCallback((node: HTMLInputElement | null) => {
  //   node?.focus()
  // }, [])

  return (
    <div className="space-y-4 focus-within:rounded-lg focus-within:ring-1 focus-within:ring-amber-300 focus-within:ring-offset-1">
      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value="" // Always empty to prevent visible text
        onChange={() => {}} // Controlled by onKeyDown
        onKeyDown={handleKeyDown}
        className="sr-only" // Screen reader only
        aria-label="Type the text shown above. Your input will be captured as you type."
        disabled={state.finished}
      />

      {/* Visual typing area */}
      <div
        className={`
          min-h-[100px] p-4 border-2 rounded-lg bg-white dark:bg-zinc-800 cursor-text
          ${
    state.finished
      ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-gray-300 dark:border-zinc-600 focus-within:border-blue-400 dark:focus-within:border-blue-500'
    }
          transition-colors
        `}
        onClick={() => inputRef.current?.focus()}
        role="textbox"
        aria-label="Click here to start typing"
      >
        {!state.startTime && !state.finished && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-lg mb-2">👆 Click here and start typing!</p>
            <p className="text-sm mb-6">
              The text above will be highlighted as you type.
            </p>
            <KeyboardDisplay
              currentChar={state.sourceText[state.currentIndex] || ''}
            />
          </div>
        )}

        {state.startTime && !state.finished && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p className="text-lg mb-2">⌨️ Keep typing...</p>
            <p className="text-sm mb-6">Your progress is being tracked above.</p>
            <KeyboardDisplay
              currentChar={state.sourceText[state.currentIndex] || ''}
            />
          </div>
        )}

        {state.finished && (
          <div className="text-center text-green-700 dark:text-green-400 py-8">
            <p className="text-xl mb-2">🎉 Great job!</p>
            <p className="text-sm mb-4">
              You've completed the typing test. Check your stats!
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Start a new typing test"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Reset button - always visible */}
      {!state.finished && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            aria-label="Reset and start over with new text"
          >
            Reset & Get New Text
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset Typing Test?"
        message="You have made progress on this test. Are you sure you want to reset and start over with a new text?"
        onConfirm={confirmReset}
        onCancel={() => setShowResetModal(false)}
        confirmText="Reset"
        cancelText="Keep Going"
      />
    </div>
  );
}

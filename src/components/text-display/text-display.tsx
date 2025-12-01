import { useEffect, useRef } from 'react';

import { useTyping } from '../../hooks/use-typing';

export default function TextDisplay() {
  const { state } = useTyping();
  const { sourceText, currentIndex, errors, currentWordIndex, finished, typedWords } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current character visible
  useEffect(
    function autoScroll() {
      if (containerRef.current && currentIndex > 0) {
        const container = containerRef.current;
        const currentCharElement = container.children[
          currentIndex
        ] as HTMLElement;

        if (currentCharElement) {
          const containerRect = container.getBoundingClientRect();
          const charRect = currentCharElement.getBoundingClientRect();

          // Check if current character is outside the visible area
          const isOutOfView
            = charRect.left < containerRect.left
              || charRect.right > containerRect.right
              || charRect.top < containerRect.top
              || charRect.bottom > containerRect.bottom;

          if (isOutOfView) {
            // Scroll the character into view
            currentCharElement.scrollIntoView({
              behavior: 'instant',
              block: 'nearest',
              inline: 'center',
            });
          }
        }
      }
    },
    [currentIndex],
  );

  // Reset scroll position when typing is finished
  useEffect(
    function resetScroll() {
      if (state.finished && containerRef.current) {
        containerRef.current.scrollTo({
          top: -10,
          left: 0,
          behavior: 'instant',
        });
      }
    },
    [state.finished],
  );

  const renderText = () => {
    const words = sourceText.split(' ');
    let charIndex = 0;

    return words.map((word, wordIndex) => {
      const wordStartIndex = charIndex;
      const wordEndIndex = charIndex + word.length;

      // Determine word status
      let wordClassName = 'text-xl font-mono inline-block mr-[0.5ch] px-1 rounded transition-colors ';

      // Check if this word has been typed (not empty)
      const wordTyped = typedWords[wordIndex] && typedWords[wordIndex].length > 0;
      const isCompleted = wordIndex < currentWordIndex || (finished && wordIndex === currentWordIndex);

      if (isCompleted && wordTyped) {
        // Word has been completed AND typed
        if (errors.has(wordIndex)) {
          // Entire word is incorrect
          wordClassName += 'bg-red-300 dark:bg-red-900/50 text-red-900 dark:text-red-200';
        }
        else {
          // Entire word is correct
          wordClassName += 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-200';
        }
      }
      else if (wordIndex === currentWordIndex && !finished) {
        // Currently typing this word - show it in gray/neutral color
        wordClassName += 'bg-blue-100 dark:bg-blue-900/50 text-gray-900 dark:text-gray-100';
      }
      else {
        // Not yet typed
        wordClassName += 'text-gray-600 dark:text-gray-400';
      }

      // Render individual characters within the word for cursor positioning
      const wordSpans = word.split('').map((char, charPos) => {
        const globalIndex = wordStartIndex + charPos;
        let charClassName = '';

        // Highlight all characters in the current word with cursor
        if (wordIndex === currentWordIndex && !finished) {
          charClassName = 'border-b-4 border-blue-600 dark:border-blue-400 animate-pulse';
        }

        return (
          <span
            key={globalIndex}
            className={charClassName}
            aria-label={
              globalIndex === currentIndex ? `Current character: ${char}` : undefined
            }
          >
            {char}
          </span>
        );
      });

      charIndex = wordEndIndex + 1; // +1 for the space

      return (
        <span
          key={crypto.randomUUID()}
          className={wordClassName}
          aria-label={wordIndex === currentWordIndex ? `Currently typing: ${word}` : undefined}
        >
          {wordSpans}
        </span>
      );
    });
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg border-2 border-gray-200 dark:border-zinc-700 focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
      <div
        ref={containerRef}
        className="notranslate h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] break-words leading-relaxed select-none overflow-auto"
        aria-live="polite"
        aria-label="Typing practice text"
        role="textbox"
        aria-readonly="true"
      >
        {renderText()}
      </div>
    </div>
  );
}

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
      let wordClassName = 'text-lg font-mono inline-block mr-[0.5ch] px-1 rounded transition-colors ';

      // Check if this word has been typed (not empty)
      const wordTyped = typedWords[wordIndex] && typedWords[wordIndex].length > 0;
      const isCompleted = wordIndex < currentWordIndex || (finished && wordIndex === currentWordIndex);

      if (isCompleted && wordTyped) {
        // Word has been completed AND typed
        if (errors.has(wordIndex)) {
          // Entire word is incorrect
          wordClassName += 'bg-red-200 text-red-800';
        } else {
          // Entire word is correct
          wordClassName += 'bg-green-100 text-green-800';
        }
      } else if (wordIndex === currentWordIndex && !finished) {
        // Currently typing this word - show it in gray/neutral color
        wordClassName += 'bg-blue-50 text-gray-800';
      } else {
        // Not yet typed
        wordClassName += 'text-gray-600';
      }

      // Render individual characters within the word for cursor positioning
      const wordSpans = word.split('').map((char, charPos) => {
        const globalIndex = wordStartIndex + charPos;
        let charClassName = '';

        // Highlight current character with cursor
        if (globalIndex === currentIndex) {
          charClassName = 'border-b-2 border-blue-500 animate-pulse';
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
          key={wordIndex}
          className={wordClassName}
          aria-label={wordIndex === currentWordIndex ? `Currently typing: ${word}` : undefined}
        >
          {wordSpans}
        </span>
      );
    });
  };

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg border-2 focus-within:border-blue-400 transition-colors">
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

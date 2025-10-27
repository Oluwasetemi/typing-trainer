import { useEffect, useRef } from 'react';

import { useTyping } from '../../hooks/use-typing';

export default function TextDisplay() {
  const { state } = useTyping();
  const { sourceText, currentIndex, errors } = state;
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
      const wordEndIndex = charIndex + word.length;

      const wordSpans = word.split('').map((char, charPos) => {
        const globalIndex = charIndex + charPos;
        let className = 'text-lg font-mono ';

        if (globalIndex === currentIndex) {
          // Current character to type
          className += 'bg-blue-300 text-white animate-pulse';
        }
        else if (globalIndex < currentIndex) {
          // Already typed character
          if (errors.has(globalIndex)) {
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
        <span key={wordIndex} className="inline-block mr-[0.5ch]">
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

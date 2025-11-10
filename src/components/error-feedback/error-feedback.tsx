import { useTyping } from '../../hooks/use-typing';

export default function ErrorFeedback() {
  const { state } = useTyping();
  const { sourceText, errors, typedWords } = state;

  // Don't show anything if no errors
  if (errors.size === 0) {
    return null;
  }

  const sourceWords = sourceText.split(' ');
  const errorDetails = Array.from(errors)
    .filter((wordIndex) => {
      // Only show errors for words that have been typed (not empty)
      const typedWord = typedWords[wordIndex] || '';
      return typedWord.length > 0;
    })
    .map((wordIndex) => {
      const expectedWord = sourceWords[wordIndex] || '';
      const typedWord = typedWords[wordIndex] || '';
      return {
        wordIndex,
        expectedWord,
        typedWord,
      };
    });

  // Don't show component if no actual errors (after filtering empty words)
  if (errorDetails.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-red-50 border-2 border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5"
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
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            {errorDetails.length} {errorDetails.length === 1 ? 'Error' : 'Errors'} Detected
          </h3>
          <div className="space-y-2">
            {errorDetails.map(({ wordIndex, expectedWord, typedWord }) => (
              <div
                key={wordIndex}
                className="text-sm bg-white rounded px-3 py-2 border border-red-100"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-600 font-medium">Word {wordIndex + 1}:</span>
                  <span className="line-through text-red-600 font-mono bg-red-100 px-2 py-0.5 rounded">
                    {typedWord}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-700 font-mono bg-green-100 px-2 py-0.5 rounded">
                    {expectedWord}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

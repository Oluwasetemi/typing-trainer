/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';

import { createContext, useMemo, useReducer } from 'react';

import { getRandomText } from '../utils/texts';

export type TypingState = {
  sourceText: string;
  currentIndex: number;
  errors: Set<number>; // Now stores word indices instead of character indices
  startTime: number | null;
  endTime: number | null;
  finished: boolean;
  typedText: string;
  currentWordIndex: number; // Track which word user is currently typing
  typedWords: string[]; // Array of typed words (updated in real-time as user types)
};

export type TypingAction
  = | { type: 'TYPE_CHAR'; char: string }
    | { type: 'BACKSPACE' }
    | { type: 'RESET' }
    | { type: 'START_TIMER' }
    | { type: 'FINISH' };

const initialState: TypingState = {
  sourceText: getRandomText(),
  currentIndex: 0,
  errors: new Set(),
  startTime: null,
  endTime: null,
  finished: false,
  typedText: '',
  currentWordIndex: 0,
  typedWords: [''], // Start with one empty word
};

function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        startTime: Date.now(),
      };

    case 'TYPE_CHAR': {
      if (state.finished)
        return state;

      // Split source text into words
      const sourceWords = state.sourceText.split(' ');

      // Handle space key - skip to next word
      if (action.char === ' ') {
        // Calculate the next word's starting position
        let nextWordStartIndex = 0;
        for (let i = 0; i <= state.currentWordIndex; i++) {
          if (i < state.currentWordIndex) {
            nextWordStartIndex += sourceWords[i].length + 1; // +1 for space
          }
          else if (i === state.currentWordIndex) {
            nextWordStartIndex += sourceWords[i].length + 1; // Skip current word and space
          }
        }

        // Update typed words array
        const newTypedWords = [...state.typedWords];
        const currentTypedWordIndex = newTypedWords.length - 1;
        const currentWord = newTypedWords[currentTypedWordIndex];

        // Only advance if current word has content
        if (currentWord.length > 0) {
          newTypedWords.push(''); // Start new empty word

          // Validate the word we're leaving
          const expectedWord = sourceWords[state.currentWordIndex] || '';
          const newErrors = new Set(state.errors);

          if (currentWord !== expectedWord) {
            newErrors.add(state.currentWordIndex);
          }
          else {
            newErrors.delete(state.currentWordIndex);
          }

          const newWordIndex = state.currentWordIndex + 1;
          const isFinished = newWordIndex >= sourceWords.length;

          return {
            ...state,
            currentIndex: nextWordStartIndex,
            currentWordIndex: newWordIndex,
            errors: newErrors,
            typedText: state.sourceText.slice(0, nextWordStartIndex),
            typedWords: newTypedWords,
            finished: isFinished,
            startTime: state.startTime || Date.now(),
            endTime: isFinished ? Date.now() : null,
          };
        }

        // If current word is empty, ignore the space
        return state;
      }

      // Regular character typing
      const newTypedText = state.typedText + action.char;
      const newIndex = state.currentIndex + 1;
      const isFinished = newIndex >= state.sourceText.length;

      // Update typed words array
      const newTypedWords = [...state.typedWords];
      const currentTypedWordIndex = newTypedWords.length - 1;

      // Check if we're finishing a word (at the last character)
      const finishingWord = isFinished;
      const wordIndexToValidate = currentTypedWordIndex;

      // Add character to current word
      newTypedWords[currentTypedWordIndex] += action.char;

      // Calculate which source word we're on
      const currentSourceWordIndex = state.currentWordIndex;

      // Word boundary validation - validate when space is typed or text is finished
      const newErrors = new Set(state.errors);

      if (finishingWord) {
        // Get the word that was just completed (BEFORE we added the space/new word)
        const completedTypedWord = state.typedWords[wordIndexToValidate] + (action.char === ' ' ? '' : action.char);
        const expectedWord = sourceWords[wordIndexToValidate] || '';

        // Only validate if the word has content (not empty)
        if (completedTypedWord.length > 0) {
          // Compare the completed word with the expected word
          if (completedTypedWord !== expectedWord) {
            newErrors.add(wordIndexToValidate); // Store word index as error
          }
          else {
            // Remove error if word was corrected
            newErrors.delete(wordIndexToValidate);
          }
        }
      }

      return {
        ...state,
        currentIndex: newIndex,
        currentWordIndex: currentSourceWordIndex,
        errors: newErrors,
        typedText: newTypedText,
        typedWords: newTypedWords,
        finished: isFinished,
        startTime: state.startTime || Date.now(),
        endTime: isFinished ? Date.now() : null,
      };
    }

    case 'BACKSPACE': {
      if (state.currentIndex === 0 || state.typedText.length === 0)
        return state;

      const prevIndex = state.currentIndex - 1;
      const newTypedText = state.typedText.slice(0, -1);
      const lastChar = state.typedText[state.typedText.length - 1];

      // Update typed words array
      const newTypedWords = [...state.typedWords];
      const currentTypedWordIndex = newTypedWords.length - 1;

      if (lastChar === ' ') {
        // Removing a space - go back to previous word
        // Only pop if we have more than one word and the last word is empty
        if (newTypedWords.length > 1 && newTypedWords[currentTypedWordIndex] === '') {
          newTypedWords.pop(); // Remove the empty word
        }
        // If the last word is not empty, we typed multiple spaces and ignored them,
        // so don't pop anything
      }
      else {
        // Remove last character from current word
        // Safety check: ensure the word exists and is a string
        if (newTypedWords[currentTypedWordIndex] && typeof newTypedWords[currentTypedWordIndex] === 'string') {
          newTypedWords[currentTypedWordIndex] = newTypedWords[currentTypedWordIndex].slice(0, -1);
        }
      }

      // Calculate which source word we're on
      let newWordIndex = state.currentWordIndex;
      if (lastChar === ' ' && newWordIndex > 0) {
        newWordIndex--;
      }

      // Don't automatically clear errors - they stay until word is completed correctly
      return {
        ...state,
        currentIndex: prevIndex,
        currentWordIndex: newWordIndex,
        typedText: newTypedText,
        typedWords: newTypedWords,
      };
    }

    case 'RESET':
      return {
        ...initialState,
        sourceText: getRandomText(),
      };

    case 'FINISH':
      return {
        ...state,
        finished: true,
        endTime: Date.now(),
      };

    default:
      return state;
  }
}

type TypingContextValue = {
  state: TypingState;
  dispatch: React.Dispatch<TypingAction>;
};

export const TypingContext = createContext<TypingContextValue | undefined>(
  undefined,
);

type TypingProviderProps = {
  children: ReactNode;
  initialText?: string;
};

export function TypingProvider({ children, initialText }: TypingProviderProps) {
  const [state, dispatch] = useReducer(
    typingReducer,
    initialText
      ? { ...initialState, sourceText: initialText }
      : initialState,
  );

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TypingContext value={value}>{children}</TypingContext>;
}

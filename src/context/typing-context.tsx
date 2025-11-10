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

      const newTypedText = state.typedText + action.char;
      const newIndex = state.currentIndex + 1;
      const isFinished = newIndex >= state.sourceText.length;

      // Split source text into words
      const sourceWords = state.sourceText.split(' ');

      // Update typed words array
      const newTypedWords = [...state.typedWords];
      const currentTypedWordIndex = newTypedWords.length - 1;
      const currentWord = newTypedWords[currentTypedWordIndex];

      // Check if we're finishing a word (before updating the array)
      // Only finish if current word has content
      const finishingWord = (action.char === ' ' && currentWord.length > 0) || isFinished;
      const wordIndexToValidate = currentTypedWordIndex;

      if (action.char === ' ') {
        // Only move to next word if current word has content
        // This prevents multiple spaces from creating multiple empty words
        if (currentWord.length > 0) {
          newTypedWords.push(''); // Start new empty word
        }
        // If current word is empty, just ignore the space (don't add it)
      } else {
        // Add character to current word
        newTypedWords[currentTypedWordIndex] += action.char;
      }

      // Calculate which source word we're on
      let currentSourceWordIndex = state.currentWordIndex;
      // Only move to next word if we actually created a new word (had content)
      if (action.char === ' ' && currentWord.length > 0 && currentSourceWordIndex < sourceWords.length - 1) {
        currentSourceWordIndex++;
      }
      // When finished, we're on the last word
      if (isFinished && action.char !== ' ') {
        currentSourceWordIndex = sourceWords.length - 1;
      }

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
          } else {
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
      } else {
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

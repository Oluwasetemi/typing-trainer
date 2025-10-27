/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';

import { createContext, useMemo, useReducer } from 'react';

import { getRandomText } from '../utils/texts';

export type TypingState = {
  sourceText: string;
  currentIndex: number;
  errors: Set<number>;
  startTime: number | null;
  endTime: number | null;
  finished: boolean;
  typedText: string;
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

      const expectedChar = state.sourceText[state.currentIndex];
      const newErrors = new Set(state.errors);
      const newTypedText = state.typedText + action.char;

      // Check if character is incorrect
      if (action.char !== expectedChar) {
        newErrors.add(state.currentIndex);
      }

      const newIndex = state.currentIndex + 1;
      const isFinished = newIndex >= state.sourceText.length;

      return {
        ...state,
        currentIndex: newIndex,
        errors: newErrors,
        typedText: newTypedText,
        finished: isFinished,
        startTime: state.startTime || Date.now(), // Start timer on first keypress
        endTime: isFinished ? Date.now() : null, // Capture end time when finished
      };
    }

    case 'BACKSPACE': {
      if (state.currentIndex === 0)
        return state;

      const prevIndex = state.currentIndex - 1;
      const newErrorsAfterBackspace = new Set(state.errors);
      newErrorsAfterBackspace.delete(prevIndex);

      return {
        ...state,
        currentIndex: prevIndex,
        errors: newErrorsAfterBackspace,
        typedText: state.typedText.slice(0, -1),
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

import { use } from 'react';

import { TypingContext } from '../context/typing-context';

export function useTyping() {
  const context = use(TypingContext);
  if (context === undefined) {
    throw new Error('useTyping must be used within a TypingProvider');
  }
  return context;
}

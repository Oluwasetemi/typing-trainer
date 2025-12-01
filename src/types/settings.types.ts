export type TypingMode = 'solo' | 'session' | 'competition';

export type ErrorFeedbackTiming = 'during' | 'after';

export type KeyboardLayout = 'qwerty' | 'colemak' | 'dvorak' | 'azerty' | 'abcdef';

export type SoundEffect = 'none' | 'mechanical' | 'typewriter' | 'soft';

export type ThemeMode = 'light' | 'dark' | 'system';

export type TypingSettings = {
  // Display Settings
  errorFeedback: {
    enabled: boolean;
    timing: ErrorFeedbackTiming; // Show during typing or after completion
    expandByDefault: boolean; // Start with errors expanded or collapsed
  };

  keyboard: {
    enabled: boolean;
    layout: KeyboardLayout;
    showDuringTyping: boolean; // Show keyboard while actively typing
    highlightStyle: 'full' | 'minimal'; // Full keyboard or just current key
  };

  // Text Display Settings
  textDisplay: {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highlightCurrentWord: boolean;
    showCursor: boolean;
    autoScroll: boolean;
  };

  // Progress & Stats
  progress: {
    showProgressBar: boolean;
    showLiveStats: boolean; // WPM/Accuracy during typing
    showTimer: boolean;
    showCharacterCount: boolean;
  };

  // Audio Settings
  audio: {
    enabled: boolean;
    soundEffect: SoundEffect;
    volume: number; // 0-100
    errorSound: boolean; // Play sound on error
    completionSound: boolean; // Play sound on completion
  };

  // Competition Specific
  competition: {
    showLeaderboard: boolean;
    showOpponentProgress: boolean;
    enableChat: boolean; // Future feature
    autoReadyUp: boolean; // Automatically mark as ready
  };

  // Session Specific
  session: {
    allowSpectators: boolean;
    showSpectatorCount: boolean;
    broadcastTypingSpeed: boolean; // Share real-time stats with spectators
  };

  // Typing Behavior
  behavior: {
    spaceSkipsWord: boolean; // Space key skips to next word
    strictMode: boolean; // Must correct errors before continuing
    pauseOnError: boolean; // Briefly pause when error is made
    confirmReset: boolean; // Confirm before resetting
  };

  // Accessibility
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderFriendly: boolean;
    largerClickTargets: boolean;
  };

  // Theme
  theme: ThemeMode;
};

export const DEFAULT_SETTINGS: TypingSettings = {
  errorFeedback: {
    enabled: true,
    timing: 'during',
    expandByDefault: false,
  },

  keyboard: {
    enabled: true,
    layout: 'qwerty',
    showDuringTyping: true,
    highlightStyle: 'full',
  },

  textDisplay: {
    fontSize: 'medium',
    highlightCurrentWord: true,
    showCursor: true,
    autoScroll: true,
  },

  progress: {
    showProgressBar: true,
    showLiveStats: true,
    showTimer: true,
    showCharacterCount: true,
  },

  audio: {
    enabled: false,
    soundEffect: 'none',
    volume: 50,
    errorSound: false,
    completionSound: true,
  },

  competition: {
    showLeaderboard: true,
    showOpponentProgress: true,
    enableChat: false,
    autoReadyUp: false,
  },

  session: {
    allowSpectators: true,
    showSpectatorCount: true,
    broadcastTypingSpeed: true,
  },

  behavior: {
    spaceSkipsWord: true,
    strictMode: false,
    pauseOnError: false,
    confirmReset: true,
  },

  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderFriendly: false,
    largerClickTargets: false,
  },

  theme: 'system',
};

import type { ReactNode } from 'react';

import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import type { TypingSettings } from '../types/settings.types';

import { DEFAULT_SETTINGS } from '../types/settings.types';

const STORAGE_KEY = 'typing-trainer-settings';

type SettingsContextValue = {
  settings: TypingSettings;
  updateSettings: (updates: Partial<TypingSettings>) => void;
  resetSettings: () => void;
  updateSection: <K extends keyof TypingSettings>(
    section: K,
    updates: Partial<TypingSettings[K]>,
  ) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function useSettings() {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

type SettingsProviderProps = {
  children: ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  // Load settings from localStorage on mount
  const [settings, setSettings] = useState<TypingSettings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          // Deep merge nested objects
          errorFeedback: { ...DEFAULT_SETTINGS.errorFeedback, ...parsed.errorFeedback },
          keyboard: { ...DEFAULT_SETTINGS.keyboard, ...parsed.keyboard },
          textDisplay: { ...DEFAULT_SETTINGS.textDisplay, ...parsed.textDisplay },
          progress: { ...DEFAULT_SETTINGS.progress, ...parsed.progress },
          audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
          competition: { ...DEFAULT_SETTINGS.competition, ...parsed.competition },
          session: { ...DEFAULT_SETTINGS.session, ...parsed.session },
          behavior: { ...DEFAULT_SETTINGS.behavior, ...parsed.behavior },
          accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsed.accessibility },
        };
      }
    }
    catch (error) {
      console.error('Failed to load settings:', error);
    }

    return DEFAULT_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<TypingSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const updateSection = useCallback(
    <K extends keyof TypingSettings>(
      section: K,
      updates: Partial<TypingSettings[K]>,
    ) => {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as object),
          ...(updates as object),
        },
      }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      updateSection,
      resetSettings,
    }),
    [settings, updateSettings, updateSection, resetSettings],
  );

  return (
    <SettingsContext value={value}>
      {children}
    </SettingsContext>
  );
}

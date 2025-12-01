import type { ReactNode } from 'react';
import { createContext, use, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'theme';

export const THEME_COLORS = {
  light: '#f9fafb', // Tailwind gray-50
  dark: '#101828', // Tailwind gray-900
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto') {
      return storedTheme;
    }
    return 'auto';
  } catch {
    return 'auto';
  }
}

function setStoredThemeMode(theme: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeClass(themeMode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'auto');
  const newTheme = themeMode === 'auto' ? getSystemTheme() : themeMode;
  root.classList.add(newTheme);

  if (themeMode === 'auto') {
    root.classList.add('auto');
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      newTheme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light,
    );
  }
}

function getNextTheme(current: ThemeMode): ThemeMode {
  const themes: ThemeMode[] =
    getSystemTheme() === 'dark'
      ? ['auto', 'light', 'dark']
      : ['auto', 'dark', 'light'];
  return themes[(themes.indexOf(current) + 1) % themes.length];
}

interface ThemeContextProps {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  useEffect(() => {
    // Apply theme on mount
    updateThemeClass(themeMode);

    // Listen for system theme changes when in auto mode
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateThemeClass('auto');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [themeMode]);

  const resolvedTheme = themeMode === 'auto' ? getSystemTheme() : themeMode;

  const setTheme = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    setStoredThemeMode(newTheme);
    updateThemeClass(newTheme);
  };

  const toggleMode = () => {
    setTheme(getNextTheme(themeMode));
  };

  return (
    <ThemeContext value={{ themeMode, resolvedTheme, setTheme, toggleMode }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

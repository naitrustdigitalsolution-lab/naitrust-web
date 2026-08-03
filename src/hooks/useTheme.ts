import { create } from 'zustand';
import { useEffect } from 'react';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setIsDarkMode: (dark: boolean) => void;
}

/**
 * Global theme store (zustand) so every component shares the same value.
 */
const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark',

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDarkMode;
      applyTheme(next);
      return { isDarkMode: next };
    }),

  setIsDarkMode: (dark: boolean) =>
    set(() => {
      applyTheme(dark);
      return { isDarkMode: dark };
    }),
}));

/** Side-effect: sync DOM class + localStorage */
function applyTheme(dark: boolean) {
  const root = document.documentElement;
  const darkModeAllowed = window.location.pathname.startsWith('/app');
  if (dark && darkModeAllowed) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Preserve the user's dashboard preference even while public pages are
  // deliberately rendered in light mode.
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

/**
 * Hook consumed by components.
 * Applies the theme class on first mount (SSR-safe).
 */
export function useTheme() {
  const { isDarkMode, toggleTheme, setIsDarkMode } = useThemeStore();

  // Ensure DOM is in sync on mount (e.g. after hard refresh)
  useEffect(() => {
    applyTheme(isDarkMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isDarkMode, toggleTheme, setIsDarkMode } as const;
}

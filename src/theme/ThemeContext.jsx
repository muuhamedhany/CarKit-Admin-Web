import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'carkit_admin_theme';
const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readInitialTheme = () => {
  if (typeof window === 'undefined') return { theme: 'dark', source: 'system' };
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return { theme: saved, source: 'saved' };
  }
  return { theme: getSystemTheme(), source: 'system' };
};

export function ThemeProvider({ children }) {
  const [{ theme, source }, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (source !== 'system') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setThemeState((current) => {
        if (current.source !== 'system') return current;
        return { theme: media.matches ? 'dark' : 'light', source: 'system' };
      });
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [source]);

  const value = useMemo(
    () => ({
      theme,
      setTheme(nextTheme) {
        if (nextTheme !== 'light' && nextTheme !== 'dark') return;
        window.localStorage.setItem(THEME_KEY, nextTheme);
        setThemeState({ theme: nextTheme, source: 'saved' });
      },
      toggleTheme() {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        window.localStorage.setItem(THEME_KEY, nextTheme);
        setThemeState({ theme: nextTheme, source: 'saved' });
      },
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

import { createContext, useContext, ReactNode } from 'react';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider');
  return ctx;
}

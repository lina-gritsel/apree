import { useMemo, useState } from 'react';
import { makeTheme } from './theme';
export function useColorMode() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('forma-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const toggle = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try {
      localStorage.setItem('forma-theme', next);
    } catch {
      /* Theme remains usable without storage. */
    }
  };
  return { mode, theme, toggle };
}

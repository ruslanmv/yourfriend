import { useEffect, useMemo, useState } from 'react';
import type { Theme, ThemePreference } from '../types';

const STORAGE_KEY = 'yourfriend-theme';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return stored || 'system';
  });
  const [system, setSystem] = useState<Theme>(() => systemTheme());
  const theme = useMemo<Theme>(() => (preference === 'system' ? system : preference), [preference, system]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, preference);
  }, [theme, preference]);

  return { theme, preference, setPreference };
}

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nika:theme';
const META_COLORS: Record<Theme, string> = { light: '#FFFFFF', dark: '#0B0B0B' };
const listeners = new Set<() => void>();

/**
 * O tema vive no atributo data-theme do <html>.
 * O script inline do index.html já aplica o tema salvo antes do React carregar (sem "piscar").
 * Padrão: claro (cores da marca). O escuro só entra se o visitante escolher.
 */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage bloqueado: vale só nesta visita */
  }
  listeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    getTheme,
    () => 'light' as Theme,
  );
  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}

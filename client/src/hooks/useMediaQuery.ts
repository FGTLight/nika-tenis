import { useSyncExternalStore } from 'react';

/** Assina uma media query e re-renderiza quando ela muda. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Dispositivo com mouse de verdade (desktop) — usado para cursor custom e efeito tilt. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

/** Breakpoint md do Tailwind */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');

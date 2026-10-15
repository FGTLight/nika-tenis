import { useMediaQuery } from './useMediaQuery';

/**
 * true quando o usuário pediu menos movimento no sistema (prefers-reduced-motion).
 * Todos os componentes animados consultam este hook para desligar/encurtar efeitos.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

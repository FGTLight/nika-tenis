import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

/**
 * Scroll suave com Lenis, sincronizado com o GSAP ScrollTrigger:
 * o ticker do GSAP move o Lenis e cada scroll do Lenis atualiza os triggers.
 * Com prefers-reduced-motion o Lenis nem é criado (scroll nativo).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({ duration: 1.15, smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/** Rola até um seletor/elemento usando o Lenis (ou scroll nativo como fallback). */
export function useScrollTo() {
  const lenis = useContext(LenisContext);
  return (target: string | HTMLElement, offset = -80) => {
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
  };
}

/** Pausa o scroll da página (ex.: com modal aberto). */
export function useLockScroll(locked: boolean) {
  const lenis = useContext(LenisContext);
  useEffect(() => {
    if (!locked) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [locked, lenis]);
}

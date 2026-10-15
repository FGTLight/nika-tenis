import { motion } from 'framer-motion';
import { useEffect } from 'react';

/** Traços das letras N-I-K-A (desenhadas como linhas para o efeito "caneta"). */
const LETTERS = [
  'M5 100 V0 L55 100 V0', // N
  'M90 0 V100', // I
  'M125 0 V100 M180 0 L125 58 M146 36 L182 100', // K
  'M205 100 L237 0 L269 100 M216 66 H258', // A
];

const DRAW = 0.55; // duração de cada letra
const STAGGER = 0.22; // atraso entre letras
const HOLD = 0.5; // pausa com o logo completo antes de abrir

const curtain = { duration: 0.9, ease: [0.76, 0, 0.24, 1] as const };

/**
 * Tela de abertura: o logo "NIKA" é desenhado letra a letra e,
 * ao sair (AnimatePresence no Home), a tela se abre como cortina vertical:
 * metade de cima sobe, metade de baixo desce.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const total = (DRAW + STAGGER * (LETTERS.length - 1) + HOLD) * 1000;
    const t = setTimeout(onDone, total);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-[100]" aria-hidden exit={{ opacity: 1, transition: { duration: 1 } }}>
      {/* Cortinas */}
      <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-ink" exit={{ y: '-100%', transition: curtain }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" exit={{ y: '100%', transition: curtain }} />

      {/* Logo */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.35 } }}
      >
        <svg viewBox="-10 -10 290 120" className="w-[min(70vw,420px)] overflow-visible text-brand">
          {LETTERS.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={14}
              strokeLinecap="square"
              strokeLinejoin="miter"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: DRAW, delay: i * STAGGER, ease: 'easeInOut' }}
            />
          ))}
        </svg>
        <motion.p
          className="font-display text-xl tracking-[0.5em] text-bone/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          TÊNIS · ERECHIM/RS
        </motion.p>
        {/* Barra de progresso (só transform) */}
        <div className="h-px w-40 overflow-hidden bg-bone/10">
          <motion.div
            className="h-full origin-left bg-brand"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DRAW + STAGGER * (LETTERS.length - 1) + HOLD, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

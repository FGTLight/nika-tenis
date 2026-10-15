import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useFinePointer } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Cursor customizado (só desktop com mouse e sem "reduzir movimento").
 * Ponto segue o mouse na hora; o anel vem atrás com mola.
 * Sobre links/botões o anel cresce; elementos com data-cursor="Texto" mostram um rótulo.
 */
export function CustomCursor() {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = finePointer && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.5 });

  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as HTMLElement;
      const labeled = target.closest<HTMLElement>('[data-cursor]');
      setLabel(labeled?.dataset.cursor ?? null);
      setHovering(!!target.closest('a, button, select, input, textarea, label'));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const big = !!label;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]" style={{ opacity: visible ? 1 : 0 }}>
      {/* Anel */}
      <motion.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        {/* Centralizado por margem (o Framer controla o transform para o scale) */}
        <motion.div
          className="-ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-brand"
          animate={{ scale: big ? 2.4 : hovering ? 1.5 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Preenchimento rosa quando há rótulo (anima só opacity) */}
          <motion.div
            className="h-full w-full rounded-full bg-brand"
            animate={{ opacity: big ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
        <AnimatePresence>
          {label && (
            <span key={label} className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                className="block whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-ink"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                {label}
              </motion.span>
            </span>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Ponto */}
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
      </motion.div>
    </div>
  );
}

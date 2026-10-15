import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const TEXT = 'LANÇAMENTOS • VAREJO • ATACADO • ENVIO PARA TODO O BRASIL • ';

/** Mantém v dentro de [min, max) — permite loop infinito sem "pulo". */
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

interface RowProps {
  baseVelocity: number; // % por segundo
  className?: string;
}

/**
 * Faixa de texto infinita que acelera conforme a velocidade do scroll.
 * Rolar para cima inverte o sentido. Só usa transform (translateX).
 */
function MarqueeRow({ baseVelocity, className }: RowProps) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // O conteúdo é duplicado, então andar de 0 a -50% fecha o ciclo perfeitamente.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_t, delta) => {
    if (reduced) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * Math.abs(moveBy) * Math.abs(vf);
    baseX.set(baseX.get() + moveBy);
  });

  const chunk = Array.from({ length: 4 }, () => TEXT).join('');

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ''}`}>
      <motion.div className="inline-flex will-change-transform" style={{ x }}>
        <span className="pr-0">{chunk}</span>
        <span aria-hidden>{chunk}</span>
      </motion.div>
    </div>
  );
}

export function Marquee() {
  return (
    <section aria-label="Destaques" className="relative z-10 -my-4 py-10">
      <div className="-rotate-2 bg-brand py-3 font-display text-4xl text-ink md:text-6xl">
        <MarqueeRow baseVelocity={-2.5} />
      </div>
      <div
        className="rotate-1 border-y border-line bg-ink py-3 font-display text-4xl text-transparent md:text-6xl"
        style={{ WebkitTextStroke: '1px rgb(var(--c-bone) / 0.45)' }}
      >
        <MarqueeRow baseVelocity={2} />
      </div>
    </section>
  );
}

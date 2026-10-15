import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect, useState } from 'react';
import { StarIcon, ArrowIcon } from './icons';
import { useReviews } from '../hooks/queries';
import { useReducedMotion } from '../hooks/useReducedMotion';

const INTERVAL = 6000;

/** Estrelas: cinzas por baixo; as preenchidas "estalam" em sequência por cima. */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} de 5 estrelas`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="relative h-6 w-6">
          <StarIcon className="absolute inset-0 h-6 w-6 text-line" />
          {i < rating && (
            <motion.span
              className="absolute inset-0"
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.25 + i * 0.12, type: 'spring', stiffness: 400, damping: 15 }}
            >
              <StarIcon className="h-6 w-6 text-brand" />
            </motion.span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Carrossel automático de avaliações (GET /api/reviews). Arrastável no celular. */
export function Reviews() {
  const { data: reviews } = useReviews();
  const reduced = useReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);

  const total = reviews?.length ?? 0;
  const go = (dir: number) => setState(([i]) => [(i + dir + total) % total, dir]);

  useEffect(() => {
    if (total < 2 || paused || reduced) return;
    const t = setInterval(() => setState(([i]) => [(i + 1) % total, 1]), INTERVAL);
    return () => clearInterval(t);
  }, [total, paused, reduced]);

  if (!reviews || total === 0) return null;
  const review = reviews[index % total];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <section
      className="container-x py-24 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Avaliações de clientes"
    >
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-3">Quem comprou, aprova</p>
          <h2 className="font-display text-huge uppercase">Avaliações</h2>
        </div>
        {total > 1 && (
          <div className="hidden gap-2 md:flex">
            <button onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-brand" aria-label="Anterior">
              <ArrowIcon className="h-5 w-5 rotate-180" />
            </button>
            <button onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-brand" aria-label="Próxima">
              <ArrowIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-coal">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.figure
            key={review.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="flex min-h-[300px] cursor-grab flex-col justify-between gap-8 p-8 active:cursor-grabbing md:p-14"
          >
            <Stars rating={review.rating} />
            <blockquote className="font-display text-3xl leading-tight md:text-5xl">“{review.text}”</blockquote>
            <figcaption className="text-sm uppercase tracking-widest text-bone/60">
              <span className="text-bone">{review.author}</span>
              {review.city && ` · ${review.city}`}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {reviews.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Avaliação ${i + 1}`}
              aria-current={i === index}
              className="h-2 w-8 overflow-hidden rounded-full bg-line"
            >
              <motion.span
                className="block h-full origin-left bg-brand"
                initial={false}
                animate={{ scaleX: i === index ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { SneakerArt } from './SneakerArt';
import { ArrowIcon } from './icons';
import { useProducts } from '../hooks/queries';
import type { Category } from '../types';

const ITEMS: { id: Category; title: string; tagline: string; colors: [string, string, string] }[] = [
  { id: 'masculino', title: 'Masculino', tagline: 'Do casual ao streetwear', colors: ['#FFFFFF', '#1C1419', '#D81B60'] },
  { id: 'feminino', title: 'Feminino', tagline: 'Conforto com atitude', colors: ['#F8BBD0', '#FFFFFF', '#D81B60'] },
  { id: 'infantil', title: 'Infantil', tagline: 'Para correr, pular e brincar', colors: ['#FFD6E6', '#5EC8FF', '#FF4F9A'] },
  { id: 'esportivo', title: 'Esportivo', tagline: 'Treino, corrida e quadra', colors: ['#2B2B2B', '#FFFFFF', '#FF5C9A'] },
];

/** Distância mínima (px) para um gesto contar como arraste e não como clique. */
const DRAG_THRESHOLD = 6;

/**
 * Categorias em carrossel arrastável: clicar e arrastar (mouse) ou deslizar (toque),
 * com inércia ao soltar. Setas para quem prefere clicar.
 * Um clique sem arrastar abre a página /modelos já filtrada.
 */
export function Categories({ onSelect }: { onSelect: (c: Category) => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [maxDrag, setMaxDrag] = useState(0);
  const { data: all } = useProducts();

  const x = useMotionValue(0);

  // Os tênis inclinam conforme a velocidade do arraste (só transform)
  const velocity = useSpring(useVelocity(x), { stiffness: 300, damping: 40 });
  const shoeRotate = useTransform(velocity, [-2500, 0, 2500], [6, 0, -6], { clamp: true });

  // Barra de progresso do carrossel
  const progress = useTransform(x, (v) => (maxDrag > 0 ? Math.min(1, Math.max(0, -v / maxDrag)) : 0));

  /** Largura útil da janela do carrossel (sem o padding lateral). */
  const innerWidth = () => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    const cs = getComputedStyle(vp);
    return vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  };

  // Quanto o trilho pode andar = largura do conteúdo − largura visível (recalcula ao redimensionar)
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const max = Math.max(0, track.offsetWidth - innerWidth());
      setMaxDrag(max);
      if (x.get() < -max) x.set(-max);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [x]);

  const clamp = (v: number) => Math.min(0, Math.max(-maxDrag, v));

  /** Anda um card para a esquerda/direita (setas). */
  const step = (dir: 1 | -1) => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    const gap = trackRef.current ? parseFloat(getComputedStyle(trackRef.current).columnGap) || 0 : 0;
    const width = (card?.offsetWidth ?? 300) + gap;
    animate(x, clamp(x.get() - dir * width), { type: 'spring', stiffness: 260, damping: 32 });
  };

  /** Navegação por teclado: ao focar um card fora da área visível, traz ele para a tela. */
  const revealCard = (el: HTMLElement) => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    vp.scrollLeft = 0; // o foco do navegador pode rolar o overflow; quem move o trilho é o transform
    const cardLeft = el.offsetLeft - track.offsetLeft; // posição do card dentro do trilho
    const left = cardLeft + x.get();
    if (left < 0 || left + el.offsetWidth > innerWidth()) {
      animate(x, clamp(-cardLeft), { type: 'spring', stiffness: 260, damping: 32 });
    }
  };

  const count = (c: Category) => all?.filter((p) => p.category === c).length ?? 0;

  const arrowBtn =
    'grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-brand hover:text-brand disabled:opacity-30 disabled:hover:border-line disabled:hover:text-bone';

  return (
    <section id="categorias" className="relative overflow-hidden py-20 md:py-28">
      <div className="container-x mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <p className="eyebrow mb-3">Categorias</p>
          <h2 className="font-display text-huge uppercase">Escolha seu estilo</h2>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="hidden text-sm text-mute lg:block">Arraste para explorar</p>
          <div className="hidden gap-2 sm:flex">
            <button className={arrowBtn} onClick={() => step(-1)} aria-label="Categoria anterior">
              <ArrowIcon className="h-5 w-5 rotate-180" />
            </button>
            <button className={arrowBtn} onClick={() => step(1)} aria-label="Próxima categoria">
              <ArrowIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={viewportRef} className="overflow-hidden px-4 sm:px-6 md:px-10" data-cursor="Arraste">
        <motion.div
          ref={trackRef}
          className="flex w-max cursor-grab select-none gap-4 active:cursor-grabbing md:gap-6"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.35, timeConstant: 260, bounceStiffness: 300, bounceDamping: 30 }}
          onDragStart={() => {
            draggedRef.current = false;
          }}
          onDrag={(_, info) => {
            if (Math.abs(info.offset.x) > DRAG_THRESHOLD) draggedRef.current = true;
          }}
          onDragEnd={() => {
            // O clique dispara logo após soltar: libera só no próximo ciclo
            setTimeout(() => {
              draggedRef.current = false;
            }, 0);
          }}
        >
          {ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                if (!draggedRef.current) onSelect(item.id);
              }}
              onFocus={(e) => revealCard(e.currentTarget)}
              data-cursor="Filtrar"
              draggable={false}
              className="group relative flex h-[58vh] max-h-[620px] min-h-[380px] w-[80vw] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-coal p-6 text-left transition-colors hover:border-brand sm:w-[60vw] md:w-[44vw] md:p-10 lg:w-[34vw]"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-2xl text-mute">0{i + 1}</span>
                <span className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-widest text-bone/70">
                  {count(item.id)} modelos
                </span>
              </div>

              <div className="pointer-events-none absolute inset-x-8 top-[42%] -translate-y-1/2 md:inset-x-14">
                <motion.div style={{ rotate: shoeRotate }}>
                  <SneakerArt
                    primary={item.colors[0]}
                    secondary={item.colors[1]}
                    accent={item.colors[2]}
                    title={item.title}
                    className="w-full -rotate-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              </div>

              <div className="relative">
                <h3 className="font-display text-6xl uppercase leading-none md:text-7xl lg:text-8xl">{item.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-bone/70">
                  {item.tagline}
                  <ArrowIcon className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Progresso */}
      {maxDrag > 0 && (
        <div className="container-x mt-8">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-line">
            <motion.div className="h-full origin-left bg-brand" style={{ scaleX: progress }} />
          </div>
        </div>
      )}
    </section>
  );
}

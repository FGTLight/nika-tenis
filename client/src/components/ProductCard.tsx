import { motion, useMotionValue, useSpring, type Variants } from 'framer-motion';
import type { PointerEvent } from 'react';
import { ProductImage } from './SneakerArt';
import { WhatsAppIcon } from './icons';
import { formatPrice, CATEGORY_LABEL } from '../lib/format';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { useFinePointer } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Product } from '../types';

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

interface Props {
  product: Product;
  whatsapp?: string;
  onOpen: (p: Product) => void;
}

/**
 * Card do produto.
 * Desktop: inclina em 3D seguindo o mouse, o tênis gira -15° e aparecem preço + "Quero esse".
 * Mobile/touch: sem tilt; preço e botão ficam sempre visíveis.
 */
export function ProductCard({ product, whatsapp, onOpen }: Props) {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const tiltEnabled = finePointer && !reduced;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!tiltEnabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      variants={cardVariants}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={tiltEnabled ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className="group relative flex flex-col rounded-3xl border border-line bg-coal p-3 transition-colors hover:border-brand/60"
      data-cursor="Ver"
    >
      {/* Mídia compartilhada com o modal (layoutId) */}
      <motion.div
        layoutId={`product-media-${product.id}`}
        className="relative aspect-square overflow-hidden rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 60%, ${product.colorAccent}22, rgb(var(--c-media)) 70%)` }}
      >
        <div className="absolute left-3 top-3 z-[1] flex gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              Lançamento
            </span>
          )}
          {product.featured && (
            <span className="rounded-full bg-bone px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              Destaque
            </span>
          )}
        </div>
        <div className="flex h-full items-center justify-center p-4 transition-transform duration-500 ease-out group-hover:-rotate-[15deg] group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
          <ProductImage product={product} className="w-full" />
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-mute">{CATEGORY_LABEL[product.category]}</p>
        <h3 className="mt-1 font-display text-3xl leading-none">{product.name}</h3>

        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Preço sempre visível */}
          <span className="text-lg font-semibold text-brand">{formatPrice(product.price)}</span>
          {/* Botão aparece no hover (desktop) / sempre visível (touch).
              Com teclado, aparece via :focus-visible — o foco deixado por um clique de mouse não o prende visível. */}
          <a
            href={whatsappLink(whatsapp, MESSAGES.product(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand relative z-10 !px-4 !py-2 text-xs transition-[opacity,transform,background-color,color] duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-has-[:focus-visible]:translate-y-0 [@media(hover:hover)]:group-has-[:focus-visible]:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <WhatsAppIcon className="h-3.5 w-3.5" /> Quero esse
          </a>
        </div>
      </div>

      {/* Botão que cobre o card inteiro → abre o modal (acessível via teclado) */}
      <button
        className="absolute inset-0 rounded-3xl"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes do ${product.name}`}
      />
    </motion.article>
  );
}

/** Skeleton exibido enquanto a API responde. */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-coal p-3" aria-hidden>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-line/60">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="space-y-2 px-2 pb-2 pt-4">
        <div className="h-3 w-20 rounded bg-line" />
        <div className="h-7 w-3/4 rounded bg-line" />
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ProductImage } from './SneakerArt';
import { CloseIcon, WhatsAppIcon } from './icons';
import { useProduct } from '../hooks/queries';
import { useLockScroll } from '../lib/smoothScroll';
import { formatPrice, CATEGORY_LABEL } from '../lib/format';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import type { Product } from '../types';

interface Props {
  product: Product;
  whatsapp?: string;
  onClose: () => void;
}

/**
 * Detalhe do produto. A imagem compartilha o `layoutId` com o card,
 * então ela "voa" do grid até o modal (shared layout animation).
 * Busca GET /api/products/:id em segundo plano para garantir dados atualizados.
 */
export function ProductModal({ product: initial, whatsapp, onClose }: Props) {
  const { data } = useProduct(initial.id, initial);
  const product = data ?? initial;
  const [size, setSize] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useLockScroll(true);

  // Esc fecha; foco vai para o botão fechar (acessibilidade)
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const message = size
    ? `${MESSAGES.product(product)} Tamanho: ${size}.`
    : MESSAGES.product(product);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="product-title">
      {/* Fundo */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-line bg-coal md:grid-cols-2 md:rounded-3xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        data-lenis-prevent
      >
        <motion.div
          layoutId={`product-media-${product.id}`}
          className="relative flex aspect-square items-center justify-center p-8 md:aspect-auto"
          style={{ background: `radial-gradient(circle at 50% 60%, ${product.colorAccent}33, rgb(var(--c-media)) 70%)` }}
        >
          <ProductImage product={product} className="w-full -rotate-12" />
        </motion.div>

        <div className="flex flex-col gap-5 p-6 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-mute">
                {CATEGORY_LABEL[product.category]} {product.brand && `· ${product.brand}`}
              </p>
              <h3 id="product-title" className="mt-1 font-display text-5xl leading-none md:text-6xl">
                {product.name}
              </h3>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-brand hover:text-brand"
              aria-label="Fechar"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="text-3xl font-semibold text-brand">{formatPrice(product.price)}</p>
          <p className="leading-relaxed text-bone/75">{product.description}</p>

          {product.sizes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-mute">Tamanhos</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize((cur) => (cur === s ? null : s))}
                    aria-pressed={size === s}
                    className={`h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                      size === s ? 'border-brand bg-brand text-ink' : 'border-line hover:border-bone/60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <a href={whatsappLink(whatsapp, message)} target="_blank" rel="noopener noreferrer" className="btn-brand">
              <WhatsAppIcon className="h-4 w-4" /> Quero esse{size ? ` · nº ${size}` : ''}
            </a>
            <p className="text-center text-xs text-mute">
              É revendedor? Pergunte pelo preço de atacado no WhatsApp ou na seção Atacado.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

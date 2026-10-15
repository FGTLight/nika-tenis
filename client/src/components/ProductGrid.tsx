import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useState } from 'react';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { ProductModal } from './ProductModal';
import { useProducts, useStoreInfo } from '../hooks/queries';
import { CATEGORY_LABEL } from '../lib/format';
import { CATEGORIES, type Category, type Product, type ProductFilters } from '../types';

/** Faixas de preço do filtro */
const PRICE_RANGES = [
  { id: 'all', label: 'Todos os preços' },
  { id: 'ate200', label: 'Até R$ 200', max: 200 },
  { id: '200a300', label: 'R$ 200 – 300', min: 200, max: 300 },
  { id: 'acima300', label: 'Acima de R$ 300', min: 300 },
] as const;

type PriceRangeId = (typeof PRICE_RANGES)[number]['id'];

interface Props {
  category: Category | null;
  onCategoryChange: (c: Category | null) => void;
}

/**
 * Catálogo: consome GET /api/products com filtros (categoria, destaque, preço).
 * Skeletons durante o carregamento, entrada em stagger e modal com shared layout.
 */
export function ProductGrid({ category, onCategoryChange }: Props) {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRangeId>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const range = PRICE_RANGES.find((r) => r.id === priceRange)!;
  const filters: ProductFilters = {
    category: category ?? undefined,
    featured: featuredOnly || undefined,
    minPrice: 'min' in range ? range.min : undefined,
    maxPrice: 'max' in range ? range.max : undefined,
  };

  const { data: products, isPending, isError, refetch } = useProducts(filters);
  const { data: store } = useStoreInfo();
  const filterKey = JSON.stringify(filters);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
      active ? 'border-brand bg-brand text-ink' : 'border-line text-bone/70 hover:border-bone/50 hover:text-bone'
    }`;

  return (
    <section id="modelos" className="container-x pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3">Catálogo</p>
          <h2 className="font-display text-huge uppercase">
            {category ? CATEGORY_LABEL[category] : 'Todos os modelos'}
          </h2>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:justify-end md:px-0">
            <button className={chip(category === null)} onClick={() => onCategoryChange(null)}>
              Todos
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} className={chip(category === c)} onClick={() => onCategoryChange(c)}>
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className={chip(featuredOnly)} onClick={() => setFeaturedOnly((v) => !v)} aria-pressed={featuredOnly}>
              ★ Destaques
            </button>
            <label className="sr-only" htmlFor="price-range">
              Faixa de preço
            </label>
            <select
              id="price-range"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRangeId)}
              className="rounded-full border border-line bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bone/80 focus:border-brand focus:outline-none"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded-3xl border border-danger/40 p-10 text-center">
          <p className="text-bone/80">Não foi possível carregar os modelos agora.</p>
          <button className="btn-ghost mt-4" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      <LayoutGroup>
        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            key={filterKey}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={store?.whatsapp} onOpen={setSelected} />
            ))}
          </motion.div>
        ) : (
          !isError && (
            <p className="rounded-3xl border border-line p-10 text-center text-bone/70">
              Nenhum modelo encontrado com esses filtros.
            </p>
          )
        )}

        <AnimatePresence>
          {selected && (
            <ProductModal
              key={selected.id}
              product={selected}
              whatsapp={store?.whatsapp}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
}

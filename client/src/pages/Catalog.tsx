import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SmoothScrollProvider } from '../lib/smoothScroll';
import { Seo } from '../components/Seo';
import { Navbar } from '../components/Navbar';
import { ProductGrid } from '../components/ProductGrid';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CustomCursor } from '../components/CustomCursor';
import { ArrowIcon } from '../components/icons';
import { CATEGORY_LABEL } from '../lib/format';
import { CATEGORIES, type Category } from '../types';

/** Lê ?categoria= da URL, aceitando só categorias válidas. */
function parseCategory(value: string | null): Category | null {
  return CATEGORIES.includes(value as Category) ? (value as Category) : null;
}

/**
 * Página /modelos: o catálogo completo, separado da home para ela ficar mais leve.
 * O filtro de categoria fica na URL (/modelos?categoria=feminino), então dá para compartilhar o link.
 */
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = parseCategory(params.get('categoria'));

  // Ao chegar na página, começa do topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setCategory = (c: Category | null) => setParams(c ? { categoria: c } : {}, { replace: true });

  return (
    <SmoothScrollProvider>
      <div className="grain">
        <Seo
          title={`${category ? `Tênis ${CATEGORY_LABEL[category]}` : 'Modelos'} | Nika Tênis Erechim`}
          description="Catálogo de tênis da Nika Tênis em Erechim/RS: masculino, feminino, infantil e esportivo. Peça pelo WhatsApp."
          path="/modelos"
        />
        <CustomCursor />
        <Navbar />

        <main className="relative">
          <div className="container-x absolute inset-x-0 top-20 md:top-24">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-mute hover:text-brand">
              <ArrowIcon className="h-4 w-4 rotate-180" /> Início
            </Link>
          </div>
          <ProductGrid category={category} onCategoryChange={setCategory} />
        </main>

        <Footer />
        <WhatsAppButton show />
      </div>
    </SmoothScrollProvider>
  );
}

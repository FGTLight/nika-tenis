import { Helmet } from 'react-helmet-async';
import { useStoreInfo } from '../hooks/queries';
import { isPlaceholder } from '../lib/format';
import { DEFAULT_COORDS } from './StoreLocation';

const TITLE = 'Nika Tênis Erechim | Tênis Varejo e Atacado';
const DESCRIPTION =
  'Nika Tênis em Erechim/RS: tênis esportivos e urbanos no varejo e no atacado. Masculino, feminino e infantil. Envio para todo o Brasil.';

interface SeoProps {
  /** Título da página (padrão: o da home) */
  title?: string;
  description?: string;
  /** Caminho da página para a URL canônica, ex.: "/modelos" */
  path?: string;
}

/** SEO por página: title, meta tags, Open Graph e JSON-LD schema.org/ShoeStore. */
export function Seo({ title = TITLE, description = DESCRIPTION, path = '' }: SeoProps) {
  const { data: store } = useStoreInfo();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = origin + path;

  const sameAs = [store?.facebook ?? 'https://www.facebook.com/nikatenisvarejoatacado', store?.instagram].filter(
    (v): v is string => !!v && !isPlaceholder(v),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ShoeStore',
    name: store?.name ?? 'Nika Tênis',
    description: DESCRIPTION,
    url: origin,
    image: `${origin}/favicon.svg`,
    priceRange: '$$',
    ...(store && !isPlaceholder(store.phone) ? { telephone: store.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(store && !isPlaceholder(store.address) ? { streetAddress: store.address } : {}),
      // CEP extraído do campo cidade ("Erechim/RS · CEP 99712-332")
      ...(store?.city.match(/\d{5}-?\d{3}/) ? { postalCode: store.city.match(/\d{5}-?\d{3}/)![0] } : {}),
      addressLocality: 'Erechim',
      addressRegion: 'RS',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: store?.latitude ?? DEFAULT_COORDS.lat,
      longitude: store?.longitude ?? DEFAULT_COORDS.lng,
    },
    hasMap: `https://www.google.com/maps?q=${store?.latitude ?? DEFAULT_COORDS.lat},${store?.longitude ?? DEFAULT_COORDS.lng}`,
    sameAs,
  };

  return (
    <Helmet>
      <html lang="pt-BR" />
      <title>{title}</title>
      {/* Versão de teste: VITE_NOINDEX=true esconde o site do Google */}
      {import.meta.env.VITE_NOINDEX === 'true' && <meta name="robots" content="noindex, nofollow" />}
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="geo.region" content="BR-RS" />
      <meta name="geo.placename" content="Erechim" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

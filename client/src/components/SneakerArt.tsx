import type { Product } from '../types';

interface SneakerArtProps {
  primary?: string;
  secondary?: string;
  accent?: string;
  className?: string;
  title?: string;
}

/**
 * Tênis ilustrado em SVG (vista lateral).
 * Usado quando o produto ainda não tem foto: cada modelo ganha sua "colorway"
 * a partir das cores cadastradas, então o catálogo fica bonito desde o primeiro dia.
 */
export function SneakerArt({
  primary = '#F2EFE9',
  secondary = '#1A1A1A',
  accent = '#FF4F9A',
  className,
  title = 'Tênis',
}: SneakerArtProps) {
  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label={title}>
      {/* Solado */}
      <path d="M22 168 H376 Q392 168 390 184 Q388 202 362 202 H46 Q20 202 20 184 Q20 168 22 168 Z" fill={secondary} />
      <path d="M26 166 H374 Q388 166 386 178 Q384 190 360 190 H48 Q26 190 24 178 Q24 166 26 166 Z" fill="#FFFFFF" />
      <path d="M60 184 H350" stroke={secondary} strokeOpacity="0.15" strokeWidth="3" strokeDasharray="10 8" />

      {/* Cabedal */}
      <path
        d="M36 168 Q28 120 52 100 L116 66 Q138 54 156 70 L196 108 Q228 128 292 130 Q352 132 374 152 Q384 162 374 168 Z"
        fill={primary}
      />
      {/* Calcanhar */}
      <path d="M36 168 Q28 120 52 100 L70 92 Q60 130 74 168 Z" fill={secondary} fillOpacity="0.9" />
      {/* Biqueira */}
      <path d="M304 131 Q356 134 374 152 Q384 162 374 168 H322 Q316 146 304 131 Z" fill={secondary} fillOpacity="0.18" />

      {/* Faixa lateral de destaque */}
      <path d="M98 158 Q150 116 236 132 Q286 140 340 144 Q290 160 220 160 Q160 160 98 158 Z" fill={accent} />

      {/* Cadarços */}
      <g stroke={secondary} strokeWidth="5" strokeLinecap="round">
        <path d="M150 78 L168 70" />
        <path d="M164 92 L182 84" />
        <path d="M178 106 L196 98" />
      </g>

      {/* Colarinho */}
      <path d="M52 100 Q84 84 116 66" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Brilho */}
      <path d="M120 84 Q160 96 190 124" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Mostra a foto do produto (lazy) ou o SVG ilustrado com as cores do modelo. */
export function ProductImage({ product, className }: { product: Product; className?: string }) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-contain ${className ?? ''}`}
      />
    );
  }
  return (
    <SneakerArt
      primary={product.colorPrimary}
      secondary={product.colorSecondary}
      accent={product.colorAccent}
      title={product.name}
      className={className}
    />
  );
}

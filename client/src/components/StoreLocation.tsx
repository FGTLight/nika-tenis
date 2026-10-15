import { motion } from 'framer-motion';
import { useStoreInfo } from '../hooks/queries';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { isPlaceholder } from '../lib/format';
import { PinIcon, WhatsAppIcon, ArrowIcon } from './icons';

/** Coordenadas padrão da loja (usadas enquanto a API carrega). */
export const DEFAULT_COORDS = { lat: -27.6370527, lng: -52.3100348 };

/**
 * Localização: mapa do Google incorporado (sem chave de API), endereço e horários
 * vindos de /api/store-info, botão "Como chegar" e pin com pulso animado.
 */
export function StoreLocation() {
  const { data: store } = useStoreInfo();
  const lat = store?.latitude ?? DEFAULT_COORDS.lat;
  const lng = store?.longitude ?? DEFAULT_COORDS.lng;

  const embed = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed&hl=pt-BR`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section id="loja" className="container-x py-24 md:py-32">
      <p className="eyebrow mb-3">Visite a loja</p>
      <h2 className="mb-12 font-display text-huge uppercase">Estamos em Erechim</h2>

      <div className="grid overflow-hidden rounded-3xl border border-line lg:grid-cols-[1.4fr_1fr]">
        {/* Mapa */}
        <div className="relative min-h-[360px] bg-coal lg:min-h-[520px]">
          <iframe
            title="Mapa da Nika Tênis em Erechim"
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 map-themed"
          />
          {/* Pin com pulso (sobreposto ao centro do mapa, que está centralizado nas coordenadas) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <span className="absolute bottom-0 left-1/2 h-8 w-8 -translate-x-1/2 translate-y-1/2">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/60 motion-reduce:hidden" />
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/40 [animation-delay:0.9s] motion-reduce:hidden" />
            </span>
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            >
              <PinIcon className="relative h-12 w-12 text-brand drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" />
            </motion.div>
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col gap-8 bg-coal p-8 md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-mute">Endereço</p>
            <p className="mt-2 text-lg">{store?.address ?? '…'}</p>
            <p className="text-bone/60">{store?.city ?? 'Erechim/RS'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-mute">Horários</p>
            <ul className="mt-2 divide-y divide-line">
              {(store?.hours ?? []).map((h) => (
                <li key={h.days} className="flex justify-between gap-4 py-2">
                  <span className="text-bone/70">{h.days}</span>
                  <span className="text-right">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-mute">Telefone</p>
            {store && !isPlaceholder(store.phone) ? (
              <a href={`tel:${store.phone.replace(/\D/g, '')}`} className="mt-2 block text-lg hover:text-brand">
                {store.phone}
              </a>
            ) : (
              <p className="mt-2 text-lg">{store?.phone ?? '…'}</p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-brand flex-1">
              Como chegar <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink(store?.whatsapp, MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex-1"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

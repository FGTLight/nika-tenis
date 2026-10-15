import { useStoreInfo } from '../hooks/queries';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { isPlaceholder } from '../lib/format';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './icons';

const FACEBOOK_FALLBACK = 'https://www.facebook.com/nikatenisvarejoatacado';

export function Footer() {
  const { data: store } = useStoreInfo();
  const facebook = store?.facebook && !isPlaceholder(store.facebook) ? store.facebook : FACEBOOK_FALLBACK;
  const instagram = store?.instagram && !isPlaceholder(store.instagram) ? store.instagram : null;

  const social = 'grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-brand hover:text-brand';

  return (
    <footer className="relative overflow-hidden border-t border-line pt-16">
      <div className="container-x flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-4xl">Bora calçar?</p>
          <p className="mt-1 text-bone/60">Tênis varejo e atacado · Erechim/RS</p>
        </div>
        <div className="flex gap-3">
          <a href={facebook} target="_blank" rel="noopener noreferrer" className={social} aria-label="Facebook da Nika Tênis">
            <FacebookIcon className="h-5 w-5" />
          </a>
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className={social} aria-label="Instagram da Nika Tênis">
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          <a
            href={whatsappLink(store?.whatsapp, MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            className={social}
            aria-label="WhatsApp da Nika Tênis"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Logo gigante cortado na base */}
      <p
        className="pointer-events-none mt-10 select-none text-center font-display text-[32vw] leading-[0.75] text-brand"
        aria-hidden
      >
        NIKA
      </p>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-bone/50 sm:flex-row">
          <p>© Nika Tênis – Erechim/RS</p>
          <a href="/admin" className="hover:text-bone">
            Área restrita
          </a>
        </div>
      </div>
    </footer>
  );
}

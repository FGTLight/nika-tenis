import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';
import { useScrollTo } from '../lib/smoothScroll';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { useStoreInfo } from '../hooks/queries';
import { WhatsAppIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '#categorias', label: 'Categorias' },
  { href: '/modelos', label: 'Modelos' }, // página própria
  { href: '#atacado', label: 'Atacado' },
  { href: '#loja', label: 'A loja' },
];

/** Barra fixa: some ao rolar para baixo, volta ao rolar para cima. */
export function Navbar() {
  const scrollTo = useScrollTo();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: store } = useStoreInfo();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
    setSolid(y > 40);
  });

  /** "/modelos" abre a página do catálogo; "#secao" rola na home (ou volta para a home e rola). */
  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith('/')) navigate(href);
    else if (pathname === '/') scrollTo(href);
    else navigate('/' + href);
  };

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid || open ? 'bg-ink/85 backdrop-blur-md' : ''}`}
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="font-display text-3xl tracking-wider text-bone" aria-label="Nika Tênis – início">
          NIKA<span className="text-brand">.</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <button
                onClick={() => go(l.href)}
                className="text-sm font-medium uppercase tracking-widest text-bone/70 transition-colors hover:text-brand"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={whatsappLink(store?.whatsapp, MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand hidden !px-5 !py-2.5 sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <button
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <motion.span className="h-0.5 w-6 bg-bone" animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} />
            <motion.span className="h-0.5 w-6 bg-bone" animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.ul
            className="container-x flex flex-col gap-1 pb-6 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <button onClick={() => go(l.href)} className="w-full py-3 text-left font-display text-4xl text-bone">
                  {l.label}
                </button>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={whatsappLink(store?.whatsapp, MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand w-full"
              >
                <WhatsAppIcon className="h-4 w-4" /> Chamar no WhatsApp
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

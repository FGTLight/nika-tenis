import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-12 w-12" aria-hidden>
    {children}
  </svg>
);

const ITEMS = [
  {
    title: 'Loja física em Erechim',
    text: 'Venha provar, sentir o conforto e sair calçado.',
    icon: (
      <Icon>
        <path d="M6 20 L24 6 L42 20 V42 H6 Z" strokeLinejoin="round" />
        <path d="M18 42 V28 H30 V42" />
      </Icon>
    ),
  },
  {
    title: 'Varejo e atacado',
    text: 'Um par para você ou caixas para a sua loja.',
    icon: (
      <Icon>
        <rect x="6" y="18" width="16" height="16" rx="2" />
        <rect x="26" y="10" width="16" height="24" rx="2" />
        <path d="M4 40 H44" strokeLinecap="round" />
      </Icon>
    ),
  },
  {
    title: 'Envio para todo o Brasil',
    text: 'Despachamos para qualquer cidade do país.',
    icon: (
      <Icon>
        <path d="M4 14 H30 V34 H4 Z" strokeLinejoin="round" />
        <path d="M30 20 H38 L44 27 V34 H30" strokeLinejoin="round" />
        <circle cx="12" cy="36" r="4" className="fill-ink" />
        <circle cx="36" cy="36" r="4" className="fill-ink" />
      </Icon>
    ),
  },
  {
    title: 'Atendimento no WhatsApp',
    text: 'Tire dúvidas, veja fotos e reserve seu par.',
    icon: (
      <Icon>
        <path d="M8 40 L11 31 A16 16 0 1 1 17 37 Z" strokeLinejoin="round" />
        <path d="M17 22 H31 M17 28 H26" strokeLinecap="round" />
      </Icon>
    ),
  },
];

/** "Por que a Nika?" — ícones com fade-up em sequência ao entrar na tela. */
export function WhyNika() {
  return (
    <section className="container-x py-24 md:py-32">
      <p className="eyebrow mb-3">Por que a Nika</p>
      <h2 className="mb-12 max-w-3xl font-display text-huge uppercase">Mais que tênis: atendimento de verdade</h2>

      <motion.ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {ITEMS.map((item) => (
          <motion.li
            key={item.title}
            className="group rounded-3xl border border-line p-6 transition-colors hover:border-brand/60"
            variants={{
              hidden: { opacity: 0, y: 40 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div className="text-brand transition-transform duration-300 group-hover:-translate-y-1">{item.icon}</div>
            <h3 className="mt-6 font-display text-3xl leading-none">{item.title}</h3>
            <p className="mt-2 text-sm text-bone/60">{item.text}</p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

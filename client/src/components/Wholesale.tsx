import { AnimatePresence, animate, motion, useInView } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { api, ApiError } from '../lib/api';
import { useStoreInfo } from '../hooks/queries';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { WhatsAppIcon } from './icons';

/* ───────────── Validação (espelha o Zod do backend) ───────────── */

const digits = (v: string) => v.replace(/\D/g, '');

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  city: z.string().trim().min(2, 'Informe sua cidade'),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => digits(v).length >= 10 && digits(v).length <= 13, 'WhatsApp com DDD, ex.: (54) 99999-9999'),
  cnpj: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || digits(v).length === 14, 'CNPJ deve ter 14 dígitos'),
  message: z.string().trim().max(1000).optional(),
  website: z.string().optional(), // honeypot anti-spam (fica escondido)
});

type FormData = z.infer<typeof schema>;

/** Máscara simples de telefone: (54) 99999-9999 */
function maskPhone(v: string) {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara de CNPJ: 00.000.000/0000-00 */
function maskCnpj(v: string) {
  return digits(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

const BENEFITS = [
  { title: 'Preço de atacado', text: 'Condições especiais para quem compra para revender.' },
  { title: 'Grade completa', text: 'Masculino, feminino e infantil em vários tamanhos.' },
  { title: 'Envio para todo o Brasil', text: 'Receba os pares na sua cidade.' },
  { title: 'Atendimento direto', text: 'Fale com a equipe pelo WhatsApp, sem robô.' },
];

/** Label + campo + mensagem de erro. Fica fora do componente para não remontar o input a cada tecla. */
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-bone/60">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}

/* ───────────── Contador animado ───────────── */

function Counter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduced) {
      ref.current.textContent = value.toLocaleString('pt-BR');
      return;
    }
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('pt-BR');
      },
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return (
    <div>
      <p className="font-display text-6xl leading-none text-brand md:text-7xl">
        <span ref={ref}>0</span>
        {suffix}
      </p>
      <p className="mt-1 text-sm uppercase tracking-widest text-bone/60">{label}</p>
    </div>
  );
}

/* ───────────── Seção ───────────── */

export function Wholesale() {
  const { data: store } = useStoreInfo();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ website, ...data }: FormData) =>
      // Bots costumam preencher o honeypot: fingimos sucesso sem enviar nada.
      website ? Promise.resolve({ ok: true as const, id: 'bot' }) : api.createWholesaleLead(data),
    onError: (err) => {
      // Erros por campo vindos do Zod do servidor
      if (err instanceof ApiError && err.fields) {
        Object.entries(err.fields).forEach(([field, msgs]) =>
          setError(field as keyof FormData, { message: msgs?.[0] }),
        );
      }
    },
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  return (
    <section id="atacado" className="relative overflow-hidden border-y border-line bg-coal py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />

      <div className="container-x relative grid gap-14 lg:grid-cols-2">
        {/* Texto + contadores + benefícios */}
        <div>
          <p className="eyebrow mb-3">Atacado</p>
          <h2 className="font-display text-huge uppercase">
            Revenda <span className="text-brand">Nika</span>
          </h2>
          <p className="mt-4 max-w-lg text-bone/70">
            Tem loja, brechó ou vende pelas redes? Peça o catálogo de atacado e leve os modelos mais procurados para a
            sua cidade.
          </p>

          {store?.stats && store.stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {store.stats.map((s) => (
                <Counter key={s.label} {...s} />
              ))}
            </div>
          )}

          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <motion.li
                key={b.title}
                className="rounded-2xl border border-line bg-ink/60 p-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <p className="font-display text-2xl text-bone">{b.title}</p>
                <p className="mt-1 text-sm text-bone/60">{b.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Formulário / sucesso */}
        <div className="relative rounded-3xl border border-line bg-ink p-6 md:p-10">
          <AnimatePresence mode="wait">
            {mutation.isSuccess ? (
              <motion.div
                key="success"
                className="flex min-h-[460px] flex-col items-center justify-center text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg viewBox="0 0 80 80" className="h-24 w-24 text-brand">
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.path
                    d="M24 41 L35 52 L57 29"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  />
                </svg>
                <h3 className="mt-6 font-display text-5xl">Pedido recebido!</h3>
                <p className="mt-2 max-w-sm text-bone/70">
                  Em breve enviaremos o catálogo de atacado no seu WhatsApp. Quer agilizar?
                </p>
                <a
                  href={whatsappLink(store?.whatsapp, MESSAGES.wholesale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand mt-6"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Falar agora
                </a>
                <button
                  className="mt-4 text-sm text-mute underline-offset-4 hover:underline"
                  onClick={() => {
                    reset();
                    mutation.reset();
                  }}
                >
                  Enviar outro cadastro
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="font-display text-4xl">Quero o catálogo de atacado</h3>

                <Field error={errors.name?.message} label="Nome">
                  <input className="input" autoComplete="name" placeholder="Seu nome" {...register('name')} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field error={errors.city?.message} label="Cidade">
                    <input className="input" autoComplete="address-level2" placeholder="Cidade/UF" {...register('city')} />
                  </Field>
                  <Field error={errors.whatsapp?.message} label="WhatsApp">
                    <input
                      className="input"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(54) 99999-9999"
                      {...register('whatsapp', {
                        onChange: (e) => setValue('whatsapp', maskPhone(e.target.value)),
                      })}
                    />
                  </Field>
                </div>
                <Field error={errors.cnpj?.message} label="CNPJ (opcional)">
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="00.000.000/0000-00"
                    {...register('cnpj', { onChange: (e) => setValue('cnpj', maskCnpj(e.target.value)) })}
                  />
                </Field>
                <Field error={errors.message?.message} label="Mensagem">
                  <textarea
                    className="input min-h-[110px] resize-y"
                    placeholder="Conte o que você procura (modelos, quantidade...)"
                    {...register('message')}
                  />
                </Field>

                {/* Honeypot: invisível para pessoas */}
                <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />

                {mutation.isError && !(mutation.error instanceof ApiError && mutation.error.fields) && (
                  <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                    {mutation.error.message || 'Não foi possível enviar. Tente novamente.'}
                  </p>
                )}

                <button type="submit" className="btn-brand w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Enviando…' : 'Pedir catálogo'}
                </button>
                <p className="text-center text-xs text-mute">Seus dados são usados só para contato comercial.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

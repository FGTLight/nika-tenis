import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { SneakerArt } from './SneakerArt';
import { WhatsAppIcon, ArrowIcon } from './icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useFinePointer } from '../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { useStoreInfo } from '../hooks/queries';

/** Linhas do título; cada palavra é revelada separadamente. */
const LINES = [['PISE', 'COM'], ['ESTILO'], ['EM', 'ERECHIM']];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Hero: título revelado palavra por palavra + tênis flutuando que gira em 3D
 * seguindo o mouse (useMotionValue → useSpring → useTransform).
 * `ready` segura a animação de entrada até o preloader sair.
 */
export function Hero({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const navigate = useNavigate();
  const { data: store } = useStoreInfo();

  // Posição do mouse normalizada de -0.5 a 0.5
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-35, 35]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [22, -22]);
  const shiftX = useTransform(sx, [-0.5, 0.5], [-24, 24]);

  useEffect(() => {
    if (reduced || !finePointer) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, finePointer, mx, my]);

  let wordIndex = 0;

  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      {/* Brilho de fundo (estático) */}
      <div className="pointer-events-none absolute right-[-10%] top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-brand/10 blur-[120px]" />

      <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative z-10">
          <motion.p
            className="eyebrow mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease }}
          >
            Varejo & Atacado · Erechim/RS
          </motion.p>

          <h1 className="font-display text-mega uppercase" aria-label="Pise com estilo em Erechim">
            {LINES.map((line, li) => (
              <span key={li} className="block" aria-hidden>
                {line.map((word) => {
                  const i = wordIndex++;
                  return (
                    <span key={word} className="mr-[0.18em] inline-block overflow-hidden pb-[0.04em] align-bottom last:mr-0">
                      <motion.span
                        className={`inline-block ${word === 'ESTILO' ? 'text-brand' : ''}`}
                        initial={{ y: '110%' }}
                        animate={ready ? { y: '0%' } : undefined}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-md text-base text-bone/70 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.7, ease }}
          >
            Tênis esportivos e urbanos para toda a família. Venha à loja, chame no WhatsApp ou revenda com a gente.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.85, ease }}
          >
            <button className="btn-brand" onClick={() => navigate('/modelos')}>
              Ver modelos <ArrowIcon className="h-4 w-4" />
            </button>
            <a
              className="btn-ghost"
              href={whatsappLink(store?.whatsapp, MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-4 w-4" /> Chamar no WhatsApp
            </a>
          </motion.div>
        </div>

        {/* Tênis 3D */}
        <motion.div
          className="relative mx-auto w-full max-w-xl [perspective:1000px]"
          initial={{ opacity: 0, scale: 0.85, rotate: -25 }}
          animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.2, delay: 0.3, ease }}
        >
          <motion.div
            style={{ rotateX, rotateY, x: shiftX, transformStyle: 'preserve-3d' }}
            animate={reduced ? undefined : { y: [0, -18, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SneakerArt className="w-full -rotate-12 drop-shadow-[0_40px_40px_rgb(var(--c-brand)/0.22)]" title="Tênis em destaque" primary="#FFFFFF" secondary="#1C1419" accent="rgb(var(--c-brand))" />
          </motion.div>
          {/* Sombra no chão que "respira" com a flutuação */}
          <motion.div
            className="mx-auto mt-4 h-6 w-2/3 rounded-[50%] bg-black/70 blur-xl"
            animate={reduced ? undefined : { scaleX: [1, 0.8, 1], opacity: [0.8, 0.5, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-bone/40 md:block"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4 }}
      >
        Role para ver
      </motion.div>
    </section>
  );
}

import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollProvider } from '../lib/smoothScroll';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Seo } from '../components/Seo';
import { Preloader } from '../components/Preloader';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { Categories } from '../components/Categories';
import { WhyNika } from '../components/WhyNika';
import { Wholesale } from '../components/Wholesale';
import { Reviews } from '../components/Reviews';
import { StoreLocation } from '../components/StoreLocation';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CustomCursor } from '../components/CustomCursor';
import type { Category } from '../types';

const PRELOADER_KEY = 'nika:preloader-seen';

/** O preloader roda só na primeira visita da sessão (e nunca com reduzir movimento). */
function shouldShowPreloader() {
  try {
    return sessionStorage.getItem(PRELOADER_KEY) !== '1';
  } catch {
    return true;
  }
}

function HomeContent() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [loading, setLoading] = useState(() => !reduced && shouldShowPreloader());

  const finishPreloader = useCallback(() => {
    setLoading(false);
    try {
      sessionStorage.setItem(PRELOADER_KEY, '1');
    } catch {
      /* modo privado: sem problema */
    }
  }, []);

  // Fontes web mudam a altura dos títulos → recalcula as posições do ScrollTrigger
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // Vindo de outra página com âncora (ex.: /#atacado pelo menu do catálogo): rola até a seção
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0); // voltando do catálogo: começa do topo
      return;
    }
    const t = setTimeout(() => {
      const el = document.querySelector<HTMLElement>(hash);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80 });
    }, 150);
    return () => clearTimeout(t);
  }, [hash]);

  // Categoria → página do catálogo já filtrada
  const selectCategory = (c: Category) => navigate(`/modelos?categoria=${c}`);

  return (
    <div className="grain">
      <Seo />
      <AnimatePresence>{loading && <Preloader onDone={finishPreloader} />}</AnimatePresence>
      <CustomCursor />
      <Navbar />

      <main>
        <Hero ready={!loading} />
        <Marquee />
        <Categories onSelect={selectCategory} />
        <WhyNika />
        <Wholesale />
        <Reviews />
        <StoreLocation />
      </main>

      <Footer />
      <WhatsAppButton show={!loading} />
    </div>
  );
}

export default function Home() {
  return (
    <SmoothScrollProvider>
      <HomeContent />
    </SmoothScrollProvider>
  );
}

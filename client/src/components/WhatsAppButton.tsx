import { motion } from 'framer-motion';
import { useStoreInfo } from '../hooks/queries';
import { whatsappLink, MESSAGES } from '../lib/whatsapp';
import { WhatsAppIcon } from './icons';

/** Botão flutuante do WhatsApp com anéis de pulso (CSS, só transform/opacity). */
export function WhatsAppButton({ show }: { show: boolean }) {
  const { data: store } = useStoreInfo();

  return (
    <motion.a
      href={whatsappLink(store?.whatsapp, MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] md:bottom-8 md:right-8 md:h-16 md:w-16"
      initial={{ scale: 0, opacity: 0 }}
      animate={show ? { scale: 1, opacity: 1 } : undefined}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: show ? 1.2 : 0 }}
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25D366] motion-reduce:hidden" />
      <WhatsAppIcon className="relative h-7 w-7 md:h-8 md:w-8" />
    </motion.a>
  );
}

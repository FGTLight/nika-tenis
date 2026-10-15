import { formatPrice } from './format';
import type { Product } from '../types';

/**
 * Monta o link wa.me.
 * - Usa o número da API (store-info); se ainda for [COMPLETAR], cai no VITE_WHATSAPP_NUMBER.
 * - Números sem DDI ganham o 55 do Brasil.
 * - Sem número nenhum, abre o WhatsApp com a mensagem pronta para o usuário escolher o contato.
 */
export function whatsappLink(number: string | undefined, message: string) {
  let digits = (number ?? '').replace(/\D/g, '') || (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  if (digits && digits.length <= 11) digits = `55${digits}`;
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export const MESSAGES = {
  general: 'Olá, Nika Tênis! Vim pelo site e gostaria de ver os modelos disponíveis. 👟',
  wholesale: 'Olá, Nika Tênis! Sou revendedor(a) e gostaria de receber o catálogo de atacado.',
  product: (p: Pick<Product, 'name' | 'price'>) =>
    `Olá, Nika Tênis! Quero esse: *${p.name}* (${formatPrice(p.price)}). Tem disponível? 👟`,
};

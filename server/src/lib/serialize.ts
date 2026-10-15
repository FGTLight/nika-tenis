import type { Product, StoreInfo } from '@prisma/client';

/** Converte o produto do banco no formato da API (sizes vira array). */
export function serializeProduct(p: Product) {
  return {
    ...p,
    sizes: p.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Converte os campos JSON (hours/stats) da loja em arrays. */
export function serializeStoreInfo(s: StoreInfo) {
  return {
    ...s,
    hours: safeJson<{ days: string; time: string }[]>(s.hours, []),
    stats: safeJson<{ value: number; suffix?: string; label: string }[]>(s.stats, []),
  };
}

import type { Product, ProductFilters, Review, StoreInfo } from '../types';

/** Base da API: vazio em dev (proxy do Vite) ou a URL do Render/Railway em produção. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Erro com status e erros de campo vindos do backend (Zod). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** fetch com JSON, token opcional e erros padronizados. */
export async function request<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'Erro inesperado', body.fields);
  return body as T;
}

function toQuery(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/* ───────────── Endpoints públicos ───────────── */

export const api = {
  products: (filters?: ProductFilters) => request<Product[]>(`/api/products${toQuery(filters)}`),
  product: (id: string) => request<Product>(`/api/products/${encodeURIComponent(id)}`),
  storeInfo: () => request<StoreInfo>('/api/store-info'),
  reviews: () => request<Review[]>('/api/reviews'),
  createWholesaleLead: (data: { name: string; city: string; whatsapp: string; cnpj?: string; message?: string }) =>
    request<{ ok: true; id: string }>('/api/wholesale-leads', { method: 'POST', body: JSON.stringify(data) }),
};

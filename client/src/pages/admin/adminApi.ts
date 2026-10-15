import { createContext, useContext } from 'react';
import { request } from '../../lib/api';
import type { Product, Review, StoreInfo, WholesaleLead } from '../../types';

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;
export type ReviewInput = Omit<Review, 'id' | 'createdAt'>;

const TOKEN_KEY = 'nika:admin-token';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage bloqueado: token fica só em memória */
    }
  },
};

/** Cria as chamadas do admin já com o token JWT. */
export function createAdminApi(token: string) {
  const r = <T>(path: string, init: RequestInit = {}) => request<T>(`/api/admin${path}`, { ...init, token });
  const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

  return {
    me: () => r<{ ok: true }>('/me'),

    createProduct: (data: ProductInput) => r<Product>('/products', json('POST', data)),
    updateProduct: (id: string, data: ProductInput) => r<Product>(`/products/${id}`, json('PUT', data)),
    deleteProduct: (id: string) => r<void>(`/products/${id}`, { method: 'DELETE' }),

    leads: () => r<WholesaleLead[]>('/wholesale-leads'),
    updateLead: (id: string, status: WholesaleLead['status']) => r<WholesaleLead>(`/wholesale-leads/${id}`, json('PATCH', { status })),
    deleteLead: (id: string) => r<void>(`/wholesale-leads/${id}`, { method: 'DELETE' }),

    reviews: () => r<Review[]>('/reviews'),
    createReview: (data: ReviewInput) => r<Review>('/reviews', json('POST', data)),
    updateReview: (id: string, data: ReviewInput) => r<Review>(`/reviews/${id}`, json('PUT', data)),
    deleteReview: (id: string) => r<void>(`/reviews/${id}`, { method: 'DELETE' }),

    updateStoreInfo: (data: StoreInfo) => r<StoreInfo>('/store-info', json('PUT', data)),
  };
}

export const login = (username: string, password: string) =>
  request<{ token: string }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export type AdminApi = ReturnType<typeof createAdminApi>;

export const AdminApiContext = createContext<AdminApi | null>(null);

export function useAdminApi() {
  const ctx = useContext(AdminApiContext);
  if (!ctx) throw new Error('useAdminApi fora do AdminApiContext');
  return ctx;
}

/** Estilos compartilhados do painel */
export const ui = {
  input: 'input !py-2.5 text-sm',
  label: 'mb-1 block text-xs font-semibold uppercase tracking-widest text-bone/60',
  card: 'rounded-2xl border border-line bg-coal',
  btnSm: 'rounded-lg border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-brand hover:text-brand',
  btnDanger: 'rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-danger hover:bg-danger hover:text-ink',
};

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Product, ProductFilters } from '../types';

/** Chaves centralizadas — o admin invalida estas mesmas chaves após editar. */
export const queryKeys = {
  products: (filters?: ProductFilters) => ['products', filters ?? {}] as const,
  product: (id: string) => ['product', id] as const,
  storeInfo: ['store-info'] as const,
  reviews: ['reviews'] as const,
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => api.products(filters),
    // Mantém a lista anterior na tela enquanto troca de categoria (sem "piscar")
    placeholderData: keepPreviousData,
  });
}

/** Detalhe do produto. Usa o item da lista como dado inicial para abrir o modal instantaneamente. */
export function useProduct(id: string | null, initial?: Product) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ''),
    queryFn: () => api.product(id!),
    enabled: !!id,
    initialData: initial,
    initialDataUpdatedAt: 0, // força revalidar em segundo plano
  });
}

export function useStoreInfo() {
  return useQuery({ queryKey: queryKeys.storeInfo, queryFn: api.storeInfo, staleTime: 10 * 60_000 });
}

export function useReviews() {
  return useQuery({ queryKey: queryKeys.reviews, queryFn: api.reviews, staleTime: 10 * 60_000 });
}

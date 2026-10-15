import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { ApiError } from '../../lib/api';

/**
 * useMutation com o padrão do painel:
 * - invalida as queries informadas (o site público atualiza sozinho);
 * - 401 → desloga;
 * - outros erros → alert simples com a mensagem do backend.
 */
export function useAdminMutation<TVars, TData = unknown>(
  fn: (vars: TVars) => Promise<TData>,
  invalidate: QueryKey[],
  onUnauthorized: () => void,
  onSuccess?: (data: TData) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      onSuccess?.(data);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      const fields = err instanceof ApiError && err.fields ? '\n' + Object.entries(err.fields).map(([k, v]) => `• ${k}: ${v?.join(', ')}`).join('\n') : '';
      alert(`${err.message}${fields}`);
    },
  });
}

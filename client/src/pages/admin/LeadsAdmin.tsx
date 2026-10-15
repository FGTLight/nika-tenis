import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiError } from '../../lib/api';
import { whatsappLink } from '../../lib/whatsapp';
import type { WholesaleLead } from '../../types';
import { ui, useAdminApi } from './adminApi';
import { useAdminMutation } from './useAdminMutation';

const STATUS: Record<WholesaleLead['status'], string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  fechado: 'Fechado',
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** Lista os pedidos de catálogo atacado, com status e atalho para o WhatsApp do lead. */
export function LeadsAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const api = useAdminApi();
  const { data: leads, isPending, error } = useQuery({ queryKey: ['admin', 'leads'], queryFn: api.leads });

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) onUnauthorized();
  }, [error, onUnauthorized]);

  const key = [['admin', 'leads']];
  const update = useAdminMutation(
    ({ id, status }: { id: string; status: WholesaleLead['status'] }) => api.updateLead(id, status),
    key,
    onUnauthorized,
  );
  const remove = useAdminMutation((id: string) => api.deleteLead(id), key, onUnauthorized);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">
        Leads atacado {leads && <span className="text-mute">({leads.length})</span>}
      </h1>

      {isPending && <p className="text-mute">Carregando…</p>}
      {leads?.length === 0 && <p className="text-mute">Nenhum pedido de catálogo ainda.</p>}

      <ul className="grid gap-3">
        {leads?.map((l) => (
          <li key={l.id} className={`${ui.card} grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center`}>
            <div>
              <p className="font-semibold">
                {l.name} <span className="font-normal text-mute">· {l.city}</span>
              </p>
              <p className="text-sm text-bone/80">
                {l.whatsapp}
                {l.cnpj && ` · CNPJ ${l.cnpj}`}
              </p>
              {l.message && <p className="mt-1 text-sm text-bone/60">“{l.message}”</p>}
              <p className="mt-1 text-xs text-mute">{dateFmt.format(new Date(l.createdAt))}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-line bg-ink px-2 py-1.5 text-xs"
                value={l.status}
                onChange={(e) => update.mutate({ id: l.id, status: e.target.value as WholesaleLead['status'] })}
                aria-label="Status do lead"
              >
                {Object.entries(STATUS).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
              <a
                className={ui.btnSm}
                href={whatsappLink(l.whatsapp, `Olá, ${l.name}! Aqui é da Nika Tênis. Recebemos seu pedido do catálogo de atacado.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <button className={ui.btnDanger} onClick={() => confirm(`Excluir o lead de ${l.name}?`) && remove.mutate(l.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

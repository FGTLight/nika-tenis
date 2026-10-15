import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../lib/api';
import { queryKeys } from '../../hooks/queries';
import type { Review } from '../../types';
import { ui, useAdminApi, type ReviewInput } from './adminApi';
import { useAdminMutation } from './useAdminMutation';

const EMPTY: ReviewInput = { author: '', city: '', rating: 5, text: '', featured: true };

function ReviewForm({ initial, onSave, onCancel, saving }: { initial: ReviewInput; onSave: (r: ReviewInput) => void; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <form onSubmit={submit} className={`${ui.card} grid gap-4 p-6 sm:grid-cols-2`}>
      <label>
        <span className={ui.label}>Nome</span>
        <input className={ui.input} required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      </label>
      <label>
        <span className={ui.label}>Cidade</span>
        <input className={ui.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </label>
      <label className="sm:col-span-2">
        <span className={ui.label}>Depoimento</span>
        <textarea className={`${ui.input} min-h-[90px]`} required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
      </label>
      <label>
        <span className={ui.label}>Nota</span>
        <select className={ui.input} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {'★'.repeat(n)} ({n})
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 self-end pb-3 text-sm">
        <input type="checkbox" className="accent-brand" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Exibir no site
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-brand !py-2.5" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="btn-ghost !py-2.5" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ReviewsAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const api = useAdminApi();
  const { data: reviews, error } = useQuery({ queryKey: ['admin', 'reviews'], queryFn: api.reviews });
  const [editing, setEditing] = useState<Review | 'new' | null>(null);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) onUnauthorized();
  }, [error, onUnauthorized]);

  const keys = [['admin', 'reviews'], queryKeys.reviews];
  const save = useAdminMutation(
    (d: ReviewInput) => (editing && editing !== 'new' ? api.updateReview(editing.id, d) : api.createReview(d)),
    keys,
    onUnauthorized,
    () => setEditing(null),
  );
  const remove = useAdminMutation((id: string) => api.deleteReview(id), keys, onUnauthorized);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Avaliações</h1>
        {!editing && (
          <button className="btn-brand !py-2.5" onClick={() => setEditing('new')}>
            + Nova avaliação
          </button>
        )}
      </div>

      {editing && (
        <ReviewForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? EMPTY : editing}
          saving={save.isPending}
          onSave={(d) => save.mutate(d)}
          onCancel={() => setEditing(null)}
        />
      )}

      <ul className="grid gap-3">
        {reviews?.map((r) => (
          <li key={r.id} className={`${ui.card} flex items-start gap-4 p-4`}>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {r.author} <span className="font-normal text-mute">· {r.city}</span>{' '}
                <span className="text-brand">{'★'.repeat(r.rating)}</span>
                {!r.featured && <span className="ml-2 text-xs text-mute">(oculta)</span>}
              </p>
              <p className="mt-1 text-sm text-bone/70">{r.text}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={ui.btnSm} onClick={() => setEditing(r)}>
                Editar
              </button>
              <button className={ui.btnDanger} onClick={() => confirm('Excluir esta avaliação?') && remove.mutate(r.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

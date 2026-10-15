import { useEffect, useState, type FormEvent } from 'react';
import { useStoreInfo, queryKeys } from '../../hooks/queries';
import type { StoreInfo } from '../../types';
import { ui, useAdminApi } from './adminApi';
import { useAdminMutation } from './useAdminMutation';

type TextField = Exclude<keyof StoreInfo, 'hours' | 'stats' | 'latitude' | 'longitude'>;

const FIELDS: { key: TextField; label: string; hint?: string }[] = [
  { key: 'name', label: 'Nome da loja' },
  { key: 'address', label: 'Endereço', hint: 'Rua, número – Bairro' },
  { key: 'city', label: 'Cidade/UF' },
  { key: 'phone', label: 'Telefone', hint: '(54) 0000-0000' },
  { key: 'whatsapp', label: 'WhatsApp', hint: 'Só números com DDD, ex.: 54999999999' },
  { key: 'email', label: 'E-mail' },
  { key: 'facebook', label: 'Facebook (URL)' },
  { key: 'instagram', label: 'Instagram (URL)' },
];

/** Edita endereço, contatos, coordenadas, horários e contadores (substitui os [COMPLETAR]). */
export function StoreAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const api = useAdminApi();
  const { data } = useStoreInfo();
  const [form, setForm] = useState<StoreInfo | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const save = useAdminMutation((d: StoreInfo) => api.updateStoreInfo(d), [queryKeys.storeInfo], onUnauthorized, () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  if (!form) return <p className="text-mute">Carregando…</p>;

  const set = <K extends keyof StoreInfo>(k: K, v: StoreInfo[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(form);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Dados da loja</h1>
        <button className="btn-brand !py-2.5" disabled={save.isPending}>
          {save.isPending ? 'Salvando…' : saved ? 'Salvo ✓' : 'Salvar'}
        </button>
      </div>
      <p className="text-sm text-mute">
        Campos com <code className="text-brand">[COMPLETAR]</code> ainda são placeholders do seed.
      </p>

      <section className={`${ui.card} grid gap-4 p-6 sm:grid-cols-2`}>
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span className={ui.label}>{f.label}</span>
            <input className={ui.input} placeholder={f.hint} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          </label>
        ))}
        <label>
          <span className={ui.label}>Latitude</span>
          <input className={ui.input} type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', Number(e.target.value))} />
        </label>
        <label>
          <span className={ui.label}>Longitude</span>
          <input className={ui.input} type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', Number(e.target.value))} />
        </label>
      </section>

      {/* Horários */}
      <section className={`${ui.card} space-y-3 p-6`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Horários</h2>
          <button type="button" className={ui.btnSm} onClick={() => set('hours', [...form.hours, { days: '', time: '' }])}>
            + Linha
          </button>
        </div>
        {form.hours.map((h, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className={ui.input}
              placeholder="Segunda a Sexta"
              value={h.days}
              onChange={(e) => set('hours', form.hours.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))}
            />
            <input
              className={ui.input}
              placeholder="9h às 18h"
              value={h.time}
              onChange={(e) => set('hours', form.hours.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))}
            />
            <button type="button" className={ui.btnDanger} onClick={() => set('hours', form.hours.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
      </section>

      {/* Contadores */}
      <section className={`${ui.card} space-y-3 p-6`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Contadores da seção Atacado</h2>
          <button type="button" className={ui.btnSm} onClick={() => set('stats', [...form.stats, { value: 0, suffix: '', label: '' }])}>
            + Contador
          </button>
        </div>
        {form.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[100px_70px_1fr_auto] gap-2">
            <input
              className={ui.input}
              type="number"
              value={s.value}
              aria-label="Valor"
              onChange={(e) => set('stats', form.stats.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)))}
            />
            <input
              className={ui.input}
              placeholder="+"
              value={s.suffix ?? ''}
              aria-label="Sufixo"
              onChange={(e) => set('stats', form.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)))}
            />
            <input
              className={ui.input}
              placeholder="Revendedores parceiros"
              value={s.label}
              aria-label="Rótulo"
              onChange={(e) => set('stats', form.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
            />
            <button type="button" className={ui.btnDanger} onClick={() => set('stats', form.stats.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
      </section>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { useProducts } from '../../hooks/queries';
import { formatPrice, CATEGORY_LABEL } from '../../lib/format';
import { ProductImage } from '../../components/SneakerArt';
import { CATEGORIES, type Product } from '../../types';
import { ui, useAdminApi, type ProductInput } from './adminApi';
import { useAdminMutation } from './useAdminMutation';

const EMPTY: ProductInput = {
  name: '',
  slug: '',
  brand: '',
  description: '',
  category: 'masculino',
  price: 0,
  wholesalePrice: null,
  sizes: [],
  featured: false,
  isNew: false,
  imageUrl: '',
  colorPrimary: '#F2EFE9',
  colorSecondary: '#1A1A1A',
  colorAccent: '#FF4F9A',
};

/** Formulário de criar/editar produto. */
function ProductForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: ProductInput;
  saving: boolean;
  onSave: (data: ProductInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [sizesText, setSizesText] = useState(initial.sizes.join(', '));
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...form, // slug vazio → o servidor gera a partir do nome
      sizes: sizesText.split(',').map((s) => s.trim()).filter(Boolean),
      wholesalePrice: form.wholesalePrice || null,
    });
  };

  return (
    <form onSubmit={submit} className={`${ui.card} grid gap-4 p-6 md:grid-cols-[1fr_220px]`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={ui.label}>Nome *</span>
          <input className={ui.input} required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <label>
          <span className={ui.label}>Marca / linha</span>
          <input className={ui.input} value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        </label>
        <label>
          <span className={ui.label}>Categoria *</span>
          <select className={ui.input} value={form.category} onChange={(e) => set('category', e.target.value as Product['category'])}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={ui.label}>Preço varejo (R$) *</span>
          <input className={ui.input} type="number" step="0.01" min="0" required value={form.price || ''} onChange={(e) => set('price', Number(e.target.value))} />
        </label>
        <label>
          <span className={ui.label}>Preço atacado (R$)</span>
          <input
            className={ui.input}
            type="number"
            step="0.01"
            min="0"
            value={form.wholesalePrice ?? ''}
            onChange={(e) => set('wholesalePrice', e.target.value ? Number(e.target.value) : null)}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={ui.label}>Descrição *</span>
          <textarea className={`${ui.input} min-h-[90px]`} required value={form.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label>
          <span className={ui.label}>Tamanhos (separe por vírgula)</span>
          <input className={ui.input} placeholder="38, 39, 40" value={sizesText} onChange={(e) => setSizesText(e.target.value)} />
        </label>
        <label>
          <span className={ui.label}>Slug (URL, opcional)</span>
          <input className={ui.input} placeholder="gerado do nome" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className={ui.label}>URL da foto (opcional)</span>
          <input className={ui.input} type="url" placeholder="https://…" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          {(['colorPrimary', 'colorSecondary', 'colorAccent'] as const).map((k, i) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="color" value={form[k]} onChange={(e) => set(k, e.target.value)} className="h-9 w-9 rounded border border-line bg-transparent" />
              {['Cor principal', 'Cor secundária', 'Cor destaque'][i]}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-brand" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} className="accent-brand" /> Lançamento
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="aspect-square rounded-xl bg-ink p-3">
          <ProductImage product={{ ...form, id: 'preview', createdAt: '' } as Product} />
        </div>
        <button className="btn-brand" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ProductsAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const api = useAdminApi();
  const { data: products, isPending } = useProducts();
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const invalidate = [['products'], ['product']];
  const save = useAdminMutation(
    (data: ProductInput) => (editing && editing !== 'new' ? api.updateProduct(editing.id, data) : api.createProduct(data)),
    invalidate,
    onUnauthorized,
    () => setEditing(null),
  );
  const remove = useAdminMutation((id: string) => api.deleteProduct(id), invalidate, onUnauthorized);

  if (editing) {
    const initial = editing === 'new' ? EMPTY : (({ id: _id, createdAt: _c, ...rest }) => rest)(editing);
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl">{editing === 'new' ? 'Novo produto' : `Editar: ${editing.name}`}</h1>
        <ProductForm initial={initial} saving={save.isPending} onSave={(d) => save.mutate(d)} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Produtos {products && <span className="text-mute">({products.length})</span>}</h1>
        <button className="btn-brand !py-2.5" onClick={() => setEditing('new')}>
          + Novo produto
        </button>
      </div>

      {isPending && <p className="text-mute">Carregando…</p>}

      <ul className="grid gap-3">
        {products?.map((p) => (
          <li key={p.id} className={`${ui.card} flex items-center gap-4 p-3`}>
            <div className="h-16 w-16 shrink-0 rounded-lg bg-ink p-1">
              <ProductImage product={p} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {p.name} {p.featured && <span className="text-xs text-brand">★ destaque</span>}{' '}
                {p.isNew && <span className="text-xs text-brand">lançamento</span>}
              </p>
              <p className="text-sm text-mute">
                {CATEGORY_LABEL[p.category]} · {formatPrice(p.price)}
                {p.wholesalePrice ? ` · atacado ${formatPrice(p.wholesalePrice)}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={ui.btnSm} onClick={() => setEditing(p)}>
                Editar
              </button>
              <button
                className={ui.btnDanger}
                disabled={remove.isPending}
                onClick={() => confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`) && remove.mutate(p.id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

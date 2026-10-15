const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 299.9 → "R$ 299,90" */
export const formatPrice = (value: number) => brl.format(value);

/** Rótulos amigáveis das categorias */
export const CATEGORY_LABEL: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  infantil: 'Infantil',
  esportivo: 'Esportivo',
};

/** Detecta placeholders [COMPLETAR] para não exibir links quebrados. */
export const isPlaceholder = (value?: string | null) => !value || value.includes('[COMPLETAR]');

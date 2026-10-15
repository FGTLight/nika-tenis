import { z } from 'zod';

/** Categorias aceitas no catálogo */
export const CATEGORIES = ['masculino', 'feminino', 'infantil', 'esportivo'] as const;

const hexColor = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Cor inválida (use #RRGGBB)');

/* ───────────── Produtos ───────────── */

/** Filtros de GET /api/products (?category=&featured=true&minPrice=&maxPrice=) */
export const ProductQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

/** Corpo para criar/editar produto no admin */
export const ProductInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  // Vazio → gerado a partir do nome
  slug: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => v === undefined || /^[a-z0-9-]+$/.test(v), 'Use só letras minúsculas, números e hífen'),
  brand: z.string().trim().max(60).default(''),
  description: z.string().trim().min(5).max(2000),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().positive(),
  wholesalePrice: z.coerce.number().positive().nullable().optional(),
  sizes: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  imageUrl: z.union([z.string().url(), z.literal('')]).default(''),
  colorPrimary: hexColor.default('#F2EFE9'),
  colorSecondary: hexColor.default('#1A1A1A'),
  colorAccent: hexColor.default('#FF4F9A'),
});

/* ───────────── Leads atacado ───────────── */

/** Remove tudo que não é dígito */
const digits = (v: string) => v.replace(/\D/g, '');

export const WholesaleLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(100),
  city: z.string().trim().min(2, 'Informe sua cidade').max(100),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => digits(v).length >= 10 && digits(v).length <= 13, 'WhatsApp inválido (com DDD)'),
  cnpj: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || digits(v).length === 14, 'CNPJ deve ter 14 dígitos'),
  message: z.string().trim().max(1000).optional().default(''),
});

export const LeadStatusSchema = z.object({
  status: z.enum(['novo', 'contatado', 'fechado']),
});

/* ───────────── Avaliações ───────────── */

export const ReviewInputSchema = z.object({
  author: z.string().trim().min(2).max(80),
  city: z.string().trim().max(80).default(''),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(3).max(600),
  featured: z.boolean().default(true),
});

/* ───────────── Loja ───────────── */

export const StoreInfoInputSchema = z.object({
  name: z.string().trim().min(2),
  address: z.string().trim().min(2),
  city: z.string().trim().min(2),
  phone: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
  email: z.string().trim().default(''),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  facebook: z.string().trim().default(''),
  instagram: z.string().trim().default(''),
  hours: z.array(z.object({ days: z.string().min(1), time: z.string().min(1) })).default([]),
  stats: z
    .array(z.object({ value: z.coerce.number(), suffix: z.string().optional(), label: z.string().min(1) }))
    .default([]),
});

/* ───────────── Auth ───────────── */

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

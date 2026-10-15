import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { serializeProduct, serializeStoreInfo } from '../lib/serialize.js';
import { env } from '../config/env.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import {
  LeadStatusSchema,
  LoginSchema,
  ProductInputSchema,
  ReviewInputSchema,
  StoreInfoInputSchema,
} from '../schemas/index.js';

export const adminRouter = Router();

/** Comparação em tempo constante (evita timing attacks na senha). */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** "Tênis Air Max" → "tenis-air-max" */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Converte o body validado no formato do banco (sizes array → string). */
function toProductData(input: ReturnType<typeof ProductInputSchema.parse>) {
  const { sizes, slug, ...rest } = input;
  return { ...rest, slug: slug || slugify(input.name), sizes: sizes.join(',') };
}

/* ───────────── Login ───────────── */

/** POST /api/admin/login → { token } */
adminRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = LoginSchema.parse(req.body);
    const ok = safeEqual(username, env.ADMIN_USER) && safeEqual(password, env.ADMIN_PASSWORD);
    if (!ok) throw new HttpError(401, 'Usuário ou senha incorretos');
    res.json({ token: signAdminToken(username) });
  }),
);

// Tudo abaixo exige JWT válido
adminRouter.use(requireAdmin);

adminRouter.get('/me', (_req, res) => {
  res.json({ ok: true });
});

/* ───────────── Produtos (CRUD) ───────────── */

adminRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = toProductData(ProductInputSchema.parse(req.body));
    const product = await prisma.product.create({ data });
    res.status(201).json(serializeProduct(product));
  }),
);

adminRouter.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const data = toProductData(ProductInputSchema.parse(req.body));
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(serializeProduct(product));
  }),
);

adminRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);

/* ───────────── Leads atacado ───────────── */

adminRouter.get(
  '/wholesale-leads',
  asyncHandler(async (_req, res) => {
    const leads = await prisma.wholesaleLead.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(leads);
  }),
);

adminRouter.patch(
  '/wholesale-leads/:id',
  asyncHandler(async (req, res) => {
    const { status } = LeadStatusSchema.parse(req.body);
    const lead = await prisma.wholesaleLead.update({ where: { id: req.params.id }, data: { status } });
    res.json(lead);
  }),
);

adminRouter.delete(
  '/wholesale-leads/:id',
  asyncHandler(async (req, res) => {
    await prisma.wholesaleLead.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);

/* ───────────── Avaliações (CRUD) ───────────── */

adminRouter.get(
  '/reviews',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.review.findMany({ orderBy: { createdAt: 'desc' } }));
  }),
);

adminRouter.post(
  '/reviews',
  asyncHandler(async (req, res) => {
    const review = await prisma.review.create({ data: ReviewInputSchema.parse(req.body) });
    res.status(201).json(review);
  }),
);

adminRouter.put(
  '/reviews/:id',
  asyncHandler(async (req, res) => {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: ReviewInputSchema.parse(req.body),
    });
    res.json(review);
  }),
);

adminRouter.delete(
  '/reviews/:id',
  asyncHandler(async (req, res) => {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);

/* ───────────── Dados da loja ───────────── */

adminRouter.put(
  '/store-info',
  asyncHandler(async (req, res) => {
    const input = StoreInfoInputSchema.parse(req.body);
    const data = { ...input, hours: JSON.stringify(input.hours), stats: JSON.stringify(input.stats) };
    const info = await prisma.storeInfo.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    res.json(serializeStoreInfo(info));
  }),
);

import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { serializeProduct, serializeStoreInfo } from '../lib/serialize.js';
import { sendWholesaleLeadEmail } from '../lib/mailer.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { ProductQuerySchema, WholesaleLeadSchema } from '../schemas/index.js';

/** Rotas públicas consumidas pelo site */
export const publicRouter = Router();

/**
 * GET /api/products
 * Filtros: ?category=masculino|feminino|infantil|esportivo  ?featured=true  ?minPrice=  ?maxPrice=
 */
publicRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const q = ProductQuerySchema.parse(req.query);

    const where: Prisma.ProductWhereInput = {};
    if (q.category) where.category = q.category;
    if (q.featured !== undefined) where.featured = q.featured;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = { gte: q.minPrice, lte: q.maxPrice };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { isNew: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(products.map(serializeProduct));
  }),
);

/** GET /api/products/:id — aceita id ou slug */
publicRouter.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!product) throw new HttpError(404, 'Produto não encontrado');
    res.json(serializeProduct(product));
  }),
);

/** POST /api/wholesale-leads — formulário de revendedores */
publicRouter.post(
  '/wholesale-leads',
  formLimiter,
  asyncHandler(async (req, res) => {
    const data = WholesaleLeadSchema.parse(req.body);
    const lead = await prisma.wholesaleLead.create({ data });

    // O e-mail não bloqueia a resposta: se o SMTP falhar, o lead já está salvo.
    sendWholesaleLeadEmail(lead).catch((err) => console.error('Falha ao enviar e-mail do lead:', err));

    res.status(201).json({ ok: true, id: lead.id });
  }),
);

/** GET /api/store-info — endereço, horários, contatos e coordenadas */
publicRouter.get(
  '/store-info',
  asyncHandler(async (_req, res) => {
    const info = await prisma.storeInfo.findUnique({ where: { id: 1 } });
    if (!info) throw new HttpError(404, 'Dados da loja não cadastrados (rode o seed)');
    res.json(serializeStoreInfo(info));
  }),
);

/** GET /api/reviews — avaliações em destaque */
publicRouter.get(
  '/reviews',
  asyncHandler(async (_req, res) => {
    const reviews = await prisma.review.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(reviews);
  }),
);

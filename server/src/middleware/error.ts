import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http.js';
import { env } from '../config/env.js';

/** 404 para rotas /api inexistentes */
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
};

/**
 * Tratamento centralizado de erros.
 * Toda rota pode simplesmente lançar (throw) — a resposta padronizada sai daqui.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Validação Zod → 400 com erros por campo (usado pelo formulário no front)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      fields: err.flatten().fieldErrors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe um registro com esse valor' });
  }

  // JSON malformado no body
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  console.error('💥', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(env.isProd ? {} : { detail: String(err?.message ?? err) }),
  });
};

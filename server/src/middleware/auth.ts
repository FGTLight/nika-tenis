import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../lib/http.js';

export interface AdminTokenPayload {
  sub: string;
  role: 'admin';
}

export function signAdminToken(username: string) {
  const payload: AdminTokenPayload = { sub: username, role: 'admin' };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

/** Exige header `Authorization: Bearer <token>` válido. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Não autenticado'));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
    if (payload.role !== 'admin') throw new Error('role');
    next();
  } catch {
    next(new HttpError(401, 'Sessão expirada ou inválida'));
  }
};

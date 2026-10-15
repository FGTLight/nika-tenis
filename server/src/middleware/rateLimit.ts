import rateLimit from 'express-rate-limit';

const message = { error: 'Muitas tentativas. Tente novamente em alguns minutos.' };

/** Formulários públicos: 5 envios a cada 15 min por IP (anti-spam). */
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
});

/** Login do admin: 10 tentativas a cada 15 min por IP (anti força-bruta). */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
});

/** Limite geral da API, folgado — só evita abuso. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
});

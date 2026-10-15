import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/error.js';

/** Monta o app Express (separado do listen para facilitar testes). */
export function createApp() {
  const app = express();

  // Atrás de proxy (Render/Railway) o IP real vem no X-Forwarded-For — necessário pro rate-limit.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Requisições sem Origin (curl, health checks) passam; navegadores precisam estar na lista.
        // Origem desconhecida: sem cabeçalhos CORS → o navegador bloqueia (sem gerar erro 500 no servidor)
        cb(null, !origin || env.corsOrigins.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', apiLimiter);
  app.use('/api', publicRouter);
  app.use('/api/admin', adminRouter);

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}

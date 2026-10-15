import 'dotenv/config';
import { z } from 'zod';

/**
 * Variáveis de ambiente validadas na inicialização.
 * Se algo obrigatório faltar, o servidor nem sobe — melhor do que falhar em produção.
 */
const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),

  ADMIN_USER: z.string().min(1).default('admin'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD precisa de pelo menos 6 caracteres'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa de pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Nika Tênis Site <no-reply@nikatenis.com.br>'),
  MAIL_TO: z.string().optional().default(''),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:\n', parsed.error.flatten().fieldErrors);
  console.error('   Copie server/.env.example para server/.env e preencha os valores.');
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  /** Lista de origens permitidas no CORS */
  corsOrigins: parsed.data.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
};

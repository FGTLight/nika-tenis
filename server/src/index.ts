import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`👟 API Nika Tênis rodando em http://localhost:${env.PORT}`);
});

// Encerramento limpo (Render/Railway mandam SIGTERM no deploy)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

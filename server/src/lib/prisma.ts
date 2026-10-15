import { PrismaClient } from '@prisma/client';

/** Instância única do Prisma (evita abrir várias conexões no hot-reload do tsx). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

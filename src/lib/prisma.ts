import { PrismaClient } from '@prisma/client';

// Zorg dat Prisma maar één keer wordt aangemaakt (belangrijk voor Vercel)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Gebruik de library engine (vereist voor Vercel)
const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export const prisma = prismaClient;

// Cache Prisma instance in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

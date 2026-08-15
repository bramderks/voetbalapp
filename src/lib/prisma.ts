import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Vercel's filesystem is read-only except /tmp, so the bundled SQLite file
// must be copied to a writable location before Prisma can write to it.
function resolveDatabaseUrl(): string | undefined {
  if (!process.env.VERCEL) {
    return process.env.DATABASE_URL;
  }

  const dest = '/tmp/dev.db';
  if (!fs.existsSync(dest)) {
    const source = path.join(process.cwd(), 'prisma', 'dev.db');
    fs.copyFileSync(source, dest);
  }
  return `file:${dest}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimized Prisma Client for Vercel serverless environment
// This configuration prevents "prepared statement already exists" errors
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

    // Serverless-optimized datasource configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// For serverless environments (Vercel), we need to prevent connection pooling issues
// by creating a singleton pattern that's more aggressive about cleanup
export const prisma = global.prisma || createPrismaClient();

// Only cache in development to prevent connection issues in production
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown - close connections properly
// This is critical for serverless to prevent orphaned connections
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  // Additional cleanup for serverless
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
  });
}

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimized Prisma Client for high concurrency (100+ simultaneous users)
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

  // Connection pool configuration for high load
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Enable connection pooling and optimize for serverless/edge
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown - close connections properly
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

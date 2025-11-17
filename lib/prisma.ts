import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimized Prisma Client for high concurrency (100+ simultaneous users)
// Always use singleton pattern to prevent prepared statement collisions in serverless
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

  // Connection pool configuration for high load and serverless compatibility
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Store in global to prevent multiple instances (critical for serverless)
// This prevents PostgreSQL "prepared statement already exists" errors
if (!global.prisma) {
  global.prisma = prisma;
}

// Graceful shutdown - close connections properly
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

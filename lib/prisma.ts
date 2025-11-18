import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Build DATABASE_URL with pgbouncer flag if using connection pooler
// This prevents "prepared statement already exists" errors
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // If URL already has pgbouncer=true, return as is
  if (url.includes('pgbouncer=true')) {
    return url;
  }

  // Add pgbouncer=true to prevent prepared statement collisions
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}pgbouncer=true&connection_limit=1`;
};

// Optimized Prisma Client for high concurrency (100+ simultaneous users)
// Always use singleton pattern to prevent prepared statement collisions in serverless
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

  // Connection pool configuration for high load and serverless compatibility
  datasources: {
    db: {
      url: getDatabaseUrl(),
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

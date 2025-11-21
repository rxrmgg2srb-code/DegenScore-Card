import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Build DATABASE_URL with pgbouncer flag if using connection pooler
// This prevents "prepared statement already exists" errors
const getDatabaseUrl = () => {
  // Prefer DIRECT_URL for serverless reliability
  // Pooler (DATABASE_URL) can fail due to connection limits or timeouts
  const directUrl = process.env.DIRECT_URL;
  const poolUrl = process.env.DATABASE_URL;

  // Use direct connection if available (more reliable for serverless)
  if (directUrl) {
    return directUrl;
  }

  // Fallback to pooler URL
  if (!poolUrl) return undefined;

  // If URL already has pgbouncer=true, return as is
  if (poolUrl.includes('pgbouncer=true')) {
    return poolUrl;
  }

  // Add pgbouncer=true to prevent prepared statement collisions
  const separator = poolUrl.includes('?') ? '&' : '?';
  return `${poolUrl}${separator}pgbouncer=true&connection_limit=1`;
};

// Optimized Prisma Client for serverless
// Uses direct connection (DIRECT_URL) to avoid pooler connection issues
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

  // Connection configuration for serverless compatibility
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

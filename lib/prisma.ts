import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Build DATABASE_URL with pgbouncer flag if using connection pooler
// This prevents "prepared statement already exists" errors
const getDatabaseUrl = () => {
  // Prefer POOLER URL (DATABASE_URL) for serverless application logic
  const directUrl = process.env.DIRECT_URL;
  const poolUrl = process.env.DATABASE_URL;

  // If pooler URL is available, use it
  if (poolUrl) {
    let url = poolUrl;
    const hasQueryParams = url.includes('?');
    const separator = hasQueryParams ? '&' : '?';

    // Check if we are using the Supabase transaction pooler (port 6543)
    if (url.includes(':6543')) {
      // Ensure pgbouncer=true is present for Prisma to work with the pooler
      if (!url.includes('pgbouncer=')) {
        url += `${separator}pgbouncer=true`;
      }
      // Add connection_limit=1 for serverless to avoid exhausting the pool
      if (!url.includes('connection_limit=')) {
        url += `&connection_limit=1`;
      }
    }

    // Ensure sslmode=require (CRITICAL for Supabase)
    if (!url.includes('sslmode=')) {
      url += `${url.includes('?') ? '&' : '?'}sslmode=require`;
    }

    return url;
  }

  // Fallback to direct connection if pooler is missing
  return directUrl;
};

// Optimized Prisma Client for serverless
// Uses direct connection (DIRECT_URL) to avoid pooler connection issues
const shouldInstantiate = !process.env.SKIP_DB_CONNECTION;

export const prisma = global.prisma || (shouldInstantiate ? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

  // Connection configuration for serverless compatibility
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
}) : {} as PrismaClient);

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

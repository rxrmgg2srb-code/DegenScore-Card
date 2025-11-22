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

// Prisma Client with retry logic for production reliability
const prismaClientSingleton = () => {
  const databaseUrl = getDatabaseUrl();

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // CRITICAL: Connection pooling + retry logic para evitar fallos
    // https://www.prisma.io/docs/concepts/components/prisma-client/connection-management
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await query(args);
          } catch (error: any) {
            const isLastAttempt = attempt === maxRetries;
            const isRetryableError =
              error.code === 'P1001' ||  // Can't reach database
              error.code === 'P1017' ||  // Server closed connection
              error.code === 'P2024' ||  // Timed out
              error.message?.includes('Connection') ||
              error.message?.includes('ECONNREFUSED') ||
              error.message?.includes('ETIMEDOUT');

            if (isRetryableError && !isLastAttempt) {
              const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
              console.warn(`⚠️ Database error on ${model}.${operation} (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);
              console.warn(`🔄 Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }

            // No es retryable o ya agotamos los intentos
            throw error;
          }
        }
      },
    },
  });
};

export const prisma = global.prisma ?? prismaClientSingleton();

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

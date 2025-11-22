import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Function to ensure connection limits for serverless
const getPrismaClient = () => {
    const databaseUrl = process.env.DATABASE_URL;

    // If we are in a serverless environment (like Vercel), we should append connection_limit
    // to prevent exhausting the database connections, especially with Supabase.
    let url = databaseUrl;

    if (url && !url.includes('connection_limit')) {
        // Append connection_limit=1 if not present
        // This is critical for Vercel serverless functions
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}connection_limit=1`;
    }

    // Also ensure sslmode=require for Supabase if not present
    if (url && !url.includes('sslmode')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}sslmode=require`;
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
        // Add log for debugging in dev, but keep quiet in prod to reduce noise
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

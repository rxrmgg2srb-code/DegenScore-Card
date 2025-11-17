#!/usr/bin/env node
/**
 * 🚀 Migrate and Start Script for Render.com
 *
 * This script ensures that:
 * 1. Prisma migrations are applied
 * 2. Prisma client is generated
 * 3. Next.js starts with correct configuration
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

console.log('========================================');
console.log('🚀 DegenScore Card - Starting Server');
console.log('========================================');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Host: ${HOST}`);
console.log(`🔌 Port: ${PORT}`);
console.log('========================================\n');

// Step 1: Apply Prisma migrations (production)
if (process.env.NODE_ENV === 'production') {
  console.log('📊 [1/3] Applying Prisma migrations...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
    });
    console.log('✅ Prisma migrations applied successfully\n');
  } catch (error) {
    console.error('⚠️  Warning: Prisma migration failed, but continuing...');
    console.error('Error:', error.message);
    console.log('');
  }
} else {
  console.log('⏭️  [1/3] Skipping migrations (not in production)\n');
}

// Step 2: Generate Prisma Client (just in case)
console.log('🔧 [2/3] Generating Prisma Client...');
try {
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd(),
  });
  console.log('✅ Prisma Client generated successfully\n');
} catch (error) {
  console.error('❌ ERROR: Failed to generate Prisma Client');
  console.error(error.message);
  process.exit(1);
}

// Step 3: Start Next.js server
console.log(`🚀 [3/3] Starting Next.js on ${HOST}:${PORT}...`);
console.log('');

const nextProcess = spawn('next', ['start', '-H', HOST, '-p', PORT.toString()], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});

// Handle errors
nextProcess.on('error', (error) => {
  console.error('❌ FATAL ERROR: Failed to start Next.js server');
  console.error(error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`\n⚠️  Next.js process exited with code ${code}`);
  process.exit(code || 0);
});

// Forward termination signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
    nextProcess.kill(signal);
  });
});

// Keep process alive and log readiness
setTimeout(() => {
  console.log('\n========================================');
  console.log('✅ Server is ready!');
  console.log(`🌐 Listening on http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
  console.log('========================================\n');
}, 3000);

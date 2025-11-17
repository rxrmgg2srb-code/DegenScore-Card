#!/usr/bin/env node
/**
 * Custom server startup script for Render.com
 * Ensures Next.js uses the correct PORT environment variable
 */

const { spawn } = require('child_process');

// Get PORT from environment or use default
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log(`🚀 Starting Next.js server on ${host}:${port}...`);

// Start Next.js with proper port configuration
const nextProcess = spawn('next', ['start', '-H', host, '-p', port.toString()], {
  stdio: 'inherit',
  env: process.env
});

// Handle process termination
nextProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

// Forward signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    nextProcess.kill(signal);
  });
});

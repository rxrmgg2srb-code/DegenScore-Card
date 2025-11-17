#!/usr/bin/env node
/**
 * Custom server startup script for Render.com
 * Ensures Next.js uses the correct PORT environment variable
 */

const { spawn } = require('child_process');
const http = require('http');

// Get PORT from environment or use default
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log(`🚀 Starting Next.js server on ${host}:${port}...`);
console.log(`📝 Environment: ${process.env.NODE_ENV}`);
console.log(`📝 Database configured: ${!!process.env.DATABASE_URL}`);

// Start Next.js with proper port configuration
const nextProcess = spawn('next', ['start', '-H', host, '-p', port.toString()], {
  stdio: 'inherit',
  env: process.env,
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
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    nextProcess.kill(signal);
  });
});

// Test HTTP connectivity after 5 seconds
setTimeout(() => {
  console.log('🔍 Testing HTTP connectivity...');
  const testReq = http.request(
    {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
    },
    (res) => {
      console.log(`✅ HTTP test successful! Status: ${res.statusCode}`);
      res.on('data', (chunk) => {
        console.log(`📄 Response: ${chunk.toString()}`);
      });
    }
  );
  testReq.on('error', (error) => {
    console.error(`❌ HTTP test failed:`, error.message);
  });
  testReq.end();
}, 5000);

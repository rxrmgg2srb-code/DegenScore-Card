#!/usr/bin/env node
/**
 * Custom server startup script for Render.com
 * Uses Next.js programmatic API to ensure immediate port binding
 */

const http = require('http');
const next = require('next');

// Get PORT from environment or use default
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

console.log(`🚀 Starting Next.js server on ${host}:${port}...`);
console.log(`📊 Environment: ${dev ? 'development' : 'production'}`);

// Initialize Next.js app
const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

// Prepare Next.js and start server
app
  .prepare()
  .then(() => {
    // Create HTTP server
    const server = http.createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Start listening
    server.listen(port, host, (err) => {
      if (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
      }
      console.log(`✅ Server listening on http://${host}:${port}`);
      console.log(`📡 Ready to accept connections`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.on(signal, () => shutdown(signal));
    });
  })
  .catch((err) => {
    console.error('❌ Failed to prepare Next.js:', err);
    process.exit(1);
  });

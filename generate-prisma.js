#!/usr/bin/env node
// Script to generate Prisma Client using the locally installed version
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  // Try to find prisma CLI in multiple possible locations
  const possiblePaths = [
    path.join(__dirname, 'node_modules', '.bin', 'prisma'),
    path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js'),
    path.join(__dirname, 'node_modules', '@prisma', 'cli', 'build', 'index.js'),
  ];

  let prismaPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      prismaPath = p;
      break;
    }
  }

  if (!prismaPath) {
    // If we can't find it, try using the prisma package directly with require.resolve
    try {
      const prismaPkg = require.resolve('prisma');
      const prismaDir = path.dirname(prismaPkg);
      // Look for the CLI entry point
      const cliPath = path.join(prismaDir, '..', 'build', 'index.js');
      if (fs.existsSync(cliPath)) {
        prismaPath = cliPath;
      }
    } catch (e) {
      // Ignore
    }
  }

  console.log('Generating Prisma Client...');

  if (prismaPath) {
    console.log(`Using Prisma from: ${prismaPath}`);
    execSync(`node "${prismaPath}" generate`, { stdio: 'inherit', cwd: __dirname });
  } else {
    // Last resort: use npx with --yes to avoid prompts
    console.log('Using npx as fallback...');
    execSync('npx --yes prisma@5.22.0 generate', { stdio: 'inherit', cwd: __dirname });
  }

  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

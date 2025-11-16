#!/usr/bin/env node
// Script to generate Prisma Client using the locally installed version
const { execSync } = require('child_process');
const path = require('path');

try {
  const prismaPath = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
  console.log('Generating Prisma Client...');
  execSync(`node "${prismaPath}" generate`, { stdio: 'inherit' });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

#!/bin/bash
# Vercel Build Script with Database Migrations
# This script runs Prisma migrations during Vercel deployment

set -e  # Exit on error

echo "========================================="
echo "🚀 Vercel Build - DegenScore Card"
echo "========================================="
echo ""

# Step 1: Apply Prisma migrations
echo "📊 [1/3] Applying Prisma migrations..."
echo ""

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set"
  echo "Skipping migrations - this may cause runtime errors!"
  echo ""
else
  # Try to run migrations, but don't fail the build if they error
  if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully"
    echo ""

    # Verify migration status
    echo "📋 Verifying migration status..."
    npx prisma migrate status || true
    echo ""
  else
    echo "⚠️  WARNING: Migration failed, but continuing build..."
    echo "This may cause runtime errors if database schema is out of sync."
    echo "Please check DATABASE_URL and database permissions."
    echo ""
  fi
fi

# Step 2: Generate Prisma Client
echo "🔧 [2/3] Generating Prisma Client..."
echo ""
npx prisma generate
echo "✅ Prisma Client generated successfully"
echo ""

# Step 3: Build Next.js
echo "🏗️  [3/3] Building Next.js application..."
echo ""
NODE_OPTIONS='--max-old-space-size=4096' npm run build
echo ""

echo "========================================="
echo "✅ Build completed successfully!"
echo "========================================="

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
  echo "🔍 Checking DATABASE_URL configuration..."
  if [[ "$DATABASE_URL" == *":5432"* ]]; then
    echo "✅ Direct connection detected (port 5432)"
  elif [[ "$DATABASE_URL" == *":6543"* ]] && [[ "$DATABASE_URL" == *"pgbouncer=true"* ]]; then
    echo "✅ Connection pooling detected (port 6543)"
  elif [[ "$DATABASE_URL" == *":6543"* ]]; then
    echo "⚠️  WARNING: Port 6543 detected but missing pgbouncer=true"
    echo "For pooler, add: ?pgbouncer=true&connection_limit=1"
  else
    echo "ℹ️  Using custom DATABASE_URL configuration"
  fi
  echo ""

  # Try to run migrations with timeout, but don't fail the build if they error
  echo "⏱️  Running migrations (60s timeout)..."
  if timeout 60 npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully"
    echo ""

    # Verify migration status
    echo "📋 Verifying migration status..."
    timeout 30 npx prisma migrate status || true
    echo ""
  else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
      echo "❌ ERROR: Migration timed out after 60 seconds"
      echo ""
      echo "This usually means:"
      echo "1. Connection pooler (port 6543) is timing out from Vercel"
      echo "2. Database credentials are incorrect"
      echo "3. Database is unreachable or paused"
      echo ""
      echo "💡 SOLUTION: Use Direct Connection instead of pooler"
      echo "   Format: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require"
      echo "   See SUPABASE_DIRECT_CONNECTION.md for details"
      echo ""
      echo "Please check your Vercel environment variables:"
      echo "👉 https://vercel.com/[your-team]/[your-project]/settings/environment-variables"
      echo ""
      exit 1
    else
      echo "⚠️  WARNING: Migration failed (exit code: $EXIT_CODE), but continuing build..."
      echo "This may cause runtime errors if database schema is out of sync."
      echo "Please check DATABASE_URL and database permissions."
      echo ""
    fi
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

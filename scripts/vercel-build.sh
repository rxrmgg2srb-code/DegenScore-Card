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
  if [[ "$DATABASE_URL" == *"pgbouncer=true"* ]]; then
    echo "✅ PgBouncer parameter detected"
  else
    echo "⚠️  WARNING: DATABASE_URL missing pgbouncer=true parameter"
    echo "For Supabase, use: ?pgbouncer=true&connection_limit=1"
  fi
  echo ""

  # Try to run migrations with timeout, but don't fail the build if they error
  echo "⏱️  Running migrations (60s timeout)..."
  MIGRATION_OUTPUT=$(timeout 60 npx prisma migrate deploy 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Migrations applied successfully"
    echo ""

    # Verify migration status
    echo "📋 Verifying migration status..."
    timeout 30 npx prisma migrate status || true
    echo ""
  elif [ $EXIT_CODE -eq 124 ]; then
    echo "❌ ERROR: Migration timed out after 60 seconds"
    echo ""
    echo "This usually means:"
    echo "1. DATABASE_URL is missing pgbouncer=true parameter"
    echo "2. Database credentials are incorrect"
    echo "3. Database is unreachable from Vercel"
    echo ""
    echo "Please check your Vercel environment variables:"
    echo "👉 https://vercel.com/[your-team]/[your-project]/settings/environment-variables"
    echo ""
    exit 1
  elif echo "$MIGRATION_OUTPUT" | grep -q "P3005"; then
    echo "⚠️  Database schema already exists (P3005)"
    echo "Syncing schema with db push..."
    echo ""
    if timeout 60 npx prisma db push --skip-generate --accept-data-loss; then
      echo "✅ Schema synced successfully"
      echo ""
    else
      echo "⚠️  WARNING: Schema sync failed, but continuing build..."
      echo "Database may already be up to date."
      echo ""
    fi
  else
    echo "$MIGRATION_OUTPUT"
    echo ""
    echo "⚠️  WARNING: Migration failed (exit code: $EXIT_CODE), but continuing build..."
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

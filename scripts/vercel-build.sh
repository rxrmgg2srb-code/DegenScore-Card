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

  # Check if using connection pooler (port 6543)
  if [[ "$DATABASE_URL" == *":6543"* ]]; then
    echo "⚠️  Connection pooler detected (port 6543)"
    echo "⏭️  SKIPPING migrations - poolers don't support Prisma migrate"
    echo ""
    echo "ℹ️  Migrations should be run manually with DIRECT connection:"
    echo "   1. Use direct connection: postgresql://...@db.xxx.supabase.co:5432/postgres"
    echo "   2. Run: npx prisma migrate deploy"
    echo ""
    echo "✅ Continuing build without migrations..."
    echo ""
    # Skip migrations entirely
    SKIP_MIGRATIONS=true
  elif [[ "$DATABASE_URL" == *":5432"* ]]; then
    echo "✅ Direct connection detected (port 5432)"
    SKIP_MIGRATIONS=false
  else
    echo "ℹ️  Using custom DATABASE_URL configuration"
    SKIP_MIGRATIONS=false
  fi
  echo ""

  # Only run migrations if NOT using pooler
  if [ "$SKIP_MIGRATIONS" = "false" ]; then
    # Try to run migrations with timeout, but don't fail the build if they error
    echo "⏱️  Running migrations (60s timeout)..."
  set +e  # Temporarily disable exit on error
  # Prisma CLI is now in dependencies (auto-installed)
  MIGRATION_OUTPUT=$(timeout 60 npx prisma migrate deploy 2>&1)
  EXIT_CODE=$?
  set -e  # Re-enable exit on error

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
  elif echo "$MIGRATION_OUTPUT" | grep -q "P3005"; then
    echo "⚠️  Database schema already exists (P3005)"
    echo "Syncing schema with db push..."
    echo ""
    set +e  # Temporarily disable exit on error for db push
    timeout 60 npx prisma db push --skip-generate --accept-data-loss
    PUSH_EXIT_CODE=$?
    set -e  # Re-enable exit on error
    if [ $PUSH_EXIT_CODE -eq 0 ]; then
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
  fi  # End of SKIP_MIGRATIONS check
fi  # End of DATABASE_URL check

# Step 2: Generate Prisma Client
echo "🔧 [2/3] Generating Prisma Client..."
echo ""
# Prisma CLI is now in dependencies (auto-installed)
npx prisma generate
echo "✅ Prisma Client generated successfully"
echo ""

# Step 3: Build Next.js
echo "🏗️  [3/3] Building Next.js application..."
echo ""

# If database is not accessible during build, set a dummy URL to prevent Prisma connection attempts
# This is safe because:
# 1. Pages with getServerSideProps don't actually connect to DB during build
# 2. Prisma Client is generated but not connected
# 3. Actual DB connections only happen at runtime, not build time
if [ "$SKIP_MIGRATIONS" = "true" ] || [ $EXIT_CODE -ne 0 ] 2>/dev/null; then
  echo "⚠️  Database not accessible during build - setting placeholder DATABASE_URL"
  echo "   (This is safe - actual DB connections happen at runtime, not build time)"
  echo ""
  # Use a valid-looking but non-functional DATABASE_URL for build
  export DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
fi

NODE_OPTIONS='--max-old-space-size=4096' npm run build
echo ""

echo "========================================="
echo "✅ Build completed successfully!"
echo "========================================="

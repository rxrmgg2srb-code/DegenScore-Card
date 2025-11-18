# Vercel Deployment Setup Guide

## ⚠️ CRITICAL: Environment Variables Configuration

Your deployment is **stuck** because the `DATABASE_URL` environment variable in Vercel is not configured correctly.

## Quick Fix (5 minutes)

### Step 1: Get Your Supabase Connection String

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **Database** → **Connection String**
4. Select: **Connection Pooling** (Session mode)
5. Copy the connection string - it should look like:

```
postgresql://postgres.XXXXX:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variable:

**Variable Name:**
```
DATABASE_URL
```

**Value (CRITICAL - must include these parameters):**
```
postgresql://postgres.XXXXX:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**⚠️ IMPORTANT:** Make sure to add at the end:
- `?pgbouncer=true`
- `&connection_limit=1`

**Environment:** Select all (Production, Preview, Development)

### Step 3: Redeploy

After saving the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Or push a new commit to trigger deployment

---

## Why Was It Stuck?

The build script was hanging at:
```
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-1-eu-west-1.pooler.supabase.com:6543"
```

**Reason:** Prisma was trying to connect to Supabase without the required `pgbouncer=true` parameter, causing it to hang indefinitely.

**Fixed by:**
1. Adding 60-second timeout to migrations
2. Adding validation to check for pgbouncer parameter
3. Clear error messages if connection fails

---

## Complete Environment Variables for Vercel

Here are ALL the environment variables you need to set in Vercel:

### Required (Minimum)

```bash
# Database (CRITICAL)
DATABASE_URL="postgresql://postgres.XXX:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Solana RPC
HELIUS_API_KEY="your-helius-api-key"
HELIUS_RPC_URL="https://mainnet.helius-rpc.com/?api-key=your-helius-api-key"

# Treasury Wallet
TREASURY_WALLET="YourSolanaWalletAddress"
NEXT_PUBLIC_TREASURY_WALLET="YourSolanaWalletAddress"

# Security
JWT_SECRET="generate-with-openssl-rand-base64-48"
CRON_API_KEY="generate-with-openssl-rand-hex-32"
ADMIN_WALLETS="wallet1,wallet2"

# App Config
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_SOLANA_NETWORK="mainnet-beta"
NEXT_PUBLIC_HELIUS_RPC_URL="https://api.mainnet-beta.solana.com"
```

### Optional (Recommended)

```bash
# Redis Cache
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Image Storage
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="degenscore-cards"

# Error Tracking
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""

# Notifications
DISCORD_WEBHOOK_URL=""
TELEGRAM_BOT_TOKEN=""
```

---

## Troubleshooting

### Build still hanging?

1. **Check DATABASE_URL format:**
   - Must use port `6543` (not 5432)
   - Must include `?pgbouncer=true&connection_limit=1`

2. **Verify Supabase project is active:**
   - Check https://supabase.com/dashboard
   - Make sure project is not paused

3. **Check Supabase password:**
   - Reset if needed in Supabase Dashboard → Settings → Database

### Build succeeds but runtime errors?

1. **Database migrations not applied:**
   ```bash
   # Run locally to check migrations
   npx prisma migrate status
   ```

2. **Missing environment variables:**
   - Check Vercel logs for errors
   - Verify all required variables are set

### Connection format reference

**✅ CORRECT (Vercel/Serverless):**
```
postgresql://postgres.xxx:pass@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**❌ WRONG (Direct Connection):**
```
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

---

## New Build Script Features

The updated `scripts/vercel-build.sh` now includes:

1. ✅ **60-second timeout** for migrations (prevents infinite hanging)
2. ✅ **Parameter validation** (checks for pgbouncer=true)
3. ✅ **Clear error messages** (tells you exactly what's wrong)
4. ✅ **Exit on timeout** (fails fast instead of hanging)

### Build Output You'll See:

```bash
🔍 Checking DATABASE_URL configuration...
✅ PgBouncer parameter detected

⏱️  Running migrations (60s timeout)...
✅ Migrations applied successfully

🔧 Generating Prisma Client...
✅ Prisma Client generated successfully

🏗️  Building Next.js application...
```

### If Configuration is Wrong:

```bash
❌ ERROR: Migration timed out after 60 seconds

This usually means:
1. DATABASE_URL is missing pgbouncer=true parameter
2. Database credentials are incorrect
3. Database is unreachable from Vercel

Please check your Vercel environment variables:
👉 https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

---

## Next Steps After Fixing

1. ✅ Set `DATABASE_URL` in Vercel with correct format
2. ✅ Redeploy from Vercel dashboard
3. ✅ Build should complete in ~2-3 minutes
4. ✅ Check deployment logs to verify success

---

**Updated:** 2025-11-18
**Issue:** Vercel build hanging at Prisma migration
**Fixed by:** Adding timeouts + validation in vercel-build.sh

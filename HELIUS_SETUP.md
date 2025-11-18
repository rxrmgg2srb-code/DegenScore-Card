# Helius API Key Setup Guide

This guide will help you fix the **"invalid api key provided"** error and properly configure your Helius API key for DegenScore.

## The Error

If you see this error:
```json
{"jsonrpc":"2.0","error":{"code":-32401,"message":"invalid api key provided"}}
```

It means your Helius API key is either **missing**, **invalid**, or **incorrectly configured**.

## Solution: Step-by-Step Setup

### Step 1: Get a Free Helius API Key

1. Go to **[https://www.helius.dev](https://www.helius.dev)**
2. Click **"Sign Up"** or **"Get Started"**
3. Create an account (free tier available)
4. Once logged in, go to **Dashboard** → **API Keys**
5. Click **"Create New API Key"**
6. Copy your API key (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Configure Your Project

1. **Create a `.env.local` file** in the root of your project:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your Helius API key:
   ```bash
   # Helius API (REQUIRED)
   HELIUS_API_KEY="your-actual-api-key-here"
   ```

   **Replace** `"your-actual-api-key-here"` with your real API key from Step 1.

3. **Verify your `.env.local` file**:
   ```bash
   cat .env.local | grep HELIUS_API_KEY
   ```

   You should see your actual API key, NOT placeholders like:
   - ❌ `TU-KEY-AQUI`
   - ❌ `your-helius-api-key-here`
   - ❌ `your-actual-api-key-here`
   - ✅ `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (example format)

### Step 3: Restart Your Development Server

If your server is running, restart it to load the new environment variables:

```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm run dev
```

### Step 4: Test Your Setup

You can test if your API key is working by running:

```bash
curl "https://api.helius.xyz/v0/addresses/B7nB9QX1KC4QXp5GMxR8xzh3yzoqp6NjxSwfNBXtgPc1/transactions?api-key=YOUR_ACTUAL_KEY&limit=1"
```

**Replace `YOUR_ACTUAL_KEY`** with your real Helius API key.

If successful, you'll see JSON data with transactions. If you still see the error, double-check that:
- You copied the correct API key from Helius dashboard
- The API key doesn't have any extra spaces or quotes
- Your Helius account is active

## Common Issues

### Issue 1: "HELIUS_API_KEY is not configured"

**Cause**: The `.env.local` file doesn't exist or doesn't contain `HELIUS_API_KEY`.

**Solution**: Follow Step 2 above to create and configure `.env.local`.

### Issue 2: "Invalid Helius API key"

**Cause**: The API key is incorrect, expired, or has been revoked.

**Solution**:
1. Log into your [Helius dashboard](https://www.helius.dev)
2. Check if your API key is still active
3. If not, create a new API key and update `.env.local`

### Issue 3: API key works in curl but not in the app

**Cause**: The app hasn't loaded the new environment variables.

**Solution**:
1. Make sure `.env.local` is in the project root (same directory as `package.json`)
2. Restart your dev server completely
3. If using Vercel/production, make sure to add the environment variable in your deployment settings

## Environment File Hierarchy

The project uses different `.env` files:

| File | Purpose | Git |
|------|---------|-----|
| `.env.example` | Example template | Committed |
| `.env.local.example` | Detailed example | Committed |
| `.env.local` | **YOUR ACTUAL KEYS** | **NOT committed** |
| `.env.production` | Production keys (Vercel) | **NOT committed** |

**IMPORTANT**: Never commit your `.env.local` file with real API keys to git!

## Where the API Key is Used

The Helius API key is used throughout the application for:

1. **Fetching wallet transactions** - `lib/services/helius.ts:getWalletTransactions()`
2. **Getting token metadata** - `lib/services/helius.ts:getTokenMetadata()`
3. **Checking wallet balances** - `lib/services/helius.ts:getWalletBalance()`
4. **RPC connections** - Solana Web3.js connections

## Production Deployment

When deploying to Vercel/Render/other platforms:

1. Go to your project settings
2. Add environment variables:
   - `HELIUS_API_KEY` = your-api-key
3. Redeploy the application
4. The platform will inject the environment variable at runtime

## Security Best Practices

- ✅ **DO** keep your API key in `.env.local`
- ✅ **DO** use different API keys for development and production
- ✅ **DO** rotate your API keys periodically
- ❌ **DON'T** commit `.env.local` to git
- ❌ **DON'T** share your API key publicly
- ❌ **DON'T** hardcode API keys in source code

## Need Help?

If you're still experiencing issues:

1. Check the application logs for detailed error messages
2. Verify your Helius account is active and has available credits
3. Try creating a new API key in the Helius dashboard
4. Open an issue on GitHub with the error details (but DON'T include your actual API key!)

## References

- [Helius Documentation](https://docs.helius.dev/)
- [Helius Free Tier](https://www.helius.dev/pricing)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)

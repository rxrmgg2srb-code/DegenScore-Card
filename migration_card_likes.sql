-- Migration: Add CardLike table for tracking likes by wallet
-- Run this in your Supabase SQL editor or use: npx prisma migrate deploy

-- Create CardLike table
CREATE TABLE IF NOT EXISTS "CardLike" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardLike_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS "CardLike_cardId_walletAddress_key" ON "CardLike"("cardId", "walletAddress");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "CardLike_cardId_idx" ON "CardLike"("cardId");
CREATE INDEX IF NOT EXISTS "CardLike_walletAddress_idx" ON "CardLike"("walletAddress");

-- Done! The CardLike table is now ready to track individual wallet likes

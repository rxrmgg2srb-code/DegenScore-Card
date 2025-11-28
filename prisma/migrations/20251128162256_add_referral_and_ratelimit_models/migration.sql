-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerAddress" TEXT NOT NULL,
    "referredAddress" TEXT NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardPaid" BOOLEAN NOT NULL DEFAULT false,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Referral_referrerAddress_idx" ON "Referral"("referrerAddress");

-- CreateIndex
CREATE INDEX "Referral_referredAddress_idx" ON "Referral"("referredAddress");

-- CreateIndex
CREATE INDEX "Referral_referrerAddress_createdAt_idx" ON "Referral"("referrerAddress", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "RateLimitLog_identifier_timestamp_idx" ON "RateLimitLog"("identifier", "timestamp");

-- CreateIndex
CREATE INDEX "RateLimitLog_identifier_endpoint_timestamp_idx" ON "RateLimitLog"("identifier", "endpoint", "timestamp");

-- CreateIndex
CREATE INDEX "RateLimitLog_timestamp_idx" ON "RateLimitLog"("timestamp");

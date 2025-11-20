import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeSuperTokenScore, SuperTokenScore } from '@/lib/services/superTokenScorer';
import { isValidSolanaAddress } from '@/lib/validation';
import { strictRateLimit } from '@/lib/rateLimitRedis';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/cache/redis';

/**
 * 🚀 SUPER TOKEN SCORE API - EL ANÁLISIS MÁS COMPLETO DE WEB3
 *
 * POST /api/super-token-score
 *
 * Analiza un token de Solana con TODAS las métricas posibles del ecosistema,
 * integrando múltiples APIs y análisis avanzados.
 *
 * Request body:
 * {
 *   "tokenAddress": "string",
 *   "forceRefresh": boolean (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": SuperTokenScore,
 *   "cached": boolean
 * }
 */

const CACHE_TTL = 1800; // 30 minutos cache (análisis es costoso)
const STALE_THRESHOLD = 2 * 60 * 60 * 1000; // 2 horas

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply strict rate limiting (operación muy costosa)
  if (!(await strictRateLimit(req, res))) {
    return;
  }

  try {
    const { tokenAddress, forceRefresh } = req.body;

    // Validate token address
    if (!tokenAddress || typeof tokenAddress !== 'string') {
      return res.status(400).json({ error: 'Token address is required' });
    }

    if (!isValidSolanaAddress(tokenAddress)) {
      return res.status(400).json({ error: 'Invalid Solana token address' });
    }

    logger.info('🚀 Super Token Score analysis requested', { tokenAddress });

    // Check Redis cache first (if not forcing refresh and Redis is available)
    if (!forceRefresh && redis) {
      const cacheKey = `super-token-score:${tokenAddress}`;
      try {
        const cached = await redis.get(cacheKey);

        if (cached) {
          logger.info('✅ Returning cached Super Token Score', { tokenAddress });

          // Update view count asynchronously
          updateViewCount(tokenAddress).catch((err) => {
            logger.error('Failed to update view count', err instanceof Error ? err : undefined);
          });

          return res.status(200).json({
            success: true,
            data: JSON.parse(cached as string),
            cached: true,
          });
        }
      } catch (error) {
        // Redis error, continue without cache
        logger.warn('Redis cache check failed, continuing without cache', { error: String(error) });
      }
    }

    // Check database for recent analysis (if not forcing refresh)
    if (!forceRefresh) {
      const existing = await prisma.superTokenAnalysis.findUnique({
        where: { tokenAddress },
      }).catch(() => null); // Ignore if table doesn't exist yet

      if (existing) {
        const age = Date.now() - existing.analyzedAt.getTime();

        // If analysis is less than 2 hours old, return it
        if (age < STALE_THRESHOLD) {
          logger.info('✅ Returning database cached Super Token Score', {
            tokenAddress,
            ageMinutes: Math.floor(age / 60000)
          });

          // Update view count
          await updateViewCount(tokenAddress);

          const data = existing.fullDataJson as SuperTokenScore;

          // Cache in Redis if available
          if (redis) {
            const cacheKey = `super-token-score:${tokenAddress}`;
            await redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL }).catch(() => {
              // Fail silently
            });
          }

          return res.status(200).json({
            success: true,
            data,
            cached: true,
          });
        }
      }
    }

    // Perform fresh Super Token Score analysis
    logger.info('🔍 Starting fresh Super Token Score analysis', { tokenAddress });

    const result = await analyzeSuperTokenScore(tokenAddress, (progress, message) => {
      logger.info(`Super Token Score progress: ${progress}% - ${message}`);
    });

    // Save to database
    await saveSuperScoreToDatabase(tokenAddress, result);

    // Cache in Redis if available
    if (redis) {
      const cacheKey = `super-token-score:${tokenAddress}`;
      await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL }).catch((err) => {
        logger.error('Failed to cache Super Token Score in Redis', err instanceof Error ? err : undefined);
      });
    }

    logger.info('✅ Super Token Score analysis complete', {
      tokenAddress,
      superScore: result.superScore,
      riskLevel: result.globalRiskLevel,
      analysisTimeMs: result.analysisTimeMs,
    });

    return res.status(200).json({
      success: true,
      data: result,
      cached: false,
    });

  } catch (error: any) {
    logger.error('❌ Super Token Score analysis failed', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    // Don't expose internal errors in production
    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to analyze token. Please try again later.';

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Update view count for analytics
 */
async function updateViewCount(tokenAddress: string) {
  try {
    await prisma.superTokenAnalysis.update({
      where: { tokenAddress },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    }).catch(() => {
      // Table might not exist yet, ignore
    });
  } catch (error) {
    // Fail silently
  }
}

/**
 * Save Super Token Score to database
 */
async function saveSuperScoreToDatabase(tokenAddress: string, result: SuperTokenScore) {
  try {
    await prisma.superTokenAnalysis.upsert({
      where: { tokenAddress },
      create: {
        tokenAddress,

        // Basic info
        tokenSymbol: result.tokenSymbol,
        tokenName: result.tokenName,

        // Super Score
        superScore: result.superScore,
        globalRiskLevel: result.globalRiskLevel,
        recommendation: result.recommendation,

        // Score breakdown
        baseSecurityScore: result.scoreBreakdown.baseSecurityScore,
        newWalletScore: result.scoreBreakdown.newWalletScore,
        insiderScore: result.scoreBreakdown.insiderScore,
        volumeScore: result.scoreBreakdown.volumeScore,
        socialScore: result.scoreBreakdown.socialScore,
        botDetectionScore: result.scoreBreakdown.botDetectionScore,
        smartMoneyScore: result.scoreBreakdown.smartMoneyScore,
        teamScore: result.scoreBreakdown.teamScore,
        pricePatternScore: result.scoreBreakdown.pricePatternScore,
        historicalHoldersScore: result.scoreBreakdown.historicalHoldersScore,
        liquidityDepthScore: result.scoreBreakdown.liquidityDepthScore,
        crossChainScore: result.scoreBreakdown.crossChainScore,
        competitorScore: result.scoreBreakdown.competitorScore,
        rugCheckScore: result.scoreBreakdown.rugCheckScore,
        dexScreenerScore: result.scoreBreakdown.dexScreenerScore,
        birdeyeScore: result.scoreBreakdown.birdeyeScore,
        jupiterScore: result.scoreBreakdown.jupiterScore,

        // Key metrics from sub-analyses
        walletsUnder10Days: result.newWalletAnalysis.walletsUnder10Days,
        percentageNewWallets: result.newWalletAnalysis.percentageNewWallets,
        insiderWallets: result.insiderAnalysis.insiderWallets,
        insiderProfitTaking: result.insiderAnalysis.insiderProfitTaking,
        realVolume24h: result.volumeAnalysis.realVolume,
        fakeVolumePercent: result.volumeAnalysis.fakeVolumePercent,
        totalBots: result.botDetection.totalBots,
        botPercent: result.botDetection.botPercent,
        smartMoneySignal: result.smartMoneyAnalysis.signal,
        teamTokensLocked: result.teamAnalysis.teamTokensLocked,
        pricePattern: result.pricePattern.pattern,
        liquidityHealth: result.liquidityDepth.liquidityHealth,

        // Red flags and green flags
        totalRedFlags: result.allRedFlags.length,
        criticalRedFlags: result.allRedFlags.filter(f => f.severity === 'CRITICAL').length,
        highRedFlags: result.allRedFlags.filter(f => f.severity === 'HIGH').length,
        totalGreenFlags: result.greenFlags.length,

        // Full data as JSON
        fullDataJson: result as any,
        redFlagsJson: result.allRedFlags as any,
        greenFlagsJson: result.greenFlags as any,

        // Timestamps
        analyzedAt: new Date(),
        analysisTimeMs: result.analysisTimeMs,

        // Analytics
        viewCount: 1,
        lastViewedAt: new Date(),
      },
      update: {
        // Update all the same fields
        tokenSymbol: result.tokenSymbol,
        tokenName: result.tokenName,
        superScore: result.superScore,
        globalRiskLevel: result.globalRiskLevel,
        recommendation: result.recommendation,
        baseSecurityScore: result.scoreBreakdown.baseSecurityScore,
        newWalletScore: result.scoreBreakdown.newWalletScore,
        insiderScore: result.scoreBreakdown.insiderScore,
        volumeScore: result.scoreBreakdown.volumeScore,
        socialScore: result.scoreBreakdown.socialScore,
        botDetectionScore: result.scoreBreakdown.botDetectionScore,
        smartMoneyScore: result.scoreBreakdown.smartMoneyScore,
        teamScore: result.scoreBreakdown.teamScore,
        pricePatternScore: result.scoreBreakdown.pricePatternScore,
        historicalHoldersScore: result.scoreBreakdown.historicalHoldersScore,
        liquidityDepthScore: result.scoreBreakdown.liquidityDepthScore,
        crossChainScore: result.scoreBreakdown.crossChainScore,
        competitorScore: result.scoreBreakdown.competitorScore,
        rugCheckScore: result.scoreBreakdown.rugCheckScore,
        dexScreenerScore: result.scoreBreakdown.dexScreenerScore,
        birdeyeScore: result.scoreBreakdown.birdeyeScore,
        jupiterScore: result.scoreBreakdown.jupiterScore,
        walletsUnder10Days: result.newWalletAnalysis.walletsUnder10Days,
        percentageNewWallets: result.newWalletAnalysis.percentageNewWallets,
        insiderWallets: result.insiderAnalysis.insiderWallets,
        insiderProfitTaking: result.insiderAnalysis.insiderProfitTaking,
        realVolume24h: result.volumeAnalysis.realVolume,
        fakeVolumePercent: result.volumeAnalysis.fakeVolumePercent,
        totalBots: result.botDetection.totalBots,
        botPercent: result.botDetection.botPercent,
        smartMoneySignal: result.smartMoneyAnalysis.signal,
        teamTokensLocked: result.teamAnalysis.teamTokensLocked,
        pricePattern: result.pricePattern.pattern,
        liquidityHealth: result.liquidityDepth.liquidityHealth,
        totalRedFlags: result.allRedFlags.length,
        criticalRedFlags: result.allRedFlags.filter(f => f.severity === 'CRITICAL').length,
        highRedFlags: result.allRedFlags.filter(f => f.severity === 'HIGH').length,
        totalGreenFlags: result.greenFlags.length,
        fullDataJson: result as any,
        redFlagsJson: result.allRedFlags as any,
        greenFlagsJson: result.greenFlags as any,
        analyzedAt: new Date(),
        analysisTimeMs: result.analysisTimeMs,
      },
    }).catch((err) => {
      // If table doesn't exist, skip database save
      logger.warn('Super Token Analysis table not found, skipping DB save', { error: String(err) });
    });

    logger.info('✅ Super Token Score saved to database', { tokenAddress });
  } catch (error) {
    logger.error('Failed to save Super Token Score to database', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error),
    });
    // Don't throw - analysis was successful even if DB save failed
  }
}

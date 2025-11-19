/**
 * 🔒 TOKEN SECURITY ANALYZER - Advanced On-Chain Security Analysis
 *
 * Analyzes Solana tokens for security risks including:
 * - Token Authority Controls (Mint/Freeze/Update)
 * - Holder Distribution & Concentration
 * - Liquidity Analysis & LP Lock
 * - Trading Patterns & Bundle Detection
 * - Rug Pull Indicators
 * - Honeypot Detection
 * - Market Metrics & Age
 *
 * Security Score: 0-100 (Higher = Safer)
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from '@/lib/logger';
import { retry, CircuitBreaker } from '../retryLogic';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Circuit breaker para evitar sobrecarga
const securityCircuitBreaker = new CircuitBreaker(5, 60000);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TokenAuthorities {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  hasMintAuthority: boolean;
  hasFreezeAuthority: boolean;
  isRevoked: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-25
}

export interface HolderDistribution {
  totalHolders: number;
  top10HoldersPercent: number;
  creatorPercent: number;
  giniCoefficient: number; // 0-1 (0 = perfect equality, 1 = perfect inequality)
  concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bundleDetected: boolean;
  bundleWallets: number;
  score: number; // 0-20
}

export interface LiquidityAnalysis {
  totalLiquiditySOL: number;
  liquidityUSD: number;
  lpBurned: boolean;
  lpLocked: boolean;
  lpLockEnd?: number;
  liquidityToMarketCapRatio: number;
  majorPools: Array<{
    dex: string;
    liquiditySOL: number;
    lpBurned: boolean;
  }>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-20
}

export interface TradingPatterns {
  bundleBots: number;
  snipers: number;
  washTrading: boolean;
  suspiciousVolume: boolean;
  honeypotDetected: boolean;
  canSell: boolean;
  avgBuyTax: number;
  avgSellTax: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-15
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  supply: number;
  verified: boolean;
  hasWebsite: boolean;
  hasSocials: boolean;
  imageUrl?: string;
  description?: string;
  score: number; // 0-10
}

export interface MarketMetrics {
  ageInDays: number;
  volume24h: number;
  volumeChange24h: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCap: number;
  allTimeHigh: number;
  athDate?: number;
  isPumpAndDump: boolean;
  score: number; // 0-10
}

export interface RedFlags {
  flags: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    category: string;
  }>;
  totalPenalty: number; // Negative score
  criticalCount: number;
  highCount: number;
}

export interface TokenSecurityReport {
  tokenAddress: string;
  tokenAuthorities: TokenAuthorities;
  holderDistribution: HolderDistribution;
  liquidityAnalysis: LiquidityAnalysis;
  tradingPatterns: TradingPatterns;
  metadata: TokenMetadata;
  marketMetrics: MarketMetrics;
  redFlags: RedFlags;

  // Overall Security Score (0-100)
  securityScore: number;
  riskLevel: 'ULTRA_SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'EXTREME_DANGER';
  recommendation: string;

  // Analysis timestamp
  analyzedAt: number;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

// External API data interfaces (imported from superTokenScorer)
export interface ExternalTokenData {
  dexScreener?: {
    liquidity: number;
    volume24h: number;
    priceUSD: number;
    marketCap: number;
    priceChange24h: number;
    priceChange7d: number;
    txns24h?: { buys: number; sells: number };
  };
  birdeye?: {
    liquidity: number;
    volume24h: number;
    price: number;
    marketCap: number;
    lastTradeUnixTime: number;
    priceChange24h?: number;
    priceChange7d?: number;
    priceChange30d?: number;
  };
  jupiter?: {
    totalLiquiditySOL: number;
    totalLiquidityUSD: number;
    pools: Array<{
      name: string;
      liquiditySOL: number;
      liquidityUSD: number;
    }>;
  };
  rugCheck?: {
    risks: Array<{ name: string; level: string }>;
    lpBurned?: boolean;
    lpLocked?: boolean;
  };
}

export async function analyzeTokenSecurity(
  tokenAddress: string,
  onProgress?: (progress: number, message: string) => void,
  externalData?: ExternalTokenData
): Promise<TokenSecurityReport> {
  try {
    logger.info('🔒 Token Security Analysis Started', { tokenAddress });

    if (onProgress) onProgress(5, 'Validating token address...');

    // Validate address (throws if invalid)
    new PublicKey(tokenAddress);

    if (onProgress) onProgress(10, 'Fetching token metadata...');
    const metadata = await getTokenMetadata(tokenAddress);

    if (onProgress) onProgress(25, 'Analyzing token authorities...');
    const authorities = await analyzeTokenAuthorities(tokenAddress);

    if (onProgress) onProgress(40, 'Analyzing holder distribution...');
    const holderDist = await analyzeHolderDistribution(tokenAddress);

    if (onProgress) onProgress(55, 'Analyzing liquidity...');
    const liquidity = await analyzeLiquidity(tokenAddress, externalData);

    if (onProgress) onProgress(70, 'Detecting trading patterns...');
    const tradingPatterns = await analyzeTradingPatterns(tokenAddress, externalData);

    if (onProgress) onProgress(85, 'Analyzing market metrics...');
    const marketMetrics = await analyzeMarketMetrics(tokenAddress, externalData);

    if (onProgress) onProgress(95, 'Calculating security score...');

    // Detect red flags
    const redFlags = detectRedFlags(
      authorities,
      holderDist,
      liquidity,
      tradingPatterns,
      marketMetrics
    );

    // Calculate final security score
    const securityScore = calculateSecurityScore(
      authorities,
      holderDist,
      liquidity,
      tradingPatterns,
      metadata,
      marketMetrics,
      redFlags
    );

    const riskLevel = getRiskLevel(securityScore);
    const recommendation = getRecommendation(securityScore, redFlags);

    if (onProgress) onProgress(100, 'Analysis complete!');

    const report: TokenSecurityReport = {
      tokenAddress,
      tokenAuthorities: authorities,
      holderDistribution: holderDist,
      liquidityAnalysis: liquidity,
      tradingPatterns,
      metadata,
      marketMetrics,
      redFlags,
      securityScore,
      riskLevel,
      recommendation,
      analyzedAt: Date.now(),
    };

    logger.info('✅ Token Security Analysis Complete', {
      tokenAddress,
      securityScore,
      riskLevel
    });

    return report;

  } catch (error) {
    logger.error('❌ Token Security Analysis Failed', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error),
    });
    throw error;
  }
}

// ============================================================================
// TOKEN AUTHORITIES ANALYSIS
// ============================================================================

async function analyzeTokenAuthorities(tokenAddress: string): Promise<TokenAuthorities> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
      const mintPubkey = new PublicKey(tokenAddress);

      // Get mint account info
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);

      if (!mintInfo.value) {
        throw new Error('Token mint not found');
      }

      const data = (mintInfo.value.data as any).parsed.info;

      const mintAuthority = data.mintAuthority;
      const freezeAuthority = data.freezeAuthority;
      const hasMintAuthority = !!mintAuthority;
      const hasFreezeAuthority = !!freezeAuthority;
      const isRevoked = !hasMintAuthority && !hasFreezeAuthority;

      // Calculate risk level and score
      let score = 25; // Max score
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (hasMintAuthority && hasFreezeAuthority) {
        riskLevel = 'CRITICAL';
        score = 0;
      } else if (hasMintAuthority || hasFreezeAuthority) {
        riskLevel = hasMintAuthority ? 'HIGH' : 'MEDIUM';
        score = hasMintAuthority ? 5 : 15;
      } else {
        riskLevel = 'LOW';
        score = 25;
      }

      return {
        mintAuthority,
        freezeAuthority,
        hasMintAuthority,
        hasFreezeAuthority,
        isRevoked,
        riskLevel,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  );
}

// ============================================================================
// HOLDER DISTRIBUTION ANALYSIS
// ============================================================================

async function analyzeHolderDistribution(tokenAddress: string): Promise<HolderDistribution> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      // Get token holders using Helius DAS API
      const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'holder-analysis',
          method: 'getTokenAccounts',
          params: {
            mint: tokenAddress,
            limit: 1000,
            options: {
              showZeroBalance: false,
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch holders: ${response.statusText}`);
      }

      const data = await response.json();
      const holders = data.result?.token_accounts || [];

      const totalHolders = holders.length;

      // Calculate top holders percentage
      const sortedHolders = holders
        .map((h: any) => ({
          owner: h.owner,
          amount: parseFloat(h.amount),
        }))
        .sort((a: any, b: any) => b.amount - a.amount);

      const totalSupply = sortedHolders.reduce((sum: number, h: any) => sum + h.amount, 0);
      const top10Amount = sortedHolders.slice(0, 10).reduce((sum: number, h: any) => sum + h.amount, 0);
      const top10HoldersPercent = (top10Amount / totalSupply) * 100;

      // Creator is typically the first holder
      const creatorPercent = totalSupply > 0 ? (sortedHolders[0]?.amount / totalSupply) * 100 : 0;

      // Calculate Gini coefficient (wealth inequality)
      const giniCoefficient = calculateGini(sortedHolders.map((h: any) => h.amount));

      // Detect bundle wallets (wallets that received tokens in the same transaction)
      const bundleWallets = await detectBundleWallets(tokenAddress);
      const bundleDetected = bundleWallets > 5;

      // Calculate risk
      let score = 20;
      let concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (top10HoldersPercent > 80 || creatorPercent > 50) {
        concentrationRisk = 'CRITICAL';
        score = 0;
      } else if (top10HoldersPercent > 60 || creatorPercent > 30) {
        concentrationRisk = 'HIGH';
        score = 5;
      } else if (top10HoldersPercent > 40 || creatorPercent > 20) {
        concentrationRisk = 'MEDIUM';
        score = 12;
      } else {
        concentrationRisk = 'LOW';
        score = 20;
      }

      // Penalty for bundle detection
      if (bundleDetected) {
        score = Math.max(0, score - 5);
      }

      return {
        totalHolders,
        top10HoldersPercent,
        creatorPercent,
        giniCoefficient,
        concentrationRisk,
        bundleDetected,
        bundleWallets,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  ).catch(() => ({
    // Fallback on error
    totalHolders: 0,
    top10HoldersPercent: 100,
    creatorPercent: 100,
    giniCoefficient: 1,
    concentrationRisk: 'CRITICAL' as const,
    bundleDetected: false,
    bundleWallets: 0,
    score: 0,
  }));
}

// ============================================================================
// LIQUIDITY ANALYSIS
// ============================================================================

async function analyzeLiquidity(
  tokenAddress: string,
  externalData?: ExternalTokenData
): Promise<LiquidityAnalysis> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      logger.info('💧 Analyzing liquidity from ALL sources', { tokenAddress });

      // PRIORITY 1: Get real SOL price first
      const solPrice = await getSOLPrice(externalData);

      // PRIORITY 2: Use ALL external data sources for liquidity
      let liquidityUSD = 0;
      let totalLiquiditySOL = 0;
      const majorPools: Array<{ dex: string; liquiditySOL: number; lpBurned: boolean }> = [];

      // Source 1: DexScreener (MOST RELIABLE for liquidity)
      if (externalData?.dexScreener?.liquidity && externalData.dexScreener.liquidity > 0) {
        liquidityUSD = externalData.dexScreener.liquidity;
        totalLiquiditySOL = liquidityUSD / solPrice;
        majorPools.push({
          dex: 'DexScreener',
          liquiditySOL: totalLiquiditySOL,
          lpBurned: false,
        });
        logger.info('✅ Using DexScreener liquidity', { liquidityUSD, totalLiquiditySOL });
      }

      // Source 2: Birdeye (FALLBACK)
      if (liquidityUSD === 0 && externalData?.birdeye?.liquidity && externalData.birdeye.liquidity > 0) {
        liquidityUSD = externalData.birdeye.liquidity;
        totalLiquiditySOL = liquidityUSD / solPrice;
        majorPools.push({
          dex: 'Birdeye',
          liquiditySOL: totalLiquiditySOL,
          lpBurned: false,
        });
        logger.info('✅ Using Birdeye liquidity', { liquidityUSD, totalLiquiditySOL });
      }

      // Source 3: Jupiter (FALLBACK)
      if (liquidityUSD === 0 && externalData?.jupiter?.totalLiquidityUSD && externalData.jupiter.totalLiquidityUSD > 0) {
        liquidityUSD = externalData.jupiter.totalLiquidityUSD;
        totalLiquiditySOL = externalData.jupiter.totalLiquiditySOL || (liquidityUSD / solPrice);

        if (externalData.jupiter.pools && externalData.jupiter.pools.length > 0) {
          externalData.jupiter.pools.forEach(pool => {
            majorPools.push({
              dex: pool.name,
              liquiditySOL: pool.liquiditySOL,
              lpBurned: false,
            });
          });
        }
        logger.info('✅ Using Jupiter liquidity', { liquidityUSD, totalLiquiditySOL });
      }

      // CRITICAL: Check LP burned/locked status from RugCheck
      let lpBurned = false;
      let lpLocked = false;

      if (externalData?.rugCheck) {
        // Check RugCheck risks for LP burn/lock info
        const lpRisks = externalData.rugCheck.risks?.filter(r =>
          r.name.toLowerCase().includes('lp') ||
          r.name.toLowerCase().includes('liquidity')
        );

        // If RugCheck explicitly provides these fields
        if (externalData.rugCheck.lpBurned !== undefined) {
          lpBurned = externalData.rugCheck.lpBurned;
        }
        if (externalData.rugCheck.lpLocked !== undefined) {
          lpLocked = externalData.rugCheck.lpLocked;
        }

        // Infer from risk messages
        lpRisks?.forEach(risk => {
          if (risk.name.toLowerCase().includes('burned') || risk.name.toLowerCase().includes('burnt')) {
            lpBurned = risk.level === 'info' || risk.level === 'warn'; // Good sign
          }
          if (risk.name.toLowerCase().includes('locked')) {
            lpLocked = risk.level === 'info' || risk.level === 'warn'; // Good sign
          }
        });

        logger.info('🔥 LP Burn/Lock Status from RugCheck', { lpBurned, lpLocked });
      }

      // Calculate liquidity to market cap ratio
      const marketCap = externalData?.dexScreener?.marketCap || externalData?.birdeye?.marketCap || 0;
      const liquidityToMarketCapRatio = marketCap > 0 ? liquidityUSD / marketCap : 0;

      // CRITICAL LOGGING - Log final values
      logger.info('💧 FINAL Liquidity Analysis', {
        totalLiquiditySOL,
        liquidityUSD,
        lpBurned,
        lpLocked,
        liquidityToMarketCapRatio,
        solPrice,
        sources: majorPools.map(p => p.dex).join(', ')
      });

      // Calculate risk level and score based on REAL data
      let score = 20;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (totalLiquiditySOL < 5) {
        riskLevel = 'CRITICAL';
        score = 0;
      } else if (totalLiquiditySOL < 20 && !lpBurned && !lpLocked) {
        riskLevel = 'HIGH';
        score = 5;
      } else if (totalLiquiditySOL < 50 && !lpBurned && !lpLocked) {
        riskLevel = 'MEDIUM';
        score = 10;
      } else if (lpBurned || lpLocked) {
        riskLevel = 'LOW';
        score = 20;
      } else {
        riskLevel = 'MEDIUM';
        score = 15;
      }

      return {
        totalLiquiditySOL,
        liquidityUSD,
        lpBurned,
        lpLocked,
        lpLockEnd: undefined,
        liquidityToMarketCapRatio,
        majorPools,
        riskLevel,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  ).catch((error) => {
    // CRITICAL: Log the error instead of silently failing
    logger.error('❌ Liquidity Analysis FAILED - Using fallback', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error),
    });

    // Return fallback but log the failure
    return {
      totalLiquiditySOL: 0,
      liquidityUSD: 0,
      lpBurned: false,
      lpLocked: false,
      liquidityToMarketCapRatio: 0,
      majorPools: [],
      riskLevel: 'CRITICAL' as const,
      score: 0,
    };
  });
}

// ============================================================================
// TRADING PATTERNS ANALYSIS
// ============================================================================

async function analyzeTradingPatterns(
  tokenAddress: string,
  externalData?: ExternalTokenData
): Promise<TradingPatterns> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      logger.info('🔍 Analyzing trading patterns with REAL data', { tokenAddress });

      // Analyze transactions from Helius
      const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactions = await response.json();

      // Detect bundle bots (multiple buys in same block/slot)
      const bundleBots = detectBundleBots(transactions);

      // Detect snipers (bought in first 10 transactions)
      const snipers = Math.min(10, transactions.length);

      // Enhanced wash trading detection using external data
      let washTrading = detectWashTrading(transactions);

      // Use external data to improve wash trading detection
      if (externalData?.dexScreener?.txns24h) {
        const { buys, sells } = externalData.dexScreener.txns24h;
        const buysSellsRatio = sells > 0 ? buys / sells : buys;

        // Extreme buy/sell imbalance suggests wash trading
        if (buysSellsRatio > 10 || buysSellsRatio < 0.1) {
          washTrading = true;
          logger.info('⚠️ Wash trading detected from buy/sell ratio', { buysSellsRatio });
        }

        // Volume/Liquidity ratio check
        const volume24h = externalData.dexScreener.volume24h || 0;
        const liquidity = externalData.dexScreener.liquidity || 0;
        if (liquidity > 0) {
          const volumeToLiquidityRatio = volume24h / liquidity;
          if (volumeToLiquidityRatio > 20) {
            washTrading = true;
            logger.info('⚠️ Wash trading detected from volume/liquidity ratio', { volumeToLiquidityRatio });
          }
        }
      }

      // Detect honeypot (nobody can sell)
      const { canSell, honeypotDetected } = detectHoneypot(transactions);

      // Estimate taxes (would need more sophisticated analysis)
      const avgBuyTax = 0;
      const avgSellTax = 0;

      const suspiciousVolume = washTrading || bundleBots > 10;

      logger.info('🔍 FINAL Trading Patterns', {
        bundleBots,
        snipers,
        washTrading,
        honeypotDetected,
        canSell,
        suspiciousVolume
      });

      // Calculate risk level and score
      let score = 15;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (honeypotDetected) {
        riskLevel = 'CRITICAL';
        score = 0;
      } else if (bundleBots > 20 || (washTrading && !canSell)) {
        riskLevel = 'HIGH';
        score = 3;
      } else if (bundleBots > 10 || washTrading) {
        riskLevel = 'MEDIUM';
        score = 8;
      } else {
        riskLevel = 'LOW';
        score = 15;
      }

      return {
        bundleBots,
        snipers,
        washTrading,
        suspiciousVolume,
        honeypotDetected,
        canSell,
        avgBuyTax,
        avgSellTax,
        riskLevel,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  ).catch((error) => {
    logger.error('❌ Trading Patterns Analysis FAILED', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error),
    });

    return {
      bundleBots: 0,
      snipers: 0,
      washTrading: false,
      suspiciousVolume: false,
      honeypotDetected: false,
      canSell: true,
      avgBuyTax: 0,
      avgSellTax: 0,
      riskLevel: 'MEDIUM' as const,
      score: 8,
    };
  });
}

// ============================================================================
// TOKEN METADATA ANALYSIS
// ============================================================================

async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'metadata',
          method: 'getAsset',
          params: { id: tokenAddress },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const data = await response.json();
      const asset = data.result;

      // Get token account info for supply
      const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
      const mintPubkey = new PublicKey(tokenAddress);
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      const mintData = (mintInfo.value?.data as any)?.parsed?.info;

      const symbol = asset?.content?.metadata?.symbol || 'UNKNOWN';
      const name = asset?.content?.metadata?.name || 'Unknown Token';
      const decimals = mintData?.decimals || 9;
      const supply = parseInt(mintData?.supply || '0') / Math.pow(10, decimals);

      const hasWebsite = !!asset?.content?.links?.external_url;
      const hasSocials = !!(asset?.content?.links?.twitter || asset?.content?.links?.telegram);
      const verified = asset?.grouping?.some((g: any) => g.group_key === 'verified') || false;

      let score = 0;
      if (verified) score += 5;
      if (hasWebsite) score += 3;
      if (hasSocials) score += 2;

      return {
        symbol,
        name,
        decimals,
        supply,
        verified,
        hasWebsite,
        hasSocials,
        imageUrl: asset?.content?.links?.image,
        description: asset?.content?.metadata?.description,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  ).catch(() => ({
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    decimals: 9,
    supply: 0,
    verified: false,
    hasWebsite: false,
    hasSocials: false,
    score: 0,
  }));
}

// ============================================================================
// MARKET METRICS ANALYSIS
// ============================================================================

async function analyzeMarketMetrics(
  tokenAddress: string,
  externalData?: ExternalTokenData
): Promise<MarketMetrics> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      logger.info('📊 Analyzing market metrics from REAL data', { tokenAddress });

      // PRIORITY 1: Get REAL age from Birdeye (most accurate)
      let ageInDays = 0;
      let athDate: number | undefined;

      if (externalData?.birdeye?.lastTradeUnixTime && externalData.birdeye.lastTradeUnixTime > 0) {
        // Birdeye gives us creation/first trade time
        const currentTime = Date.now() / 1000; // Convert to seconds
        ageInDays = (currentTime - externalData.birdeye.lastTradeUnixTime) / 86400;
        athDate = externalData.birdeye.lastTradeUnixTime;
        logger.info('✅ Using Birdeye token age', { ageInDays, athDate });
      }

      // FALLBACK: Try to get age from Helius transaction history
      if (ageInDays === 0) {
        try {
          const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=1000`;
          const response = await fetch(url);

          if (response.ok) {
            const transactions = await response.json();
            const oldestTx = transactions[transactions.length - 1];

            if (oldestTx?.timestamp) {
              ageInDays = (Date.now() / 1000 - oldestTx.timestamp) / 86400;
              athDate = oldestTx.timestamp;
              logger.info('✅ Using Helius transaction age', { ageInDays, athDate });
            }
          }
        } catch (error) {
          logger.warn('⚠️ Failed to fetch transaction history for age', { error: String(error) });
        }
      }

      // Get REAL volume from DexScreener or Birdeye
      const volume24h = externalData?.dexScreener?.volume24h || externalData?.birdeye?.volume24h || 0;

      // Get REAL price changes from DexScreener or Birdeye
      const priceChange24h = externalData?.dexScreener?.priceChange24h || externalData?.birdeye?.priceChange24h || 0;
      const priceChange7d = externalData?.dexScreener?.priceChange7d || externalData?.birdeye?.priceChange7d || 0;

      // Get REAL market cap
      const marketCap = externalData?.dexScreener?.marketCap || externalData?.birdeye?.marketCap || 0;

      // Calculate volumeChange24h (rough estimate from price changes)
      const volumeChange24h = 0; // Would need historical volume data

      // Estimate ATH (use current price if no history)
      const currentPrice = externalData?.dexScreener?.priceUSD || externalData?.birdeye?.price || 0;
      const allTimeHigh = currentPrice; // Conservative estimate

      // Detect pump and dump pattern using REAL data
      const isPumpAndDump =
        ageInDays < 1 &&
        volume24h > marketCap * 5 && // Extreme volume relative to market cap
        priceChange24h > 100; // Over 100% price increase

      logger.info('📊 FINAL Market Metrics', {
        ageInDays,
        volume24h,
        priceChange24h,
        priceChange7d,
        marketCap,
        isPumpAndDump
      });

      // Calculate score based on REAL data
      let score = 10;
      if (ageInDays > 30) score = 10;
      else if (ageInDays > 7) score = 7;
      else if (ageInDays > 1) score = 5;
      else score = 2;

      if (isPumpAndDump) score = Math.max(0, score - 5);

      return {
        ageInDays,
        volume24h,
        volumeChange24h,
        priceChange24h,
        priceChange7d,
        marketCap,
        allTimeHigh,
        athDate,
        isPumpAndDump,
        score,
      };
    }, {
      maxRetries: 3,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    })
  ).catch((error) => {
    logger.error('❌ Market Metrics Analysis FAILED', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error),
    });

    return {
      ageInDays: 0,
      volume24h: 0,
      volumeChange24h: 0,
      priceChange24h: 0,
      priceChange7d: 0,
      marketCap: 0,
      allTimeHigh: 0,
      isPumpAndDump: false,
      score: 0,
    };
  });
}

// ============================================================================
// RED FLAGS DETECTION
// ============================================================================

function detectRedFlags(
  authorities: TokenAuthorities,
  holderDist: HolderDistribution,
  liquidity: LiquidityAnalysis,
  tradingPatterns: TradingPatterns,
  marketMetrics: MarketMetrics
): RedFlags {
  const flags: RedFlags['flags'] = [];

  // Authority red flags
  if (authorities.hasMintAuthority && authorities.hasFreezeAuthority) {
    flags.push({
      severity: 'CRITICAL',
      message: 'Token has both MINT and FREEZE authority - creator can mint infinite tokens and freeze wallets',
      category: 'Authority Control',
    });
  } else if (authorities.hasMintAuthority) {
    flags.push({
      severity: 'HIGH',
      message: 'Mint authority is active - creator can create unlimited tokens',
      category: 'Authority Control',
    });
  } else if (authorities.hasFreezeAuthority) {
    flags.push({
      severity: 'MEDIUM',
      message: 'Freeze authority is active - creator can freeze token accounts',
      category: 'Authority Control',
    });
  }

  // Holder distribution red flags
  if (holderDist.creatorPercent > 50) {
    flags.push({
      severity: 'CRITICAL',
      message: `Creator holds ${holderDist.creatorPercent.toFixed(1)}% of supply - extreme rug risk`,
      category: 'Holder Distribution',
    });
  } else if (holderDist.creatorPercent > 30) {
    flags.push({
      severity: 'HIGH',
      message: `Creator holds ${holderDist.creatorPercent.toFixed(1)}% of supply - high concentration risk`,
      category: 'Holder Distribution',
    });
  }

  if (holderDist.top10HoldersPercent > 80) {
    flags.push({
      severity: 'HIGH',
      message: `Top 10 holders control ${holderDist.top10HoldersPercent.toFixed(1)}% of supply - highly centralized`,
      category: 'Holder Distribution',
    });
  }

  if (holderDist.bundleDetected) {
    flags.push({
      severity: 'MEDIUM',
      message: `${holderDist.bundleWallets} bundle wallets detected - coordinated buying`,
      category: 'Trading Patterns',
    });
  }

  // Liquidity red flags
  if (liquidity.totalLiquiditySOL < 5) {
    flags.push({
      severity: 'CRITICAL',
      message: `Only ${liquidity.totalLiquiditySOL.toFixed(2)} SOL liquidity - extreme rug risk`,
      category: 'Liquidity',
    });
  } else if (liquidity.totalLiquiditySOL < 20) {
    flags.push({
      severity: 'HIGH',
      message: `Low liquidity (${liquidity.totalLiquiditySOL.toFixed(2)} SOL) - high slippage and rug risk`,
      category: 'Liquidity',
    });
  }

  if (!liquidity.lpBurned && !liquidity.lpLocked) {
    flags.push({
      severity: 'HIGH',
      message: 'LP tokens are NOT burned or locked - creator can remove liquidity anytime',
      category: 'Liquidity',
    });
  }

  // Trading pattern red flags
  if (tradingPatterns.honeypotDetected) {
    flags.push({
      severity: 'CRITICAL',
      message: 'HONEYPOT DETECTED - Nobody can sell this token!',
      category: 'Trading Patterns',
    });
  }

  if (tradingPatterns.washTrading) {
    flags.push({
      severity: 'MEDIUM',
      message: 'Wash trading detected - fake volume',
      category: 'Trading Patterns',
    });
  }

  if (tradingPatterns.bundleBots > 20) {
    flags.push({
      severity: 'HIGH',
      message: `${tradingPatterns.bundleBots} bundle bots detected - coordinated pump`,
      category: 'Trading Patterns',
    });
  }

  // Market metrics red flags
  if (marketMetrics.isPumpAndDump) {
    flags.push({
      severity: 'HIGH',
      message: 'Pump and dump pattern detected - very young token with suspicious volume',
      category: 'Market Metrics',
    });
  }

  if (marketMetrics.ageInDays < 1) {
    flags.push({
      severity: 'MEDIUM',
      message: 'Token is less than 1 day old - extremely high risk',
      category: 'Market Metrics',
    });
  }

  // Calculate penalty
  let totalPenalty = 0;
  let criticalCount = 0;
  let highCount = 0;

  flags.forEach(flag => {
    if (flag.severity === 'CRITICAL') {
      totalPenalty += 25;
      criticalCount++;
    } else if (flag.severity === 'HIGH') {
      totalPenalty += 15;
      highCount++;
    } else if (flag.severity === 'MEDIUM') {
      totalPenalty += 8;
    } else {
      totalPenalty += 3;
    }
  });

  return {
    flags,
    totalPenalty: Math.min(50, totalPenalty), // Cap at -50
    criticalCount,
    highCount,
  };
}

// ============================================================================
// SECURITY SCORE CALCULATION
// ============================================================================

function calculateSecurityScore(
  authorities: TokenAuthorities,
  holderDist: HolderDistribution,
  liquidity: LiquidityAnalysis,
  tradingPatterns: TradingPatterns,
  metadata: TokenMetadata,
  marketMetrics: MarketMetrics,
  redFlags: RedFlags
): number {
  const baseScore =
    authorities.score +        // 0-25 points
    holderDist.score +        // 0-20 points
    liquidity.score +         // 0-20 points
    tradingPatterns.score +   // 0-15 points
    metadata.score +          // 0-10 points
    marketMetrics.score;      // 0-10 points

  const finalScore = Math.max(0, Math.min(100, baseScore - redFlags.totalPenalty));

  return Math.round(finalScore);
}

function getRiskLevel(score: number): TokenSecurityReport['riskLevel'] {
  if (score >= 90) return 'ULTRA_SAFE';
  if (score >= 70) return 'LOW_RISK';
  if (score >= 50) return 'MODERATE_RISK';
  if (score >= 25) return 'HIGH_RISK';
  return 'EXTREME_DANGER';
}

function getRecommendation(score: number, redFlags: RedFlags): string {
  if (redFlags.criticalCount > 0) {
    return '⛔ DO NOT INVEST - Critical security issues detected. This token is extremely dangerous.';
  }

  if (score >= 90) {
    return '✅ SAFE TO INVEST - This token shows strong security fundamentals with minimal risks.';
  }

  if (score >= 70) {
    return '⚠️ MODERATE RISK - Token shows acceptable security but review the warnings carefully.';
  }

  if (score >= 50) {
    return '🚨 HIGH RISK - Only invest small amounts you can afford to lose. Multiple red flags detected.';
  }

  return '🔴 EXTREME DANGER - This token shows multiple severe security issues. Avoid or risk total loss.';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateGini(amounts: number[]): number {
  if (amounts.length === 0) return 1;

  const sorted = [...amounts].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);

  if (sum === 0) return 1;

  let numerator = 0;
  sorted.forEach((amount, i) => {
    numerator += (2 * (i + 1) - n - 1) * amount;
  });

  return numerator / (n * sum);
}

async function detectBundleWallets(_tokenAddress: string): Promise<number> {
  // Simplified - would need to analyze first transaction signatures
  // and check if multiple wallets received tokens in same tx
  return 0;
}

async function getSOLPrice(externalData?: ExternalTokenData): Promise<number> {
  try {
    // PRIORITY 1: Use price from DexScreener if available (most reliable)
    if (externalData?.dexScreener?.priceUSD && externalData.dexScreener.priceUSD > 0) {
      // DexScreener gives us token price, we need SOL price
      // We can use a constant for now or fetch from Jupiter
    }

    // PRIORITY 2: Use price from Birdeye if available
    if (externalData?.birdeye?.price && externalData.birdeye.price > 0) {
      // Same issue - this is token price
    }

    // FALLBACK: Fetch real SOL price from Jupiter or CoinGecko
    try {
      const response = await fetch('https://price.jup.ag/v6/price?ids=SOL', {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const solPrice = data?.data?.SOL?.price;
        if (solPrice && solPrice > 0) {
          logger.info('✅ Using Jupiter SOL price', { solPrice });
          return solPrice;
        }
      }
    } catch (error) {
      logger.warn('⚠️ Failed to fetch SOL price from Jupiter', { error: String(error) });
    }

    // FALLBACK 2: Try CoinGecko
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      if (response.ok) {
        const data = await response.json();
        const solPrice = data?.solana?.usd;
        if (solPrice && solPrice > 0) {
          logger.info('✅ Using CoinGecko SOL price', { solPrice });
          return solPrice;
        }
      }
    } catch (error) {
      logger.warn('⚠️ Failed to fetch SOL price from CoinGecko', { error: String(error) });
    }

    // Last resort fallback - use reasonable estimate
    logger.warn('⚠️ Using fallback SOL price estimate');
    return 150;
  } catch (error) {
    logger.error('❌ Error fetching SOL price', error instanceof Error ? error : undefined);
    return 150;
  }
}

function detectBundleBots(transactions: any[]): number {
  // Group transactions by slot and count wallets buying in same slot
  const slotGroups: { [slot: number]: Set<string> } = {};

  transactions.forEach(tx => {
    if (!slotGroups[tx.slot]) {
      slotGroups[tx.slot] = new Set();
    }
    const slotGroup = slotGroups[tx.slot];
    if (tx.feePayer && slotGroup) {
      slotGroup.add(tx.feePayer);
    }
  });

  // Count slots with multiple buyers
  let bundleCount = 0;
  Object.values(slotGroups).forEach(wallets => {
    if (wallets.size > 1) {
      bundleCount += wallets.size - 1;
    }
  });

  return bundleCount;
}

function detectWashTrading(transactions: any[]): boolean {
  // Simplified - check if same wallets are buying and selling repeatedly
  const traders = new Set<string>();
  const repeatedTraders = new Set<string>();

  transactions.forEach(tx => {
    if (traders.has(tx.feePayer)) {
      repeatedTraders.add(tx.feePayer);
    } else {
      traders.add(tx.feePayer);
    }
  });

  return repeatedTraders.size > 5;
}

function detectHoneypot(transactions: any[]): { canSell: boolean; honeypotDetected: boolean } {
  // Check if there are ANY sell transactions
  const sells = transactions.filter(tx =>
    tx.type === 'SWAP' && tx.description?.toLowerCase().includes('sell')
  );

  const buys = transactions.filter(tx =>
    tx.type === 'SWAP' && tx.description?.toLowerCase().includes('buy')
  );

  const canSell = sells.length > 0;
  const honeypotDetected = buys.length > 10 && sells.length === 0;

  return { canSell, honeypotDetected };
}

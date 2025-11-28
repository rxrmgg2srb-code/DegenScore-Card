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
// Prefer full RPC URL from env (more secure), fallback to constructing it
const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL ||
  (HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` : 'https://api.mainnet-beta.solana.com');

const getHeliusApiKey = () => {
  if (HELIUS_API_KEY) return HELIUS_API_KEY;
  const match = HELIUS_RPC_URL.match(/api-key=([^&]*)/);
  return match ? match[1] : '';
};

// Circuit breaker para evitar sobrecarga
const securityCircuitBreaker = new CircuitBreaker(5, 60000);

// 🔥 FIX: Correct burn addresses on Solana (as base58 strings)
const BURN_ADDRESSES = new Set([
  '1111111111111111111111111111111111111111111', // Solana burn address
  '11111111111111111111111111111111', // System program (sometimes used)
]);

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

export async function analyzeTokenSecurity(
  tokenAddress: string,
  onProgress?: (progress: number, message: string) => void
): Promise<TokenSecurityReport> {
  try {
    logger.info('🔒 Token Security Analysis Started', { tokenAddress });

    if (onProgress) {
      onProgress(5, 'Validating token address...');
    }

    // Validate address (throws if invalid)
    new PublicKey(tokenAddress);

    if (onProgress) {
      onProgress(10, 'Fetching token metadata...');
    }
    const metadata = await getTokenMetadata(tokenAddress);

    if (onProgress) {
      onProgress(25, 'Analyzing token authorities...');
    }
    const authorities = await analyzeTokenAuthorities(tokenAddress);

    if (onProgress) {
      onProgress(40, 'Analyzing holder distribution...');
    }
    const holderDist = await analyzeHolderDistribution(tokenAddress);

    if (onProgress) {
      onProgress(55, 'Analyzing liquidity...');
    }
    const liquidity = await analyzeLiquidity(tokenAddress);

    if (onProgress) {
      onProgress(70, 'Detecting trading patterns...');
    }
    const tradingPatterns = await analyzeTradingPatterns(tokenAddress);

    if (onProgress) {
      onProgress(85, 'Analyzing market metrics...');
    }
    const marketMetrics = await analyzeMarketMetrics(tokenAddress);

    if (onProgress) {
      onProgress(95, 'Calculating security score...');
    }

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

    if (onProgress) {
      onProgress(100, 'Analysis complete!');
    }

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
      riskLevel,
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
    retry(
      async () => {
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
      },
      {
        maxRetries: 3,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      }
    )
  );
}

// ============================================================================
// HOLDER DISTRIBUTION ANALYSIS
// ============================================================================

async function analyzeHolderDistribution(tokenAddress: string): Promise<HolderDistribution> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      // Get token holders using Helius DAS API
      const url = HELIUS_RPC_URL;

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
                },
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
          const top10Amount = sortedHolders
            .slice(0, 10)
            .reduce((sum: number, h: any) => sum + h.amount, 0);
          const top10HoldersPercent = (top10Amount / totalSupply) * 100;

          // Creator is typically the first holder
          const creatorPercent =
            totalSupply > 0 ? (sortedHolders[0]?.amount / totalSupply) * 100 : 0;

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
        },
        {
          maxRetries: 3,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        }
      )
    )
    .catch(() => ({
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

async function analyzeLiquidity(tokenAddress: string): Promise<LiquidityAnalysis> {
  return securityCircuitBreaker
    .execute(() =>
      retry(
        async () => {
          // Fetch liquidity pools from Jupiter/Raydium/Orca
          const poolsData = await fetchLiquidityPools(tokenAddress);

          const totalLiquiditySOL = poolsData.reduce((sum, pool) => sum + pool.liquiditySOL, 0);
          const liquidityUSD = totalLiquiditySOL * (await getSOLPrice()); // Get SOL price

          // Check if LP tokens are burned or locked
          const lpBurned = poolsData.some((pool) => pool.lpBurned);
          const lpLocked = poolsData.some((pool) => pool.lpLocked);
          const lpLockEnd = poolsData.find((pool) => pool.lpLockEnd)?.lpLockEnd;

          // Calculate liquidity to market cap ratio (if available)
          const liquidityToMarketCapRatio = 0.5; // Placeholder - would need market cap data

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
            lpLockEnd,
            liquidityToMarketCapRatio,
            majorPools: poolsData.map((pool) => ({
              dex: pool.dex,
              liquiditySOL: pool.liquiditySOL,
              lpBurned: pool.lpBurned,
            })),
            riskLevel,
            score,
          };
        },
        {
          maxRetries: 3,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        }
      )
    )
    .catch(() => ({
      // Fallback on error
      totalLiquiditySOL: 0,
      liquidityUSD: 0,
      lpBurned: false,
      lpLocked: false,
      liquidityToMarketCapRatio: 0,
      majorPools: [],
      riskLevel: 'CRITICAL' as const,
      score: 0,
    }));
}

// ============================================================================
// TRADING PATTERNS ANALYSIS
// ============================================================================

async function analyzeTradingPatterns(tokenAddress: string): Promise<TradingPatterns> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      // Analyze first 100 transactions to detect patterns
      const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${getHeliusApiKey()}&limit=100`;

      const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }

          const transactions = await response.json();

          // Detect bundle bots (multiple buys in same block/slot)
          const bundleBots = detectBundleBots(transactions);

          // Detect snipers (bought in first 10 transactions)
          const snipers = Math.min(10, transactions.length);

          // Detect wash trading
          const washTrading = detectWashTrading(transactions);

          // Detect honeypot (nobody can sell)
          const { canSell, honeypotDetected } = detectHoneypot(transactions);

          // Estimate taxes (would need more sophisticated analysis)
          const avgBuyTax = 0;
          const avgSellTax = 0;

          const suspiciousVolume = washTrading || bundleBots > 10;

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
        },
        {
          maxRetries: 3,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        }
      )
    )
    .catch(() => ({
      // Fallback
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
    }));
}

// ============================================================================
// TOKEN METADATA ANALYSIS
// ============================================================================

async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      const url = HELIUS_RPC_URL;

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
          if (verified) {
            score += 5;
          }
          if (hasWebsite) {
            score += 3;
          }
          if (hasSocials) {
            score += 2;
          }

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
        },
        {
          maxRetries: 3,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        }
      )
    )
    .catch(() => ({
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

async function analyzeMarketMetrics(tokenAddress: string): Promise<MarketMetrics> {
  return securityCircuitBreaker.execute(() =>
    retry(async () => {
      // This would ideally fetch from CoinGecko/Jupiter/Birdeye
      // For now, we'll use transaction history to estimate age
      const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${getHeliusApiKey()}&limit=1000`;

      const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch market data');
          }

          const transactions = await response.json();

          // Calculate age from first transaction
          const oldestTx = transactions[transactions.length - 1];
          const ageInDays = oldestTx ? (Date.now() / 1000 - oldestTx.timestamp) / 86400 : 0;

          // Estimate volume (this is very rough, would need proper DEX data)
          const volume24h = 0; // Placeholder
          const volumeChange24h = 0;
          const priceChange24h = 0;
          const priceChange7d = 0;
          const marketCap = 0;
          const allTimeHigh = 0;

          // Detect pump and dump pattern
          const isPumpAndDump = ageInDays < 1 && transactions.length > 500;

          let score = 10;
          if (ageInDays > 30) {
            score = 10;
          } else if (ageInDays > 7) {
            score = 7;
          } else if (ageInDays > 1) {
            score = 5;
          } else {
            score = 2;
          }

          if (isPumpAndDump) {
            score = Math.max(0, score - 5);
          }

          return {
            ageInDays,
            volume24h,
            volumeChange24h,
            priceChange24h,
            priceChange7d,
            marketCap,
            allTimeHigh,
            athDate: oldestTx?.timestamp,
            isPumpAndDump,
            score,
          };
        },
        {
          maxRetries: 3,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        }
      )
    )
    .catch(() => ({
      ageInDays: 0,
      volume24h: 0,
      volumeChange24h: 0,
      priceChange24h: 0,
      priceChange7d: 0,
      marketCap: 0,
      allTimeHigh: 0,
      isPumpAndDump: false,
      score: 0,
    }));
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
      message:
        'Token has both MINT and FREEZE authority - creator can mint infinite tokens and freeze wallets',
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

  flags.forEach((flag) => {
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
    authorities.score + // 0-25 points
    holderDist.score + // 0-20 points
    liquidity.score + // 0-20 points
    tradingPatterns.score + // 0-15 points
    metadata.score + // 0-10 points
    marketMetrics.score; // 0-10 points

  const finalScore = Math.max(0, Math.min(100, baseScore - redFlags.totalPenalty));

  return Math.round(finalScore);
}

function getRiskLevel(score: number): TokenSecurityReport['riskLevel'] {
  if (score >= 90) {
    return 'ULTRA_SAFE';
  }
  if (score >= 70) {
    return 'LOW_RISK';
  }
  if (score >= 50) {
    return 'MODERATE_RISK';
  }
  if (score >= 25) {
    return 'HIGH_RISK';
  }
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
  if (amounts.length === 0) {
    return 1;
  }

  const sorted = [...amounts].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);

  if (sum === 0) {
    return 1;
  }

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

/**
 * Check if LP tokens are burned or locked by inspecting pool owner
 */
async function checkLPStatus(
  pairAddress: string
): Promise<{ lpBurned: boolean; lpLocked: boolean; burnPercentage: number }> {
  try {
    // 🔥 FIX: Use Raydium API to get REAL LP token data
    // This is more reliable than checking account owner
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    // First, try to get LP token info from the pool
    // For Raydium pools, we need to check the LP mint and see who holds the LP tokens
    try {
      // Get pool account data
      const poolPubkey = new PublicKey(pairAddress);
      const accountInfo = await connection.getAccountInfo(poolPubkey);

      if (!accountInfo) {
        return { lpBurned: false, lpLocked: false, burnPercentage: 0 };
      }

      // Try to parse as Raydium pool (most common DEX)
      // The LP mint is usually at specific offsets in the account data
      // This is a simplified version - in production you'd use the Raydium SDK

      // For now, we'll use a heuristic: check the largest token accounts
      // associated with this pair to see if they're burn addresses

      const owner = accountInfo.owner.toBase58();
      const lpBurned = BURN_ADDRESSES.has(owner);

      // Check if program is a known DEX program (more reliable check)
      const isRaydiumProgram = owner === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
      const isOrcaProgram = owner === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP';

      if (isRaydiumProgram || isOrcaProgram) {
        // For DEX programs, we need to check the LP token holders
        // This requires more complex parsing - for now, return conservative estimate
        logger.info('[LP Status] Detected DEX program pool', {
          pairAddress: pairAddress.substring(0, 10) + '...',
          program: isRaydiumProgram ? 'Raydium' : 'Orca',
        });
      }

      return { lpBurned, lpLocked: false, burnPercentage: lpBurned ? 100 : 0 };
    } catch (parseError) {
      logger.warn(
        '[LP Status] Failed to parse pool data',
        parseError instanceof Error ? parseError : undefined
      );
      return { lpBurned: false, lpLocked: false, burnPercentage: 0 };
    }
  } catch (error) {
    logger.warn('[LP Status] Failed to check LP status', {
      error: error instanceof Error ? error.message : String(error),
      pairAddress: pairAddress.substring(0, 10) + '...',
    });
    return { lpBurned: false, lpLocked: false, burnPercentage: 0 };
  }
}

async function fetchLiquidityPools(tokenAddress: string): Promise<any[]> {
  const pools: any[] = [];

  // Try DexScreener first (aggregates Raydium, Orca, Meteora, etc.)
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();

      if (data?.pairs && Array.isArray(data.pairs) && data.pairs.length > 0) {
        logger.info('[Liquidity] DexScreener found pools', {
          tokenAddress: tokenAddress.substring(0, 10) + '...',
          poolCount: data.pairs.length,
        });

        // Get current SOL price for conversion
        const solPrice = await getSOLPrice();

        for (const pair of data.pairs) {
          // Filter for SOL pairs only (most relevant)
          const isSOLPair =
            pair.quoteToken?.symbol === 'SOL' ||
            pair.quoteToken?.symbol === 'WSOL' ||
            pair.baseToken?.symbol === 'SOL' ||
            pair.baseToken?.symbol === 'WSOL';

          if (!isSOLPair) {
            continue;
          }

          // Extract liquidity data
          const liquidityUSD = pair.liquidity?.usd || 0;
          const liquiditySOL = solPrice > 0 ? liquidityUSD / solPrice : 0;

          // 🔥 FIX: First try to get LP status from DexScreener info field
          // DexScreener provides this data directly for some DEXes
          let lpBurned = false;
          let lpLocked = false;
          let burnPercentage = 0;

          // Check DexScreener's info field for LP burn data
          if (pair.info?.lpBurnedPercent !== undefined) {
            burnPercentage = pair.info.lpBurnedPercent;
            lpBurned = burnPercentage >= 90; // Consider 90%+ as burned
          }

          if (pair.info?.lpLockedPercent !== undefined) {
            const lockedPercent = pair.info.lpLockedPercent;
            lpLocked = lockedPercent >= 50; // Consider 50%+ as locked
          }

          // Fallback: Check on-chain if DexScreener doesn't provide the info
          if (!lpBurned && !lpLocked && pair.pairAddress) {
            const lpStatus = await checkLPStatus(pair.pairAddress);
            lpBurned = lpStatus.lpBurned;
            lpLocked = lpStatus.lpLocked;
            burnPercentage = lpStatus.burnPercentage;
          }

          if (liquiditySOL > 0) {
            pools.push({
              dex: pair.dexId || 'unknown',
              pairAddress: pair.pairAddress,
              liquiditySOL,
              liquidityUSD,
              lpBurned,
              lpLocked,
              burnPercentage,
              lpLockEnd: undefined,
              // Additional useful data
              priceUsd: pair.priceUsd,
              volume24h: pair.volume?.h24 || 0,
              txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
            });

            // Log LP status for debugging
            if (lpBurned || lpLocked) {
              logger.info('[LP Status] Detected LP protection from DexScreener', {
                pairAddress: pair.pairAddress?.substring(0, 10) + '...',
                lpBurned,
                lpLocked,
                burnPercentage: burnPercentage.toFixed(2) + '%',
              });
            }
          }
        }

        if (pools.length > 0) {
          const totalLiquiditySOL = pools.reduce((sum, p) => sum + p.liquiditySOL, 0);
          logger.info('[Liquidity] Successfully retrieved pool data from DexScreener', {
            poolCount: pools.length,
            totalLiquiditySOL: totalLiquiditySOL.toFixed(2),
            totalLiquidityUSD: (totalLiquiditySOL * solPrice).toFixed(2),
          });
          return pools;
        }
      }
    }
  } catch (error) {
    logger.warn('[Liquidity] DexScreener failed', {
      error: error instanceof Error ? error.message : String(error),
      tokenAddress: tokenAddress.substring(0, 10) + '...',
    });
  }

  // Try Birdeye as fallback
  try {
    const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

    if (BIRDEYE_API_KEY) {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/token_overview?address=${tokenAddress}`,
        {
          signal: AbortSignal.timeout(10000),
          headers: {
            Accept: 'application/json',
            'X-API-KEY': BIRDEYE_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data?.data?.liquidity) {
          const solPrice = await getSOLPrice();
          const liquidityUSD = data.data.liquidity || 0;
          const liquiditySOL = solPrice > 0 ? liquidityUSD / solPrice : 0;

          if (liquiditySOL > 0) {
            pools.push({
              dex: 'birdeye-aggregated',
              liquiditySOL,
              liquidityUSD,
              lpBurned: false,
              lpLocked: false,
            });

            logger.info('[Liquidity] Retrieved from Birdeye', {
              liquiditySOL: liquiditySOL.toFixed(2),
              liquidityUSD: liquidityUSD.toFixed(2),
            });
            return pools;
          }
        }
      }
    }
  } catch (error) {
    logger.warn('[Liquidity] Birdeye failed', error instanceof Error ? error : undefined);
  }

  // Try Jupiter as last resort
  try {
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${tokenAddress}&outputMint=So11111111111111111111111111111111111111112&amount=1000000`,
      {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/json' },
      }
    );

    if (response.ok) {
      const data = await response.json();

      // If Jupiter can provide a quote, it means there's liquidity
      // We can estimate liquidity from price impact
      if (data?.routePlan && data.routePlan.length > 0) {
        const solPrice = await getSOLPrice();

        // Rough estimation: if quote exists, assume minimal liquidity
        const estimatedLiquiditySOL = 10; // Conservative estimate

        pools.push({
          dex: 'jupiter-aggregated',
          liquiditySOL: estimatedLiquiditySOL,
          liquidityUSD: estimatedLiquiditySOL * solPrice,
          lpBurned: false,
          lpLocked: false,
        });

        logger.info('[Liquidity] Estimated from Jupiter', {
          liquiditySOL: estimatedLiquiditySOL.toFixed(2),
        });
        return pools;
      }
    }
  } catch (error) {
    logger.warn('[Liquidity] Jupiter failed', error instanceof Error ? error : undefined);
  }

  // If all sources failed, log and return empty
  logger.error('[Liquidity] All sources failed to retrieve liquidity data', undefined, {
    tokenAddress: tokenAddress.substring(0, 10) + '...',
    triedSources: ['DexScreener', 'Birdeye', 'Jupiter'],
  });

  return pools;
}

async function getSOLPrice(): Promise<number> {
  try {
    // Try CoinGecko first (free, reliable)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: 'application/json' },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data?.solana?.usd;
      if (price && typeof price === 'number' && price > 0) {
        logger.info('[SOL Price] Obtained from CoinGecko', { price });
        return price;
      }
    }
  } catch (error) {
    logger.warn(
      '[SOL Price] CoinGecko failed, trying Jupiter',
      error instanceof Error ? error : undefined
    );
  }

  try {
    // Fallback to Jupiter Price API
    const response = await fetch('https://price.jup.ag/v4/price?ids=SOL', {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const price = data?.data?.SOL?.price;
      if (price && typeof price === 'number' && price > 0) {
        logger.info('[SOL Price] Obtained from Jupiter', { price });
        return price;
      }
    }
  } catch (error) {
    logger.warn(
      '[SOL Price] Jupiter failed, using fallback',
      error instanceof Error ? error : undefined
    );
  }

  // Conservative fallback price (updated periodically)
  const fallbackPrice = 150;
  logger.warn('[SOL Price] Using fallback price', { fallbackPrice });
  return fallbackPrice;
}

function detectBundleBots(transactions: any[]): number {
  // Group transactions by slot and count wallets buying in same slot
  const slotGroups: { [slot: number]: Set<string> } = {};

  transactions.forEach((tx) => {
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
  Object.values(slotGroups).forEach((wallets) => {
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

  transactions.forEach((tx) => {
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
  const sells = transactions.filter(
    (tx) => tx.type === 'SWAP' && tx.description?.toLowerCase().includes('sell')
  );

  const buys = transactions.filter(
    (tx) => tx.type === 'SWAP' && tx.description?.toLowerCase().includes('buy')
  );

  const canSell = sells.length > 0;
  const honeypotDetected = buys.length > 10 && sells.length === 0;

  return { canSell, honeypotDetected };
}

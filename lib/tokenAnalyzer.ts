import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from './logger';

// ═══════════════════════════════════════════════════════════════
// ANALIZADOR DE TOKENS MÁS COMPLETO DEL MUNDO
// ═══════════════════════════════════════════════════════════════

export interface TokenAnalysisResult {
  // Basic Info
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  supply: number;

  // SCORE FINAL (0-100)
  securityScore: number;
  riskLevel: 'ULTRA_SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'EXTREME_DANGER';
  recommendation: string;

  // CATEGORÍAS DE ANÁLISIS CON SCORES INDIVIDUALES
  authorityAnalysis: AuthorityAnalysis;
  holderAnalysis: HolderAnalysis;
  liquidityAnalysis: LiquidityAnalysis;
  tradingAnalysis: TradingAnalysis;
  metadataAnalysis: MetadataAnalysis;
  marketAnalysis: MarketAnalysis;

  // RED FLAGS
  redFlags: RedFlag[];
  criticalFlags: number;
  highFlags: number;
  totalPenalty: number;
}

export interface AuthorityAnalysis {
  score: number; // 0-100
  hasMintAuthority: boolean;
  hasFreezeAuthority: boolean;
  authoritiesRevoked: boolean;
  mintAuthorityAddress: string | null;
  freezeAuthorityAddress: string | null;
  warning: string | null;
  weight: number; // Peso en score final
}

export interface HolderAnalysis {
  score: number; // 0-100
  totalHolders: number;
  top10HoldersPercent: number;
  creatorPercent: number;
  concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Bundle Detection
  bundleDetected: boolean;
  bundleWallets: number;
  bundlePercent: number;

  // New Wallets Detection (< 10 días)
  newWalletsCount: number;
  newWalletsPercent: number;
  newWalletsHoldingPercent: number;

  // Top Holders Details
  topHolders: TopHolder[];
  weight: number;
}

export interface TopHolder {
  address: string;
  balance: number;
  percentage: number;
  isNew: boolean; // < 10 días
  createdAt: Date | null;
  txCount: number;
  suspiciousActivity: boolean;
}

export interface LiquidityAnalysis {
  score: number; // 0-100
  totalLiquiditySOL: number;
  liquidityUSD: number;
  lpBurned: boolean;
  lpLocked: boolean;
  lpLockEndDate: Date | null;
  lpProviders: number;
  rugPullRisk: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  weight: number;
}

export interface TradingAnalysis {
  score: number; // 0-100

  // Bundle & Sniper Detection
  bundleBots: number;
  snipers: number;

  // Wash Trading
  washTradingDetected: boolean;
  washTradingScore: number; // 0-100 (100 = definitivamente wash trading)

  // Honeypot
  honeypotDetected: boolean;
  canSell: boolean;
  sellTax: number;
  buyTax: number;

  // Trading Patterns
  suspiciousPatterns: string[];
  weight: number;
}

export interface MetadataAnalysis {
  score: number; // 0-100
  hasImage: boolean;
  hasDescription: boolean;
  hasWebsite: boolean;
  hasSocials: boolean;
  verified: boolean;
  completeness: number; // 0-100
  weight: number;
}

export interface MarketAnalysis {
  score: number; // 0-100
  ageInDays: number;
  volume24h: number;
  priceChange24h: number;
  marketCap: number;
  fdv: number;

  // Pump & Dump Detection
  isPumpAndDump: boolean;
  pumpScore: number; // 0-100

  // Volatility
  volatility: 'STABLE' | 'NORMAL' | 'HIGH' | 'EXTREME';

  weight: number;
}

export interface RedFlag {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  message: string;
  penalty: number; // Puntos restados del score
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE ANÁLISIS
// ═══════════════════════════════════════════════════════════════

export async function analyzeToken(tokenAddress: string): Promise<TokenAnalysisResult> {
  logger.info('🔍 Starting comprehensive token analysis:', { tokenAddress });

  const connection = new Connection(
    process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );

  try {
    const tokenPubkey = new PublicKey(tokenAddress);

    // Obtener información del token en paralelo
    const [
      mintInfo,
      tokenMetadata,
      holderData,
      liquidityData,
      tradingData,
      marketData
    ] = await Promise.all([
      getMintInfo(connection, tokenPubkey),
      getTokenMetadata(tokenAddress),
      analyzeHolders(tokenAddress),
      analyzeLiquidity(tokenAddress),
      analyzeTradingPatterns(tokenAddress),
      getMarketData(tokenAddress)
    ]);

    // Analizar autoridades
    const authorityAnalysis = analyzeAuthorities(mintInfo);

    // Analizar metadata
    const metadataAnalysis = analyzeMetadata(tokenMetadata);

    // Calcular score final
    const { securityScore, redFlags } = calculateSecurityScore({
      authorityAnalysis,
      holderAnalysis: holderData,
      liquidityAnalysis: liquidityData,
      tradingAnalysis: tradingData,
      metadataAnalysis,
      marketAnalysis: marketData
    });

    const riskLevel = getRiskLevel(securityScore);
    const recommendation = getRecommendation(securityScore, redFlags);

    const result: TokenAnalysisResult = {
      tokenAddress,
      tokenSymbol: tokenMetadata.symbol,
      tokenName: tokenMetadata.name,
      decimals: mintInfo.decimals,
      supply: mintInfo.supply,

      securityScore,
      riskLevel,
      recommendation,

      authorityAnalysis,
      holderAnalysis: holderData,
      liquidityAnalysis: liquidityData,
      tradingAnalysis: tradingData,
      metadataAnalysis,
      marketAnalysis: marketData,

      redFlags,
      criticalFlags: redFlags.filter(f => f.severity === 'CRITICAL').length,
      highFlags: redFlags.filter(f => f.severity === 'HIGH').length,
      totalPenalty: redFlags.reduce((sum, f) => sum + f.penalty, 0)
    };

    logger.info('✅ Token analysis complete:', {
      tokenAddress,
      securityScore,
      riskLevel,
      redFlagsCount: redFlags.length
    });

    return result;

  } catch (error) {
    logger.error('❌ Error analyzing token:', error instanceof Error ? error : undefined, {
      tokenAddress,
      error: String(error)
    });
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE ANÁLISIS INDIVIDUALES
// ═══════════════════════════════════════════════════════════════

async function getMintInfo(connection: Connection, mintPubkey: PublicKey) {
  const mintInfo = await connection.getParsedAccountInfo(mintPubkey);

  if (!mintInfo.value || !('parsed' in mintInfo.value.data)) {
    throw new Error('Invalid token mint');
  }

  const parsed = mintInfo.value.data.parsed.info;

  return {
    decimals: parsed.decimals,
    supply: parsed.supply / Math.pow(10, parsed.decimals),
    mintAuthority: parsed.mintAuthority,
    freezeAuthority: parsed.freezeAuthority
  };
}

function analyzeAuthorities(mintInfo: any): AuthorityAnalysis {
  const hasMintAuthority = mintInfo.mintAuthority !== null;
  const hasFreezeAuthority = mintInfo.freezeAuthority !== null;
  const authoritiesRevoked = !hasMintAuthority && !hasFreezeAuthority;

  let score = 100;
  let warning = null;

  // Penalizar si tiene mint authority
  if (hasMintAuthority) {
    score -= 40;
    warning = '⚠️ CRITICAL: Mint authority not revoked - infinite supply possible!';
  }

  // Penalizar si tiene freeze authority
  if (hasFreezeAuthority) {
    score -= 30;
    warning = warning
      ? warning + ' Freeze authority active - can freeze wallets!'
      : '⚠️ WARNING: Freeze authority active - can freeze wallets!';
  }

  return {
    score: Math.max(0, score),
    hasMintAuthority,
    hasFreezeAuthority,
    authoritiesRevoked,
    mintAuthorityAddress: mintInfo.mintAuthority,
    freezeAuthorityAddress: mintInfo.freezeAuthority,
    warning,
    weight: 25 // 25% del score final
  };
}

async function getTokenMetadata(tokenAddress: string) {
  // Placeholder - En producción usar Metaplex o Helius
  return {
    symbol: 'TOKEN',
    name: 'Token Name',
    description: '',
    image: '',
    website: '',
    twitter: '',
    telegram: ''
  };
}

async function analyzeHolders(tokenAddress: string): Promise<HolderAnalysis> {
  // Placeholder - Implementar con Helius DAS API
  // Aquí analizarás:
  // - Top holders
  // - Bundle detection (wallets creadas en la misma transacción)
  // - New wallets (< 10 días)
  // - Concentration risk

  return {
    score: 70,
    totalHolders: 1000,
    top10HoldersPercent: 35,
    creatorPercent: 15,
    concentrationRisk: 'MEDIUM',
    bundleDetected: false,
    bundleWallets: 0,
    bundlePercent: 0,
    newWalletsCount: 50,
    newWalletsPercent: 5,
    newWalletsHoldingPercent: 8,
    topHolders: [],
    weight: 25
  };
}

async function analyzeLiquidity(tokenAddress: string): Promise<LiquidityAnalysis> {
  // Placeholder - Implementar análisis de LP
  return {
    score: 80,
    totalLiquiditySOL: 100,
    liquidityUSD: 15000,
    lpBurned: false,
    lpLocked: true,
    lpLockEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    lpProviders: 5,
    rugPullRisk: 'LOW',
    weight: 20
  };
}

async function analyzeTradingPatterns(tokenAddress: string): Promise<TradingAnalysis> {
  // Placeholder - Implementar detección de patterns
  return {
    score: 75,
    bundleBots: 0,
    snipers: 2,
    washTradingDetected: false,
    washTradingScore: 10,
    honeypotDetected: false,
    canSell: true,
    sellTax: 0,
    buyTax: 0,
    suspiciousPatterns: [],
    weight: 20
  };
}

function analyzeMetadata(metadata: any): MetadataAnalysis {
  const hasImage = !!metadata.image;
  const hasDescription = !!metadata.description;
  const hasWebsite = !!metadata.website;
  const hasSocials = !!(metadata.twitter || metadata.telegram);

  let completeness = 0;
  if (hasImage) completeness += 25;
  if (hasDescription) completeness += 25;
  if (hasWebsite) completeness += 25;
  if (hasSocials) completeness += 25;

  return {
    score: completeness,
    hasImage,
    hasDescription,
    hasWebsite,
    hasSocials,
    verified: false,
    completeness,
    weight: 5
  };
}

async function getMarketData(tokenAddress: string): Promise<MarketAnalysis> {
  // Placeholder - Implementar con price APIs
  return {
    score: 65,
    ageInDays: 15,
    volume24h: 50000,
    priceChange24h: -5.2,
    marketCap: 250000,
    fdv: 300000,
    isPumpAndDump: false,
    pumpScore: 20,
    volatility: 'NORMAL',
    weight: 5
  };
}

// ═══════════════════════════════════════════════════════════════
// CÁLCULO DE SCORE Y RISK LEVEL
// ═══════════════════════════════════════════════════════════════

function calculateSecurityScore(analyses: {
  authorityAnalysis: AuthorityAnalysis;
  holderAnalysis: HolderAnalysis;
  liquidityAnalysis: LiquidityAnalysis;
  tradingAnalysis: TradingAnalysis;
  metadataAnalysis: MetadataAnalysis;
  marketAnalysis: MarketAnalysis;
}): { securityScore: number; redFlags: RedFlag[] } {

  const redFlags: RedFlag[] = [];

  // Calcular score ponderado
  let weightedScore = 0;
  weightedScore += analyses.authorityAnalysis.score * (analyses.authorityAnalysis.weight / 100);
  weightedScore += analyses.holderAnalysis.score * (analyses.holderAnalysis.weight / 100);
  weightedScore += analyses.liquidityAnalysis.score * (analyses.liquidityAnalysis.weight / 100);
  weightedScore += analyses.tradingAnalysis.score * (analyses.tradingAnalysis.weight / 100);
  weightedScore += analyses.metadataAnalysis.score * (analyses.metadataAnalysis.weight / 100);
  weightedScore += analyses.marketAnalysis.score * (analyses.marketAnalysis.weight / 100);

  // Generar red flags
  if (analyses.authorityAnalysis.hasMintAuthority) {
    redFlags.push({
      severity: 'CRITICAL',
      category: 'Authority',
      message: 'Mint authority NOT revoked - unlimited supply possible',
      penalty: 40
    });
  }

  if (analyses.authorityAnalysis.hasFreezeAuthority) {
    redFlags.push({
      severity: 'HIGH',
      category: 'Authority',
      message: 'Freeze authority active - can freeze user wallets',
      penalty: 30
    });
  }

  if (analyses.holderAnalysis.bundleDetected) {
    redFlags.push({
      severity: 'CRITICAL',
      category: 'Holders',
      message: `Bundle detected: ${analyses.holderAnalysis.bundleWallets} coordinated wallets`,
      penalty: 35
    });
  }

  if (analyses.holderAnalysis.top10HoldersPercent > 50) {
    redFlags.push({
      severity: 'HIGH',
      category: 'Holders',
      message: `High concentration: Top 10 holders own ${analyses.holderAnalysis.top10HoldersPercent}%`,
      penalty: 25
    });
  }

  if (!analyses.liquidityAnalysis.lpBurned && !analyses.liquidityAnalysis.lpLocked) {
    redFlags.push({
      severity: 'CRITICAL',
      category: 'Liquidity',
      message: 'LP not burned or locked - rug pull possible!',
      penalty: 40
    });
  }

  if (analyses.tradingAnalysis.honeypotDetected) {
    redFlags.push({
      severity: 'CRITICAL',
      category: 'Trading',
      message: 'HONEYPOT DETECTED - Cannot sell!',
      penalty: 100
    });
  }

  if (analyses.tradingAnalysis.washTradingDetected) {
    redFlags.push({
      severity: 'HIGH',
      category: 'Trading',
      message: 'Wash trading detected - fake volume',
      penalty: 30
    });
  }

  // Aplicar penalties
  const totalPenalty = redFlags.reduce((sum, flag) => sum + flag.penalty, 0);
  const finalScore = Math.max(0, Math.min(100, weightedScore - totalPenalty));

  return {
    securityScore: Math.round(finalScore),
    redFlags
  };
}

function getRiskLevel(score: number): 'ULTRA_SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'EXTREME_DANGER' {
  if (score >= 90) return 'ULTRA_SAFE';
  if (score >= 70) return 'LOW_RISK';
  if (score >= 50) return 'MODERATE_RISK';
  if (score >= 30) return 'HIGH_RISK';
  return 'EXTREME_DANGER';
}

function getRecommendation(score: number, redFlags: RedFlag[]): string {
  const criticalFlags = redFlags.filter(f => f.severity === 'CRITICAL');

  if (criticalFlags.length > 0) {
    return '🚨 DO NOT BUY - Critical security issues detected!';
  }

  if (score >= 90) return '✅ SAFE - Excellent security metrics';
  if (score >= 70) return '✔️ LOW RISK - Generally safe with minor concerns';
  if (score >= 50) return '⚠️ MODERATE RISK - Proceed with caution';
  if (score >= 30) return '⛔ HIGH RISK - Not recommended';
  return '🚨 EXTREME DANGER - Avoid at all costs!';
}

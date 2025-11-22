/**
 * 🔒 Environment Variables Validation
 *
 * Validates critical environment variables at startup
 * Prevents runtime errors from missing configuration
 */

import { logger } from './logger';

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Solana/Helius
  HELIUS_API_KEY: string;
  HELIUS_RPC_URL: string;

  // Security
  JWT_SECRET: string;

  // App Config
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_SOLANA_NETWORK: string;

  // Treasury (optional in dev)
  TREASURY_WALLET?: string;
  NEXT_PUBLIC_TREASURY_WALLET?: string;
}

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required in all environments
  const required = [
    'DATABASE_URL',
    'HELIUS_API_KEY',
    'HELIUS_RPC_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SOLANA_NETWORK',
  ];

  // Required only in production
  const requiredInProduction = [
    'TREASURY_WALLET',
    'NEXT_PUBLIC_TREASURY_WALLET',
  ];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production-only variables
  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  } else {
    // Warn if missing in development
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        warnings.push(`${key} not set (required in production)`);
      }
    }
  }

  // Validate JWT_SECRET length (min 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    warnings.push('DATABASE_URL should start with postgresql://');
  }

  // Validate SOLANA_NETWORK value
  const validNetworks = ['devnet', 'mainnet-beta', 'testnet'];
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK &&
      !validNetworks.includes(process.env.NEXT_PUBLIC_SOLANA_NETWORK)) {
    warnings.push(`NEXT_PUBLIC_SOLANA_NETWORK should be one of: ${validNetworks.join(', ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Log validation results
 */
export function logEnvValidation(): void {
  const result = validateEnv();

  if (!result.valid) {
    logger.error('Environment validation failed', undefined, {
      missing: result.missing,
      warnings: result.warnings,
    });

    // In production, throw error to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
    }
  } else if (result.warnings.length > 0) {
    logger.warn('Environment validation warnings', {
      warnings: result.warnings,
    });
  } else {
    logger.info('Environment validation passed');
  }
}

/**
 * Get typed environment config
 * Throws error if required variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const result = validateEnv();

  if (!result.valid) {
    throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
    HELIUS_RPC_URL: process.env.HELIUS_RPC_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK!,
    TREASURY_WALLET: process.env.TREASURY_WALLET,
    NEXT_PUBLIC_TREASURY_WALLET: process.env.NEXT_PUBLIC_TREASURY_WALLET,
  };
}

// Validate on import (only in Node.js environment)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  logEnvValidation();
}

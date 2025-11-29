/**
 * 🔥 Solscan DeFi Activities Service
 *
 * Fetches ONLY real DeFi activities from Solscan Pro API
 * This ensures we only analyze actual trading/DeFi activities,
 * not random transfers or spam transactions.
 */

import { retry, CircuitBreaker } from '../retryLogic';
import { logger } from '@/lib/logger';

const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY || '';
const SOLSCAN_BASE_URL = 'https://pro-api.solscan.io/v2.0';

// Circuit breaker for Solscan API
const solscanCircuitBreaker = new CircuitBreaker(5, 60000);

/**
 * DeFi Activity Types from Solscan
 */
export enum DefiActivityType {
  TOKEN_SWAP = 'ACTIVITY_TOKEN_SWAP',
  AGG_TOKEN_SWAP = 'ACTIVITY_AGG_TOKEN_SWAP',
  TOKEN_ADD_LIQ = 'ACTIVITY_TOKEN_ADD_LIQ',
  TOKEN_REMOVE_LIQ = 'ACTIVITY_TOKEN_REMOVE_LIQ',
  POOL_CREATE = 'ACTIVITY_POOL_CREATE',
  SPL_TOKEN_STAKE = 'ACTIVITY_SPL_TOKEN_STAKE',
  LST_STAKE = 'ACTIVITY_LST_STAKE',
  SPL_TOKEN_UNSTAKE = 'ACTIVITY_SPL_TOKEN_UNSTAKE',
  LST_UNSTAKE = 'ACTIVITY_LST_UNSTAKE',
  TOKEN_DEPOSIT_VAULT = 'ACTIVITY_TOKEN_DEPOSIT_VAULT',
  TOKEN_WITHDRAW_VAULT = 'ACTIVITY_TOKEN_WITHDRAW_VAULT',
  SPL_INIT_MINT = 'ACTIVITY_SPL_INIT_MINT',
  ORDERBOOK_ORDER_PLACE = 'ACTIVITY_ORDERBOOK_ORDER_PLACE',
  BORROWING = 'ACTIVITY_BORROWING',
  REPAY_BORROWING = 'ACTIVITY_REPAY_BORROWING',
  LIQUIDATE_BORROWING = 'ACTIVITY_LIQUIDATE_BORROWING',
  BRIDGE_ORDER_IN = 'ACTIVITY_BRIDGE_ORDER_IN',
  BRIDGE_ORDER_OUT = 'ACTIVITY_BRIDGE_ORDER_OUT',
}

/**
 * Router information for token swaps
 */
export interface RouterInfo {
  token1: string;
  token1_decimals: number;
  amount1: number;
  token2: string;
  token2_decimals: number;
  amount2: number;
  child_routers?: Array<{
    token1: string;
    token1_decimals: number;
    amount1: string;
    token2: string;
    token2_decimals: number;
    amount2: string;
  }>;
}

/**
 * DeFi Activity from Solscan
 */
export interface DefiActivity {
  block_id: number;
  trans_id: string; // Transaction signature
  block_time: number; // Unix timestamp
  time?: string; // ISO time string
  activity_type: DefiActivityType;
  from_address: string;
  to_address: string;
  platform: string; // DEX/Protocol address
  sources?: string[]; // Source addresses
  routers?: RouterInfo; // Swap details
  amount_info?: any; // Additional amount info
}

/**
 * Solscan API Response
 */
interface SolscanDefiResponse {
  success: boolean;
  data: DefiActivity[];
  errors?: {
    code: number;
    message: string;
  };
}

/**
 * Fetch DeFi activities for a wallet address
 *
 * @param walletAddress - Solana wallet address
 * @param options - Filtering options
 * @returns Array of DeFi activities
 */
export async function getWalletDefiActivities(
  walletAddress: string,
  options: {
    activityTypes?: DefiActivityType[];
    fromTime?: number; // Unix timestamp
    toTime?: number; // Unix timestamp
    pageSize?: number; // 10, 20, 30, 40, 60, 100
    page?: number;
  } = {}
): Promise<DefiActivity[]> {
  if (!SOLSCAN_API_KEY) {
    logger.error('❌ SOLSCAN_API_KEY not configured in environment variables');
    throw new Error('Solscan API key not configured');
  }

  return solscanCircuitBreaker.execute(() =>
    retry(
      async () => {
        // Build query parameters
        const params = new URLSearchParams({
          address: walletAddress,
          from: walletAddress, // Filter by wallet
          page_size: String(options.pageSize || 100),
          page: String(options.page || 1),
          sort_by: 'block_time',
          sort_order: 'desc',
        });

        // Add activity type filters if specified
        if (options.activityTypes && options.activityTypes.length > 0) {
          options.activityTypes.forEach((type) => {
            params.append('activity_type[]', type);
          });
        }

        // Add time range filters if specified
        if (options.fromTime) {
          params.append('from_time', String(options.fromTime));
        }
        if (options.toTime) {
          params.append('to_time', String(options.toTime));
        }

        const url = `${SOLSCAN_BASE_URL}/token/defi/activities?${params.toString()}`;

        logger.info('[Solscan] Fetching DeFi activities:', {
          wallet: walletAddress.substring(0, 10) + '...',
          pageSize: options.pageSize || 100,
          page: options.page || 1,
        });

        // Timeout of 30 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(url, {
            headers: {
              token: SOLSCAN_API_KEY,
              Accept: 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorDetails = '';
            try {
              const errorBody = await response.text();
              errorDetails = errorBody ? ` - ${errorBody.substring(0, 200)}` : '';
            } catch (e) {
              // Ignore
            }

            const error: any = new Error(
              `Solscan API error: ${response.status} ${response.statusText}${errorDetails}`
            );
            error.status = response.status;

            if (response.status === 400) {
              logger.error('[Solscan] Bad Request details:', undefined, {
                walletAddress: walletAddress.substring(0, 10) + '...',
                params: params.toString(),
              });
            }

            throw error;
          }

          const result: SolscanDefiResponse = await response.json();

          if (!result.success) {
            throw new Error(
              `Solscan API returned error: ${result.errors?.message || 'Unknown error'}`
            );
          }

          logger.info(`✅ [Solscan] Fetched ${result.data.length} DeFi activities`);

          return result.data;
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Solscan API timeout after 30 seconds');
          }
          throw error;
        }
      },
      {
        maxRetries: 3,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        onRetry: (attempt, error) => {
          logger.warn(`[Solscan] Retrying getWalletDefiActivities (attempt ${attempt}):`, {
            message: error.message,
          });
        },
      }
    )
  );
}

/**
 * Fetch all DeFi activities for a wallet (with pagination)
 *
 * @param walletAddress - Solana wallet address
 * @param maxActivities - Maximum number of activities to fetch (default: 1000)
 * @returns Array of all DeFi activities
 */
export async function getAllWalletDefiActivities(
  walletAddress: string,
  maxActivities: number = 1000
): Promise<DefiActivity[]> {
  const allActivities: DefiActivity[] = [];
  const pageSize = 100;
  let page = 1;
  let hasMore = true;

  logger.info(`🔍 [Solscan] Fetching all DeFi activities for wallet (max: ${maxActivities})`);

  while (hasMore && allActivities.length < maxActivities) {
    try {
      const activities = await getWalletDefiActivities(walletAddress, {
        pageSize,
        page,
        // Only fetch trading-related activities
        activityTypes: [
          DefiActivityType.TOKEN_SWAP,
          DefiActivityType.AGG_TOKEN_SWAP,
          DefiActivityType.TOKEN_ADD_LIQ,
          DefiActivityType.TOKEN_REMOVE_LIQ,
          DefiActivityType.ORDERBOOK_ORDER_PLACE,
        ],
      });

      if (activities.length === 0) {
        hasMore = false;
        break;
      }

      allActivities.push(...activities);

      logger.info(
        `📄 [Solscan] Page ${page}: ${activities.length} activities (total: ${allActivities.length})`
      );

      // If we got less than pageSize, there are no more pages
      if (activities.length < pageSize) {
        hasMore = false;
      }

      page++;

      // Rate limit: wait 200ms between requests
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      logger.error(
        `❌ [Solscan] Error fetching page ${page}`,
        error instanceof Error ? error : undefined,
        {
          error: String(error),
        }
      );
      // Stop pagination on error
      hasMore = false;
    }
  }

  logger.info(`✅ [Solscan] Total DeFi activities fetched: ${allActivities.length}`);

  return allActivities;
}

/**
 * Convert Solscan DeFi Activity to a standardized format
 * compatible with existing transaction processing
 */
export interface StandardizedActivity {
  signature: string;
  timestamp: number;
  type: string;
  activityType: DefiActivityType;
  platform: string;
  sources?: string[];
  swapInfo?: {
    tokenIn: string;
    tokenInDecimals: number;
    amountIn: number;
    tokenOut: string;
    tokenOutDecimals: number;
    amountOut: number;
  };
}

/**
 * Convert Solscan DeFi activities to standardized format
 */
export function standardizeDefiActivities(activities: DefiActivity[]): StandardizedActivity[] {
  return activities.map((activity) => {
    const standardized: StandardizedActivity = {
      signature: activity.trans_id,
      timestamp: activity.block_time,
      type: activity.activity_type,
      activityType: activity.activity_type,
      platform: activity.platform,
      sources: activity.sources,
    };

    // Extract swap information if available
    if (activity.routers) {
      standardized.swapInfo = {
        tokenIn: activity.routers.token1,
        tokenInDecimals: activity.routers.token1_decimals,
        amountIn: activity.routers.amount1,
        tokenOut: activity.routers.token2,
        tokenOutDecimals: activity.routers.token2_decimals,
        amountOut: activity.routers.amount2,
      };
    }

    return standardized;
  });
}

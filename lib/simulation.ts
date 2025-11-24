/**
 * Simulation Module for Load Testing and Stress Testing
 * Provides utilities to simulate user flows and measure performance
 */

import logger from './logger';

export interface SimulationResult {
  success: boolean;
  duration: number;
  errors?: string[];
  data?: unknown;
}

export interface LoadTestConfig {
  concurrentUsers?: number;
  requestsPerUser?: number;
  delayBetweenRequests?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: LoadTestConfig = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  delayBetweenRequests: 100,
  timeout: 30000,
};

/**
 * Simulate a typical user flow (wallet connection -> card generation -> export)
 */
export async function simulateUser(
  config: LoadTestConfig = {}
): Promise<SimulationResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Simulate wallet connection
    try {
      await simulateWalletConnection();
    } catch (error) {
      errors.push(`Wallet connection failed: ${error}`);
    }

    // Simulate card generation
    try {
      await simulateCardGeneration();
    } catch (error) {
      errors.push(`Card generation failed: ${error}`);
    }

    // Simulate card export
    try {
      await simulateCardExport();
    } catch (error) {
      errors.push(`Card export failed: ${error}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    logger.error('User simulation error:', error);
    return {
      success: false,
      duration: Date.now() - startTime,
      errors: [String(error)],
    };
  }
}

/**
 * Simulate trade/transaction flow
 */
export async function simulateTradeFlow(): Promise<SimulationResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Simulate wallet balance check
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));
    } catch (error) {
      errors.push(`Balance check failed: ${error}`);
    }

    // Simulate trade execution
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    } catch (error) {
      errors.push(`Trade execution failed: ${error}`);
    }

    // Simulate transaction confirmation
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
    } catch (error) {
      errors.push(`Transaction confirmation failed: ${error}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    logger.error('Trade flow simulation error:', error);
    return {
      success: false,
      duration: Date.now() - startTime,
      errors: [String(error)],
    };
  }
}

/**
 * Simulate card generation pipeline
 */
export async function simulateCardGeneration(): Promise<SimulationResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Analyze wallet
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
    } catch (error) {
      errors.push(`Wallet analysis failed: ${error}`);
    }

    // Generate score
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    } catch (error) {
      errors.push(`Score generation failed: ${error}`);
    }

    // Render card
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000));
    } catch (error) {
      errors.push(`Card rendering failed: ${error}`);
    }

    // Save to database
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));
    } catch (error) {
      errors.push(`Database save failed: ${error}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    logger.error('Card generation simulation error:', error);
    return {
      success: false,
      duration: Date.now() - startTime,
      errors: [String(error)],
    };
  }
}

/**
 * Simulate card export/sharing
 */
export async function simulateCardExport(): Promise<SimulationResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Generate export URL
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));
    } catch (error) {
      errors.push(`Export URL generation failed: ${error}`);
    }

    // Upload to storage
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
    } catch (error) {
      errors.push(`Upload to storage failed: ${error}`);
    }

    // Generate social media content
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    } catch (error) {
      errors.push(`Social content generation failed: ${error}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      duration,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    logger.error('Card export simulation error:', error);
    return {
      success: false,
      duration: Date.now() - startTime,
      errors: [String(error)],
    };
  }
}

/**
 * Run load test with multiple concurrent users
 */
export async function runLoadTest(
  config: LoadTestConfig = {}
): Promise<{
  success: boolean;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const results: SimulationResult[] = [];

  try {
    // Simulate concurrent users
    const users = Array(mergedConfig.concurrentUsers).fill(null);
    const userPromises = users.map(async () => {
      const userResults: SimulationResult[] = [];

      for (let i = 0; i < (mergedConfig.requestsPerUser || 5); i++) {
        const result = await simulateUser(mergedConfig);
        userResults.push(result);

        if (mergedConfig.delayBetweenRequests) {
          await new Promise((resolve) =>
            setTimeout(resolve, mergedConfig.delayBetweenRequests)
          );
        }
      }

      return userResults;
    });

    const allResults = await Promise.all(userPromises);
    allResults.forEach((userResults) => results.push(...userResults));

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;
    const durations = results.map((r) => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      success: failed === 0,
      totalRequests: results.length,
      successfulRequests: successful,
      failedRequests: failed,
      avgDuration: Math.round(avgDuration),
      minDuration,
      maxDuration,
    };
  } catch (error) {
    logger.error('Load test error:', error);
    throw error;
  }
}

/**
 * Simulate stress test - push system to limits
 */
export async function runStressTest(
  maxConcurrentUsers = 100
): Promise<{
  peakConcurrentUsers: number;
  totalSuccessful: number;
  totalFailed: number;
  avgResponseTime: number;
}> {
  const results: SimulationResult[] = [];
  let peakUsers = 0;

  try {
    // Gradually increase concurrent users until system degrades
    for (let concurrentUsers = 10; concurrentUsers <= maxConcurrentUsers; concurrentUsers += 10) {
      const testConfig: LoadTestConfig = {
        concurrentUsers,
        requestsPerUser: 1,
        delayBetweenRequests: 0,
      };

      const loadTestResult = await runLoadTest(testConfig);

      // If success rate drops below 80%, we've found the limit
      const successRate =
        loadTestResult.successfulRequests / loadTestResult.totalRequests;
      if (successRate < 0.8) {
        peakUsers = concurrentUsers - 10; // Last successful level
        break;
      }

      peakUsers = concurrentUsers;
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;
    const avgResponseTime =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length || 0;

    return {
      peakConcurrentUsers: peakUsers,
      totalSuccessful: successful,
      totalFailed: failed,
      avgResponseTime: Math.round(avgResponseTime),
    };
  } catch (error) {
    logger.error('Stress test error:', error);
    throw error;
  }
}

/**
 * Private helper: simulate wallet connection
 */
async function simulateWalletConnection(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 1000);
  });
}

import OpenAI from 'openai';
import { prisma } from './prisma';
import { logger } from './logger';

/**
 * AI Trading Coach
 * Uses OpenAI GPT-4 to analyze trading behavior and provide personalized insights
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CoachAnalysis {
  overallScore: number; // 0-100
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | 'degen';
  emotionalTrading: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  predictedROI: number | null;
  confidenceScore: number | null;
}

/**
 * Analyze a trader's performance using AI
 */
export async function analyzeTraderWithAI(walletAddress: string): Promise<CoachAnalysis> {
  try {
    logger.info('Starting AI analysis for:', { walletAddress });

    // 1. Fetch user's card and recent trades
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
      include: {
        badges: true,
      },
    });

    if (!card) {
      throw new Error('Card not found');
    }

    // 2. Fetch recent hot trades
    const recentTrades = await prisma.hotTrade.findMany({
      where: { walletAddress },
      orderBy: { timestamp: 'desc' },
      take: 50, // Last 50 trades
    });

    // 3. Calculate trading patterns
    const tradingStats = calculateTradingStats(card, recentTrades);

    // 4. Prepare prompt for AI
    const prompt = buildAnalysisPrompt(card, recentTrades, tradingStats);

    logger.debug('Sending to OpenAI:', { tradesCount: recentTrades.length });

    // 5. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert trading coach analyzing Solana cryptocurrency trading behavior.
          Provide brutally honest, actionable insights. Be specific and data-driven.
          Focus on psychology, discipline, risk management, and pattern recognition.
          Output must be in JSON format.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    logger.debug('Received AI response');

    // 6. Parse AI response
    const analysis = JSON.parse(aiResponse);

    // 7. Save analysis to database
    await prisma.aICoachAnalysis.create({
      data: {
        walletAddress,
        analyzedAt: new Date(),
        tradesAnalyzed: recentTrades.length,
        overallScore: analysis.overallScore || 50,
        strengths: JSON.stringify(analysis.strengths || []),
        weaknesses: JSON.stringify(analysis.weaknesses || []),
        recommendations: JSON.stringify(analysis.recommendations || []),
        patterns: JSON.stringify(analysis.patterns || []),
        riskProfile: analysis.riskProfile || 'moderate',
        emotionalTrading: analysis.emotionalTrading || 50,
        predictedROI: analysis.predictedROI,
        confidenceScore: analysis.confidenceScore,
        fullAnalysis: aiResponse,
      },
    });

    logger.info('AI analysis completed and saved');

    return {
      overallScore: analysis.overallScore || 50,
      riskProfile: analysis.riskProfile || 'moderate',
      emotionalTrading: analysis.emotionalTrading || 50,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      recommendations: analysis.recommendations || [],
      patterns: analysis.patterns || [],
      predictedROI: analysis.predictedROI || null,
      confidenceScore: analysis.confidenceScore || null,
    };
  } catch (error: any) {
    logger.error('Error in AI analysis:', error);
    throw error;
  }
}

/**
 * Calculate trading statistics from card and trades
 */
function calculateTradingStats(card: any, trades: any[]) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const tradesLast24h = trades.filter((t) => new Date(t.timestamp) > oneDayAgo);
  const tradesLastWeek = trades.filter((t) => new Date(t.timestamp) > oneWeekAgo);

  // Calculate time-based patterns
  const hourlyDistribution = trades.reduce((acc, trade) => {
    const hour = new Date(trade.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Find most active hours
  const mostActiveHours = Object.entries(hourlyDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // Token diversity
  const uniqueTokens = new Set(trades.map((t) => t.tokenSymbol)).size;

  // Average hold time (mock - would need actual data)
  const avgHoldTime = card.avgHoldTime || 0;

  return {
    tradesLast24h: tradesLast24h.length,
    tradesLastWeek: tradesLastWeek.length,
    mostActiveHours,
    uniqueTokens,
    avgHoldTime,
    totalTrades: trades.length,
  };
}

/**
 * Build comprehensive prompt for AI analysis
 */
function buildAnalysisPrompt(card: any, trades: any[], stats: any): string {
  return `Analyze this Solana trader's performance and provide coaching insights.

TRADER PROFILE:
- DegenScore: ${card.degenScore}/100
- Total Trades: ${card.totalTrades}
- Win Rate: ${card.winRate}%
- Total Volume: $${card.totalVolume.toFixed(2)}
- Profit/Loss: ${card.profitLoss >= 0 ? '+' : ''}$${card.profitLoss.toFixed(2)}
- Average Hold Time: ${card.avgHoldTime} hours
- Badges: ${card.badges.map((b: any) => b.name).join(', ') || 'None'}

RECENT ACTIVITY (Last 50 trades):
- Trades in last 24h: ${stats.tradesLast24h}
- Trades in last 7 days: ${stats.tradesLastWeek}
- Unique tokens traded: ${stats.uniqueTokens}
- Most active hours: ${stats.mostActiveHours.join(', ')}

TRADE HISTORY SAMPLE:
${trades
  .slice(0, 10)
  .map(
    (t) =>
      `- ${t.action.toUpperCase()} ${t.tokenSymbol} for ${t.solAmount.toFixed(2)} SOL (${new Date(
        t.timestamp
      ).toLocaleString()})`
  )
  .join('\n')}

Provide a detailed analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "riskProfile": "<conservative|moderate|aggressive|degen>",
  "emotionalTrading": <number 0-100, where 100 is very emotional>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "recommendations": ["<actionable recommendation 1>", ...],
  "patterns": ["<detected pattern 1>", ...],
  "predictedROI": <number, predicted ROI % for next 30 days>,
  "confidenceScore": <number 0-1>
}

Focus on:
1. Trading psychology and discipline
2. Risk management
3. Time-based patterns (when they trade affects results)
4. Token selection strategy
5. Entry/exit discipline
6. Emotional trading indicators

Be specific, honest, and actionable. No generic advice.`;
}

/**
 * Get latest AI analysis for a wallet
 */
export async function getLatestAnalysis(walletAddress: string): Promise<CoachAnalysis | null> {
  try {
    const analysis = await prisma.aICoachAnalysis.findFirst({
      where: { walletAddress },
      orderBy: { analyzedAt: 'desc' },
    });

    if (!analysis) {
      return null;
    }

    return {
      overallScore: analysis.overallScore,
      riskProfile: analysis.riskProfile as any,
      emotionalTrading: analysis.emotionalTrading,
      strengths: JSON.parse(analysis.strengths),
      weaknesses: JSON.parse(analysis.weaknesses),
      recommendations: JSON.parse(analysis.recommendations),
      patterns: JSON.parse(analysis.patterns),
      predictedROI: analysis.predictedROI,
      confidenceScore: analysis.confidenceScore,
    };
  } catch (error) {
    logger.error('Error getting latest analysis:', error);
    return null;
  }
}

/**
 * Check if user needs new analysis (throttling)
 */
export async function needsNewAnalysis(walletAddress: string): Promise<boolean> {
  try {
    const latestAnalysis = await prisma.aICoachAnalysis.findFirst({
      where: { walletAddress },
      orderBy: { analyzedAt: 'desc' },
    });

    if (!latestAnalysis) {
      return true; // No analysis yet
    }

    // Free users: 1 analysis per week
    // Premium users: 1 analysis per day
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
      select: { isPaid: true },
    });

    const cooldownHours = card?.isPaid ? 24 : 168; // 24h for premium, 168h (7 days) for free

    const hoursSinceLastAnalysis =
      (Date.now() - latestAnalysis.analyzedAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastAnalysis >= cooldownHours;
  } catch (error) {
    logger.error('Error checking analysis cooldown:', error);
    return false;
  }
}

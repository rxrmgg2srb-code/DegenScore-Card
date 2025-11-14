/**
 * Script para crear el challenge semanal
 * Ejecutar con: npx ts-node scripts/create-weekly-challenge.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Challenge templates (rotar semanalmente)
const challengeTemplates = [
  {
    title: '❤️ Most Loved Card',
    description: 'Get the most likes on your premium card this week!',
    metric: 'likes'
  },
  {
    title: '💰 Profit King',
    description: 'Achieve the highest profit this week!',
    metric: 'profit'
  },
  {
    title: '🎯 Win Rate Champion',
    description: 'Maintain the highest win rate this week!',
    metric: 'winRate'
  },
  {
    title: '📊 Volume Leader',
    description: 'Trade the highest volume this week!',
    metric: 'volume'
  },
  {
    title: '🚀 Best Single Trade',
    description: 'Make the most profitable single trade this week!',
    metric: 'bestTrade'
  }
];

async function main() {
  try {
    const now = new Date();

    // Calculate week number
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    console.log(`📅 Creating challenge for Week ${weekNumber} of ${now.getFullYear()}`);

    // Check if challenge already exists
    const existing = await prisma.weeklyChallenge.findUnique({
      where: { week: weekNumber }
    });

    if (existing) {
      console.log(`⚠️ Challenge for week ${weekNumber} already exists`);
      console.log(`   Title: ${existing.title}`);
      console.log(`   Prize: ${existing.prizeSOL} SOL`);
      return;
    }

    // Select challenge template (cycle through them)
    const templateIndex = weekNumber % challengeTemplates.length;
    const template = challengeTemplates[templateIndex];

    // Calculate start and end dates (Monday to Sunday)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay() + 1); // Monday
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sunday
    endDate.setHours(23, 59, 59, 999);

    // Create challenge
    const challenge = await prisma.weeklyChallenge.create({
      data: {
        week: weekNumber,
        year: now.getFullYear(),
        title: template.title,
        description: template.description,
        metric: template.metric,
        prizeSOL: 3.0,
        startDate,
        endDate,
        isActive: true
      }
    });

    console.log('✅ Weekly challenge created successfully:');
    console.log(`   Title: ${challenge.title}`);
    console.log(`   Metric: ${challenge.metric}`);
    console.log(`   Prize: ${challenge.prizeSOL} SOL`);
    console.log(`   Start: ${challenge.startDate.toISOString()}`);
    console.log(`   End: ${challenge.endDate.toISOString()}`);
    console.log('');
    console.log('🎉 Premium users can now compete for this week\'s challenge!');

  } catch (error) {
    console.error('❌ Error creating challenge:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

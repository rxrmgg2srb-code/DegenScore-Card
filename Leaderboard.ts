import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SortBy = 'degenScore' | 'totalVolume' | 'winRate' | 'profitLoss';
type FilterBy = 'all' | 'minted' | 'unminted';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sortBy = 'degenScore',
      filterBy = 'all',
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (filterBy === 'minted') {
      where.isMinted = true;
    } else if (filterBy === 'unminted') {
      where.isMinted = false;
    }

    // Build orderBy clause
    const orderBy: any = {};
    switch (sortBy as SortBy) {
      case 'degenScore':
        orderBy.degenScore = 'desc';
        break;
      case 'totalVolume':
        orderBy.totalVolume = 'desc';
        break;
      case 'winRate':
        orderBy.winRate = 'desc';
        break;
      case 'profitLoss':
        orderBy.profitLoss = 'desc';
        break;
    }

    // Get total count for pagination
    const totalCount = await prisma.degenCard.count({ where });
    const totalPages = Math.ceil(totalCount / limitNum);

    // Fetch entries
    const entries = await prisma.degenCard.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        badges: {
          select: {
            name: true,
            icon: true,
            rarity: true,
          },
        },
      },
    });

    res.status(200).json({
      entries,
      totalPages,
      currentPage: pageNum,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

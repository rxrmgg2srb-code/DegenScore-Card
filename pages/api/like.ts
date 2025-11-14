import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🟢 === LIKE API CALLED ===');
  console.log('🟢 Method:', req.method);
  console.log('🟢 Body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cardId, increment } = req.body;

    console.log('🟢 Parsed - cardId:', cardId);
    console.log('🟢 Parsed - increment:', increment);

    if (!cardId || typeof increment !== 'boolean') {
      console.error('❌ Invalid request data');
      return res.status(400).json({ error: 'Invalid request' });
    }

    // PASO 1: Buscar la card actual
    console.log('🔍 Buscando card con id:', cardId);
    const currentCard = await prisma.degenCard.findUnique({
      where: { id: cardId },
      select: { id: true, likes: true, walletAddress: true }
    });

    console.log('🔍 Card encontrada:', JSON.stringify(currentCard, null, 2));

    if (!currentCard) {
      console.error('❌ Card not found');
      return res.status(404).json({ error: 'Card not found' });
    }

    // PASO 2: Actualizar likes
    console.log('📝 Actualizando likes...');
    console.log('📝 Likes actuales:', currentCard.likes);
    console.log('📝 Incrementar:', increment ? '+1' : '-1');

    const updatedCard = await prisma.degenCard.update({
      where: { id: cardId },
      data: {
        likes: {
          increment: increment ? 1 : -1
        }
      }
    });

    console.log('✅ Card actualizada:', JSON.stringify(updatedCard, null, 2));
    console.log('✅ Nuevos likes:', updatedCard.likes);

    res.status(200).json({ success: true, likes: updatedCard.likes });
  } catch (error: any) {
    console.error('💥 ERROR COMPLETO:', error);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update likes', 
      details: error.message,
      code: error.code 
    });
  } finally {
    await prisma.$disconnect();
  }
}
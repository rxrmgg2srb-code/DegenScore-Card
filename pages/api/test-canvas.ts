import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from '@napi-rs/canvas';
import { logger } from '@/lib/logger';

/**
 * ENDPOINT DE TEST ULTRA SIMPLE
 * Solo dibuja un texto básico para verificar que canvas funciona
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info('🧪 TEST CANVAS - Starting...');

    // 1. Crear canvas simple
    const width = 600;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    logger.info('✅ Canvas created:', { width, height });

    // 2. Fondo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    logger.info('✅ Background drawn');

    // 3. Texto SIMPLE sin fonts especiales
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    logger.info('✅ Font set to:', ctx.font);

    // 4. Dibujar texto
    const text = 'TEST CANVAS VERCEL';
    ctx.fillText(text, width / 2, height / 2 - 60);
    logger.info('✅ Text 1 drawn:', text);

    ctx.font = '60px sans-serif';
    const score = '100';
    ctx.fillText(score, width / 2, height / 2 + 20);
    logger.info('✅ Text 2 drawn:', score);

    ctx.font = '20px sans-serif';
    const label = 'SCORE DE PRUEBA';
    ctx.fillText(label, width / 2, height / 2 + 80);
    logger.info('✅ Text 3 drawn:', label);

    // 5. Convertir a buffer
    const buffer = canvas.toBuffer('image/png');
    logger.info('✅ Buffer created:', { size: buffer.length });

    // 6. Enviar
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(buffer);

    logger.info('✅ TEST CANVAS - SUCCESS! Image sent');

  } catch (error) {
    logger.error('❌ TEST CANVAS - FAILED:', error instanceof Error ? error : undefined, {
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });

    res.status(500).json({
      error: 'Canvas test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

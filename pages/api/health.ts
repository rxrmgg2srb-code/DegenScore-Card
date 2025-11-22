import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

/**
 * Health check endpoint para Render y otros servicios de monitoreo
 * Retorna 200 si la aplicación está funcionando correctamente
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptar GET y HEAD requests (Render usa HEAD para health checks)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Para HEAD requests, solo retornar status 200
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  // Verificar variables de entorno críticas
  const checks = {
    nodeEnv: !!process.env.NODE_ENV,
    database: !!process.env.DATABASE_URL,
    helius: !!process.env.HELIUS_API_KEY,
    jwt: !!process.env.JWT_SECRET,
  };

  const allHealthy = Object.values(checks).every(Boolean);

  // Log para debugging usando logger estructurado
  logger.debug('Health check executed', checks);

  // Respuesta del health check
  const response = {
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks,
  };

  // Retornar 200 siempre (incluso si degraded) para que Render no reinicie
  res.status(200).json(response);
}

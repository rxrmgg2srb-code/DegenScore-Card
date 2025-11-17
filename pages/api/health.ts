import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Health check endpoint para Render y otros servicios de monitoreo
 * Retorna 200 si la aplicación está funcionando correctamente
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptar GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que estamos en producción o desarrollo
  const env = process.env.NODE_ENV || 'development';

  // Respuesta simple de health check
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env,
    uptime: process.uptime(),
  });
}

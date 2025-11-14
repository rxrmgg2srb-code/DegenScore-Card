// Admin endpoint to sync database schema without migration files
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simple security: require a secret token
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_SECRET || 'temp-admin-secret-123';

  if (authToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting database sync...');

    // Execute prisma db push
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
      cwd: process.cwd(),
      timeout: 60000, // 60 seconds timeout
    });

    console.log('✅ Database sync completed');
    console.log('STDOUT:', stdout);
    if (stderr) console.log('STDERR:', stderr);

    return res.status(200).json({
      success: true,
      message: 'Database synced successfully',
      output: stdout,
      stderr: stderr || null,
    });
  } catch (error: any) {
    console.error('❌ Database sync failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null,
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import crypto from 'crypto';
import { isValidSolanaAddress, isValidImageType } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimitRedis';
import { logger } from '../../lib/logger';
import { UPLOAD_CONFIG } from '../../lib/config';
import { uploadImage, isStorageEnabled } from '../../lib/storage/r2';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!(await rateLimit(req, res))) {
    return;
  }

  try {
    // Parse form data
    const form = new IncomingForm({
      maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const walletAddress = Array.isArray(fields.walletAddress)
      ? fields.walletAddress[0]
      : fields.walletAddress;

    // Validate wallet address
    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type by MIME
    if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Validate file type by magic numbers (prevents spoofing)
    const fileBuffer = fs.readFileSync(file.filepath);
    if (!isValidImageType(fileBuffer, file.mimetype || '')) {
      fs.unlinkSync(file.filepath); // Clean up
      return res.status(400).json({ error: 'File content does not match declared type' });
    }

    // Additional file size check (server-side)
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'File too large' });
    }

    // Check if R2 storage is configured
    if (!isStorageEnabled) {
      fs.unlinkSync(file.filepath);
      logger.error('R2 storage not configured');
      return res.status(500).json({
        error: 'Cloud storage not configured. Please contact administrator.'
      });
    }

    // Generate cryptographically secure random filename
    const ext = file.originalFilename?.split('.').pop() || 'jpg';
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${randomName}.${ext}`;
    const key = `profiles/${filename}`;

    // Upload to R2
    const imageUrl = await uploadImage(key, fileBuffer, {
      contentType: file.mimetype || 'image/jpeg',
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: {
        walletAddress: walletAddress,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Delete temporary file
    fs.unlinkSync(file.filepath);

    if (!imageUrl) {
      logger.error('Failed to upload image to R2 for wallet:', { walletAddress });
      return res.status(500).json({ error: 'Failed to upload image to storage' });
    }

    logger.info('Image uploaded successfully to R2 for wallet:', { walletAddress, imageUrl });

    res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    logger.error('Error uploading image:', error instanceof Error ? error : undefined, {
      error: String(error),
    });

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to upload image';

    res.status(500).json({ error: errorMessage });
  }
}

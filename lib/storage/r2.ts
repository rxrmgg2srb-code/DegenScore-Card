import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 es compatible con S3
// Gratis: 10GB storage + 10M requests/mes
// Si excede: Vercel Blob (100GB transfer gratis en Hobby)

const isR2Enabled = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);

const r2Client = isR2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'degenscore-images';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

/**
 * Upload image to R2
 */
export async function uploadImage(
  key: string,
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<string | null> {
  if (!isR2Enabled || !r2Client) {
    console.warn('R2 not configured, skipping upload');
    return null;
  }

  try {
    const {
      contentType = 'image/png',
      cacheControl = 'public, max-age=31536000, immutable',
      metadata = {},
    } = options;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: cacheControl,
        Metadata: metadata,
      })
    );

    // Retornar URL pública
    return `${PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('R2 upload error:', error);
    return null;
  }
}

/**
 * Get signed URL for private access (opcional)
 */
export async function getImageUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!isR2Enabled || !r2Client) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('R2 get URL error:', error);
    return null;
  }
}

/**
 * Delete image from R2
 */
export async function deleteImage(key: string): Promise<boolean> {
  if (!isR2Enabled || !r2Client) {
    return false;
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

/**
 * Generate key for card image
 */
export function generateCardImageKey(walletAddress: string): string {
  // Usar primeros y últimos caracteres de wallet + timestamp para evitar colisiones
  const timestamp = Date.now();
  const prefix = walletAddress.slice(0, 8);
  const suffix = walletAddress.slice(-8);
  return `cards/${prefix}-${suffix}-${timestamp}.png`;
}

/**
 * Get public URL for key
 */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export const isStorageEnabled = isR2Enabled;

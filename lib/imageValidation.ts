/**
 * Image validation using magic numbers (file signatures)
 * More secure than relying on MIME types or file extensions
 */

// Magic numbers for common image formats
const IMAGE_SIGNATURES = {
  jpeg: [
    [0xff, 0xd8, 0xff, 0xe0], // JPEG/JFIF
    [0xff, 0xd8, 0xff, 0xe1], // JPEG/Exif
    [0xff, 0xd8, 0xff, 0xe2], // JPEG/Canon
    [0xff, 0xd8, 0xff, 0xe8], // JPEG/SPIFF
  ],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  webp: [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (need to check WEBP at offset 8)
  ],
  bmp: [[0x42, 0x4d]], // BM
};

/**
 * Check if buffer starts with specific byte sequence
 */
function startsWithSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validate image format using magic numbers
 * Returns the detected format or null if invalid
 */
export function validateImageFormat(
  buffer: Buffer
): 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | null {
  // Check JPEG
  for (const signature of IMAGE_SIGNATURES.jpeg) {
    if (startsWithSignature(buffer, signature)) {
      return 'jpeg';
    }
  }

  // Check PNG
  for (const signature of IMAGE_SIGNATURES.png) {
    if (startsWithSignature(buffer, signature)) {
      return 'png';
    }
  }

  // Check GIF
  for (const signature of IMAGE_SIGNATURES.gif) {
    if (startsWithSignature(buffer, signature)) {
      return 'gif';
    }
  }

  // Check WebP (need to verify WEBP string at offset 8)
  for (const signature of IMAGE_SIGNATURES.webp) {
    if (startsWithSignature(buffer, signature)) {
      // Check for WEBP at offset 8
      const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
      if (buffer.length >= 12) {
        let isWebP = true;
        for (let i = 0; i < webpSignature.length; i++) {
          if (buffer[8 + i] !== webpSignature[i]) {
            isWebP = false;
            break;
          }
        }
        if (isWebP) return 'webp';
      }
    }
  }

  // Check BMP
  for (const signature of IMAGE_SIGNATURES.bmp) {
    if (startsWithSignature(buffer, signature)) {
      return 'bmp';
    }
  }

  return null;
}

/**
 * Validate image file (Node.js environment)
 */
export function validateImageFile(buffer: Buffer): {
  isValid: boolean;
  format: string | null;
  error?: string;
} {
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      format: null,
      error: 'Empty file',
    };
  }

  // Check minimum file size (at least 12 bytes for basic validation)
  if (buffer.length < 12) {
    return {
      isValid: false,
      format: null,
      error: 'File too small to be a valid image',
    };
  }

  const format = validateImageFormat(buffer);

  if (!format) {
    return {
      isValid: false,
      format: null,
      error: 'Invalid image format. Only JPEG, PNG, GIF, WebP, and BMP are supported.',
    };
  }

  return {
    isValid: true,
    format,
  };
}

/**
 * Validate image from File object (browser environment)
 */
export async function validateImageFromFile(file: File): Promise<{
  isValid: boolean;
  format: string | null;
  error?: string;
}> {
  if (!file) {
    return {
      isValid: false,
      format: null,
      error: 'No file provided',
    };
  }

  // Check file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      format: null,
      error: 'File too large. Maximum size is 5MB.',
    };
  }

  if (file.size < 12) {
    return {
      isValid: false,
      format: null,
      error: 'File too small to be a valid image',
    };
  }

  try {
    // Read first 12 bytes to check magic number
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const format = validateImageFormat(buffer);

    if (!format) {
      return {
        isValid: false,
        format: null,
        error: 'Invalid image format. Only JPEG, PNG, GIF, WebP, and BMP are supported.',
      };
    }

    return {
      isValid: true,
      format,
    };
  } catch (error) {
    return {
      isValid: false,
      format: null,
      error: 'Failed to read file',
    };
  }
}

/**
 * Get MIME type from detected format
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };

  return mimeTypes[format] || 'application/octet-stream';
}

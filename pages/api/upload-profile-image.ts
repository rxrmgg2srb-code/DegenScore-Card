import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';

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

  try {
    // Parse form data
    const form = new IncomingForm({
      maxFileSize: 2 * 1024 * 1024, // 2MB max
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

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const ext = path.extname(file.originalFilename || '.jpg');
    const filename = `${walletAddress.slice(0, 8)}_${timestamp}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Mover archivo
    fs.copyFileSync(file.filepath, filepath);

    // Eliminar archivo temporal
    fs.unlinkSync(file.filepath);

    // URL pública
    const imageUrl = `/uploads/profiles/${filename}`;

    res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

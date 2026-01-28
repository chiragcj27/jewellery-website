import { Request, Response } from 'express';
import { connectToDatabase, Asset } from '@jewellery-website/db';
import { uploadToS3, generateKey } from '../services/s3';
import { getErrorMessage } from '../utils/errors';

export function uploadNotConfigured(_req: Request, res: Response): void {
  res.status(503).json({
    success: false,
    error: 'File upload is not configured. Set AWS_S3_BUCKET and credentials.',
  });
}

export async function upload(req: Request, res: Response): Promise<void> {
  const file = req.file as Express.Multer.File | undefined;
  if (!file || !file.buffer) {
    res.status(400).json({ success: false, error: 'No file provided' });
    return;
  }

  try {
    await connectToDatabase();
    const prefix = 'assets';
    const key = generateKey(prefix, file.originalname || 'image');
    const { url } = await uploadToS3({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const asset = await Asset.create({
      key,
      url,
      mimeType: file.mimetype,
      size: file.size,
      originalFilename: file.originalname || 'image',
    });

    res.status(201).json({
      success: true,
      data: { url: asset.url, assetId: asset._id.toString(), key: asset.key },
    });
  } catch (e) {
    console.error('Asset upload error:', e);
    res.status(500).json({
      success: false,
      error: getErrorMessage(e),
    });
  }
}

import { Request, Response } from 'express';
import { connectToDatabase, Asset } from '@jewellery-website/db';
import { uploadToS3, generateKey } from '../services/s3';
import { getErrorMessage } from '../utils/errors';
import { deleteAssetById } from '../services/assets';

export function uploadNotConfigured(_req: Request, res: Response): void {
  res.status(503).json({
    success: false,
    error: 'File upload is not configured. Set AWS_S3_BUCKET and credentials.',
  });
}

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

export async function upload(req: Request, res: Response): Promise<void> {
  const file = req.file as Express.Multer.File | undefined;
  if (!file || !file.buffer) {
    res.status(400).json({ success: false, error: 'No file provided' });
    return;
  }

  try {
    await connectToDatabase(MONGODB_URI);
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

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase(MONGODB_URI);
    
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const assets = await Asset.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Asset.countDocuments();
    
    res.json({
      success: true,
      data: assets,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + assets.length < total,
      },
    });
  } catch (e) {
    console.error('Asset list error:', e);
    res.status(500).json({
      success: false,
      error: getErrorMessage(e),
    });
  }
}

export async function deleteAsset(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase(MONGODB_URI);
    
    const assetId = req.params.id;
    if (!assetId) {
      res.status(400).json({ success: false, error: 'Asset ID is required' });
      return;
    }
    
    const asset = await Asset.findById(assetId);
    if (!asset) {
      res.status(404).json({ success: false, error: 'Asset not found' });
      return;
    }
    
    // Check if asset is being used
    if (asset.refType && asset.refId) {
      res.status(400).json({
        success: false,
        error: `Asset is in use by ${asset.refType}. Please remove it from there first.`,
      });
      return;
    }
    
    await deleteAssetById(assetId);
    
    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (e) {
    console.error('Asset delete error:', e);
    res.status(500).json({
      success: false,
      error: getErrorMessage(e),
    });
  }
}

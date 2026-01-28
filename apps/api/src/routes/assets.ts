import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3_AVAILABLE } from '../services/s3';
import * as assetsController from '../controllers/assets.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
  },
});

router.post('/upload', (req: Request, res: Response): void => {
  if (!S3_AVAILABLE) {
    assetsController.uploadNotConfigured(req, res);
    return;
  }

  const mw = upload.single('file');
  mw(req, res, async (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(400).json({ success: false, error: message });
      return;
    }
    await assetsController.upload(req, res);
  });
});

export default router;

import express from 'express';
import multer from 'multer';
import { bulkUpload, downloadTemplate } from '../controllers/bulkUpload.controller';

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for ZIP files with images
  },
  fileFilter: (_req, file, cb) => {
    // Accept Excel files and ZIP files
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/zip', // .zip
      'application/x-zip-compressed', // .zip (alternative)
    ];
    
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .csv) and ZIP files are allowed'));
    }
  },
});

// POST /api/bulk-upload/products - Upload Excel file to bulk create products
router.post('/products', upload.single('file'), bulkUpload);

// GET /api/bulk-upload/template - Download Excel template
router.get('/template', downloadTemplate);

export default router;

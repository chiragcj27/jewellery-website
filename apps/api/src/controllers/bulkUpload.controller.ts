import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';
import { connectToDatabase, Product, Category, Subcategory, Asset } from '@jewellery-website/db';
import { slugify } from '../utils/slugify';
import { getErrorMessage } from '../utils/errors';
import { uploadToS3, generateKey, S3_AVAILABLE } from '../services/s3';

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

interface ExcelRow {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  shortDescription?: string;
  price?: number | string;
  compareAtPrice?: number | string;
  sku?: string;
  stock?: number | string;
  isActive?: boolean | string;
  isFeatured?: boolean | string;
  displayOrder?: number | string;
  images?: string; // Comma-separated URLs or filenames (from ZIP)
  filterValues?: string; // JSON string of filter values
  weightInGrams?: number | string; // Weight in grams for jewellery
  metalType?: string; // e.g., "22KT", "18KT", "20KT"
  useDynamicPricing?: boolean | string; // Use weight-based pricing
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

interface BulkUploadResult {
  success: boolean;
  message?: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
  createdProducts?: string[];
}

/**
 * Parse boolean values from Excel
 */
function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

/**
 * Parse number values from Excel
 */
function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Parse images string to array
 */
function parseImages(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

/**
 * Parse filter values JSON string
 */
function parseFilterValues(value: string | undefined): Record<string, string | string[]> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Check if a string is a URL
 */
function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a single row of product data
 */
async function validateRow(
  row: ExcelRow,
  rowIndex: number,
  categoriesMap: Map<string, string>,
  subcategoriesMap: Map<string, { id: string; categoryId: string }>
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Required fields
  if (!row.name || String(row.name).trim() === '') {
    errors.push({ row: rowIndex, field: 'name', message: 'Name is required' });
  }

  if (!row.category || String(row.category).trim() === '') {
    errors.push({ row: rowIndex, field: 'category', message: 'Category is required' });
  } else {
    const categoryName = String(row.category).trim();
    if (!categoriesMap.has(categoryName.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: 'category',
        message: `Category "${categoryName}" not found`,
        value: categoryName,
      });
    }
  }

  if (!row.subcategory || String(row.subcategory).trim() === '') {
    errors.push({ row: rowIndex, field: 'subcategory', message: 'Subcategory is required' });
  } else {
    const subcategoryName = String(row.subcategory).trim();
    const subcategoryData = subcategoriesMap.get(subcategoryName.toLowerCase());
    if (!subcategoryData) {
      errors.push({
        row: rowIndex,
        field: 'subcategory',
        message: `Subcategory "${subcategoryName}" not found`,
        value: subcategoryName,
      });
    } else if (row.category) {
      // Validate that subcategory belongs to the specified category
      const categoryId = categoriesMap.get(String(row.category).trim().toLowerCase());
      if (categoryId && subcategoryData.categoryId !== categoryId) {
        errors.push({
          row: rowIndex,
          field: 'subcategory',
          message: `Subcategory "${subcategoryName}" does not belong to category "${row.category}"`,
        });
      }
    }
  }

  // Validate pricing: either price OR (useDynamicPricing + weightInGrams + metalType)
  const useDynamicPricing = parseBoolean(row.useDynamicPricing);
  
  if (useDynamicPricing) {
    // Dynamic pricing: weight and metal type are required
    const weight = parseNumber(row.weightInGrams);
    if (weight === undefined || weight <= 0) {
      errors.push({
        row: rowIndex,
        field: 'weightInGrams',
        message: 'Valid weight (> 0) is required for dynamic pricing',
        value: row.weightInGrams,
      });
    }

    if (!row.metalType || String(row.metalType).trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'metalType',
        message: 'Metal type is required for dynamic pricing',
        value: row.metalType,
      });
    }
  } else {
    // Fixed pricing: price is required
    const price = parseNumber(row.price);
    if (price === undefined || price < 0) {
      errors.push({
        row: rowIndex,
        field: 'price',
        message: 'Valid price (>= 0) is required when not using dynamic pricing',
        value: row.price,
      });
    }
  }

  const compareAtPrice = parseNumber(row.compareAtPrice);
  if (compareAtPrice !== undefined && compareAtPrice < 0) {
    errors.push({
      row: rowIndex,
      field: 'compareAtPrice',
      message: 'Compare at price must be >= 0',
      value: row.compareAtPrice,
    });
  }

  const stock = parseNumber(row.stock);
  if (stock !== undefined && stock < 0) {
    errors.push({
      row: rowIndex,
      field: 'stock',
      message: 'Stock must be >= 0',
      value: row.stock,
    });
  }

  return errors;
}

/**
 * Bulk upload products from Excel file or ZIP with Excel + images
 */
export async function bulkUpload(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase(MONGODB_URI);

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    let rows: ExcelRow[] = [];
    let imageFilesMap = new Map<string, Buffer>(); // filename -> buffer

    // Check if uploaded file is a ZIP
    const isZip = req.file.mimetype === 'application/zip' || 
                  req.file.mimetype === 'application/x-zip-compressed' ||
                  req.file.originalname.toLowerCase().endsWith('.zip');

    if (isZip) {
      // Extract ZIP contents
      try {
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();

        let excelBuffer: Buffer | null = null;

        // Process ZIP entries
        for (const entry of zipEntries) {
          if (entry.isDirectory) continue;

          const fileName = entry.entryName.toLowerCase();
          
          // Find Excel file
          if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
            excelBuffer = entry.getData();
          }
          // Collect image files
          else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Store with just the filename (not full path)
            const baseName = entry.entryName.split('/').pop() || entry.entryName;
            imageFilesMap.set(baseName.toLowerCase(), entry.getData());
          }
        }

        if (!excelBuffer) {
          res.status(400).json({
            success: false,
            message: 'No Excel file found in ZIP. Please include a .xlsx, .xls, or .csv file.',
          });
          return;
        }

        // Parse Excel from ZIP
        const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { defval: undefined });

      } catch (error) {
        res.status(400).json({
          success: false,
          message: `Failed to extract ZIP file: ${getErrorMessage(error)}`,
        });
        return;
      }
    } else {
      // Parse Excel file directly
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: undefined });
    }

    if (rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Excel file is empty',
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
      });
      return;
    }

    // Fetch all categories and subcategories for validation
    const categories = await Category.find({ isActive: true });
    const subcategories = await Subcategory.find({});

    // Create lookup maps (case-insensitive)
    const categoriesMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoriesMap.set(cat.name.toLowerCase(), cat._id.toString());
      categoriesMap.set(cat.slug.toLowerCase(), cat._id.toString());
    });

    const subcategoriesMap = new Map<string, { id: string; categoryId: string }>();
    subcategories.forEach((sub) => {
      subcategoriesMap.set(sub.name.toLowerCase(), {
        id: sub._id.toString(),
        categoryId: sub.category.toString(),
      });
      subcategoriesMap.set(sub.slug.toLowerCase(), {
        id: sub._id.toString(),
        categoryId: sub.category.toString(),
      });
    });

    // Validate all rows first
    const allErrors: ValidationError[] = [];
    for (let i = 0; i < rows.length; i++) {
      const rowErrors = await validateRow(rows[i], i + 2, categoriesMap, subcategoriesMap);
      allErrors.push(...rowErrors);
    }

    // If there are validation errors, return them without creating any products
    if (allErrors.length > 0) {
      const result: BulkUploadResult = {
        success: false,
        message: 'Validation failed. Please fix the errors and try again.',
        totalRows: rows.length,
        successCount: 0,
        errorCount: allErrors.length,
        errors: allErrors,
      };
      res.status(400).json(result);
      return;
    }

    // All rows are valid, proceed with bulk insertion
    const createdProducts: string[] = [];
    const insertionErrors: ValidationError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        const categoryName = String(row.category).trim();
        const subcategoryName = String(row.subcategory).trim();
        const categoryId = categoriesMap.get(categoryName.toLowerCase())!;
        const subcategoryId = subcategoriesMap.get(subcategoryName.toLowerCase())!.id;

        // Process images
        const imageStrings = parseImages(row.images);
        const imageUrls: string[] = [];

        for (const imgStr of imageStrings) {
          if (isUrl(imgStr)) {
            // It's already a URL, use it directly
            imageUrls.push(imgStr);
          } else {
            // It's a filename, look for it in the ZIP
            const imageBuffer = imageFilesMap.get(imgStr.toLowerCase());
            if (imageBuffer) {
              // Upload to S3 if available
              if (S3_AVAILABLE) {
                try {
                  const key = generateKey('products', imgStr);
                  const mimeType = imgStr.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' :
                                   imgStr.match(/\.png$/i) ? 'image/png' :
                                   imgStr.match(/\.gif$/i) ? 'image/gif' :
                                   imgStr.match(/\.webp$/i) ? 'image/webp' : 'image/jpeg';
                  
                  const { url } = await uploadToS3({
                    key,
                    body: imageBuffer,
                    contentType: mimeType,
                  });

                  // Create asset record
                  const asset = new Asset({
                    url,
                    s3Key: key,
                    fileName: imgStr,
                    mimeType,
                    size: imageBuffer.length,
                    refType: 'Product',
                    refId: null, // Will be updated after product creation
                  });
                  await asset.save();

                  imageUrls.push(url);
                } catch (uploadError) {
                  console.warn(`Failed to upload image ${imgStr}:`, uploadError);
                  // Continue without this image
                }
              } else {
                console.warn(`S3 not available, skipping image upload for ${imgStr}`);
              }
            } else {
              // Image file not found in ZIP, skip it
              console.warn(`Image ${imgStr} referenced but not found in ZIP`);
            }
          }
        }

        const productData = {
          name: String(row.name).trim(),
          slug: slugify(String(row.name).trim()),
          category: new mongoose.Types.ObjectId(categoryId),
          subcategory: new mongoose.Types.ObjectId(subcategoryId),
          description: row.description ? String(row.description).trim() : undefined,
          shortDescription: row.shortDescription ? String(row.shortDescription).trim() : undefined,
          price: parseNumber(row.price),
          compareAtPrice: parseNumber(row.compareAtPrice),
          sku: row.sku ? String(row.sku).trim() : undefined,
          stock: parseNumber(row.stock) ?? 0,
          isActive: row.isActive !== undefined ? parseBoolean(row.isActive) : true,
          isFeatured: row.isFeatured !== undefined ? parseBoolean(row.isFeatured) : false,
          displayOrder: parseNumber(row.displayOrder) ?? 0,
          images: imageUrls,
          filterValues: parseFilterValues(row.filterValues),
          weightInGrams: parseNumber(row.weightInGrams),
          metalType: row.metalType ? String(row.metalType).trim() : undefined,
          useDynamicPricing: row.useDynamicPricing !== undefined ? parseBoolean(row.useDynamicPricing) : false,
        };

        const product = new Product(productData);
        await product.save();
        createdProducts.push(product._id.toString());
      } catch (error: unknown) {
        insertionErrors.push({
          row: rowNumber,
          field: 'general',
          message: getErrorMessage(error),
        });
      }
    }

    const result: BulkUploadResult = {
      success: insertionErrors.length === 0,
      message:
        insertionErrors.length === 0
          ? `Successfully created ${createdProducts.length} products${imageFilesMap.size > 0 ? ` with ${imageFilesMap.size} images` : ''}`
          : `Created ${createdProducts.length} products with ${insertionErrors.length} errors`,
      totalRows: rows.length,
      successCount: createdProducts.length,
      errorCount: insertionErrors.length,
      errors: insertionErrors,
      createdProducts,
    };

    res.status(insertionErrors.length === 0 ? 201 : 207).json(result);
  } catch (error: unknown) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    });
  }
}

/**
 * Download Excel template with proper headers
 */
export async function downloadTemplate(_req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase(MONGODB_URI);

    // Fetch categories and subcategories for reference
    const categories = await Category.find({ isActive: true }).select('name slug');
    const subcategories = await Subcategory.find({}).populate('category', 'name');

    // Create template data with example row
    const templateData = [
      {
        name: 'Example Product Name',
        category: categories.length > 0 ? categories[0].name : 'Rings',
        subcategory: subcategories.length > 0 ? (subcategories[0] as any).name : 'Gold Rings',
        description: 'Detailed product description',
        shortDescription: 'Brief product description',
        price: 99.99,
        compareAtPrice: 149.99,
        sku: 'PROD-001',
        stock: 10,
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
        images: 'https://example.com/image1.jpg,image1.jpg,image2.jpg',
        filterValues: '{"material":"Gold","color":"Yellow"}',
        weightInGrams: 5.5,
        metalType: '22KT',
        useDynamicPricing: false,
      },
    ];

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Add a reference sheet with categories and subcategories
    const referenceData: Array<{ Type: string; Name: string; Slug: string; Category?: string }> = [];
    
    categories.forEach((cat) => {
      referenceData.push({
        Type: 'Category',
        Name: cat.name,
        Slug: cat.slug,
      });
    });

    subcategories.forEach((sub) => {
      referenceData.push({
        Type: 'Subcategory',
        Name: sub.name,
        Slug: sub.slug,
        Category: typeof sub.category === 'object' ? (sub.category as any).name : '',
      });
    });

    const referenceSheet = XLSX.utils.json_to_sheet(referenceData);
    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Reference');

    // Add instructions sheet
    const instructions = [
      { Instruction: '1. Fill the Products sheet with your product data' },
      { Instruction: '2. Required fields: name, category, subcategory' },
      { Instruction: '3. For pricing, choose one of two options:' },
      { Instruction: '   a) Fixed price: Set price field, leave useDynamicPricing as false' },
      { Instruction: '   b) Weight-based: Set weightInGrams, metalType, useDynamicPricing=true' },
      { Instruction: '4. For images, you have 3 options:' },
      { Instruction: '   a) Provide full URLs (https://...)' },
      { Instruction: '   b) Provide filenames (image1.jpg) and include images in a ZIP with this Excel file' },
      { Instruction: '   c) Leave empty and add images later' },
      { Instruction: '5. Use comma to separate multiple images' },
      { Instruction: '6. Check the Reference sheet for valid categories and subcategories' },
      { Instruction: '7. Boolean fields accept: true/false, yes/no, 1/0' },
      { Instruction: '8. Metal types: 22KT, 18KT, 20KT, 24KT, Silver, Platinum, etc.' },
      { Instruction: '9. Upload just the Excel file, or a ZIP containing Excel + image files' },
    ];
    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=product_upload_template.xlsx');
    res.send(buffer);
  } catch (error: unknown) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
}

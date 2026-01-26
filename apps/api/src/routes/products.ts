import { Router, Request, Response } from 'express';
import { connectToDatabase, Product, Category, Subcategory, IProduct } from '@jewellery-website/db';
import mongoose from 'mongoose';

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const router = Router();

// GET - Fetch all products (optionally filtered by category or subcategory)
router.get('/', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const categoryId = req.query.categoryId as string;
    const subcategoryId = req.query.subcategoryId as string;
    
    const query: Partial<IProduct> = {};
    if (categoryId) query.category = new mongoose.Types.ObjectId(categoryId);
    if (subcategoryId) query.subcategory = new mongoose.Types.ObjectId(subcategoryId);
    
    const products = await Product.find(query as mongoose.FilterQuery<IProduct>)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    return res.json({ success: true, data: products });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// GET - Fetch a single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// POST - Create a new product
router.post('/', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const {
      name,
      category,
      subcategory,
      description,
      shortDescription,
      images,
      price,
      compareAtPrice,
      sku,
      stock,
      isActive,
      isFeatured,
      displayOrder,
      metadata,
    } = req.body;
    
    if (!name || !category || !subcategory || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, subcategory, and price are required',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Verify subcategory exists and belongs to category
    const subcategoryExists = await Subcategory.findById(subcategory);
    if (!subcategoryExists) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }

    if (subcategoryExists.category.toString() !== category) {
      return res.status(400).json({
        success: false,
        error: 'Subcategory does not belong to the specified category',
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = new Product({
      name,
      slug,
      category,
      subcategory,
      description,
      shortDescription,
      images: images || [],
      price,
      compareAtPrice,
      sku,
      stock: stock !== undefined ? stock : 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      displayOrder: displayOrder || 0,
      metadata: metadata || {},
    });

    await product.save();
    await product.populate('category', 'name slug');
    await product.populate('subcategory', 'name slug');

    return res.status(201).json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error creating product:', error);

    if (isMongoDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        error: 'Product with this name or slug already exists in this category/subcategory',
      });
    }

    return res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// PUT - Update a product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const {
      name,
      category,
      subcategory,
      description,
      shortDescription,
      images,
      price,
      compareAtPrice,
      sku,
      stock,
      isActive,
      isFeatured,
      displayOrder,
      metadata,
    } = req.body;
    
    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      // Regenerate slug if name changes
      updateData.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    if (category !== undefined) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      updateData.category = category;
    }
    
    if (subcategory !== undefined) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) {
        return res.status(404).json({ success: false, error: 'Subcategory not found' });
      }
      
      // If category is also being updated, use the new category, otherwise get from existing product
      const finalCategory = category || (await Product.findById(req.params.id))?.category;
      if (subcategoryExists.category.toString() !== finalCategory?.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Subcategory does not belong to the specified category',
        });
      }
      
      updateData.subcategory = subcategory;
    }
    
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (images !== undefined) updateData.images = images;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (sku !== undefined) updateData.sku = sku;
    if (stock !== undefined) updateData.stock = stock;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (metadata !== undefined) updateData.metadata = metadata;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error updating product:', error);

    if (isMongoDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        error: 'Product with this name or slug already exists in this category/subcategory',
      });
    }

    return res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// DELETE - Delete a product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { connectToDatabase, Product, Category, Subcategory, Asset, IProduct } from '@jewellery-website/db';
import { deleteAssetsByIds } from '../services/assets';
import { slugify } from '../utils/slugify';
import { getErrorMessage, isMongoDuplicateKeyError } from '../utils/errors';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const categoryId = req.query.categoryId as string;
    const subcategoryId = req.query.subcategoryId as string;
    const searchRaw = String(req.query.search || '').trim();

    const query: mongoose.FilterQuery<IProduct> = {};
    if (categoryId) query.category = new mongoose.Types.ObjectId(categoryId);
    if (subcategoryId) query.subcategory = new mongoose.Types.ObjectId(subcategoryId);

    const featuredOnly = String(req.query.featured || '').toLowerCase() === 'true';
    if (featuredOnly) {
      query.isFeatured = true;
    }

    if (searchRaw) {
      const esc = searchRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: esc, $options: 'i' } },
        { sku: { $regex: esc, $options: 'i' } },
        { slug: { $regex: esc, $options: 'i' } },
        { description: { $regex: esc, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, totalCount, page, limit });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getBySku(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const sku = (req.params.sku ?? '').trim();
    if (!sku) {
      res.status(400).json({ success: false, error: 'SKU is required' });
      return;
    }
    const product = await Product.findOne({ sku })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .lean();

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error fetching product by SKU:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const imageAssetIds = (req.body.imageAssetIds as string[] | undefined) || [];
  const bodyImages = Array.isArray(req.body.images) ? req.body.images : [];
  let imageUrls: string[] = bodyImages;

  if (imageAssetIds.length > 0) {
    await connectToDatabase();
    const assets = await Asset.find({ _id: { $in: imageAssetIds } });
    if (assets.length !== imageAssetIds.length) {
      res.status(400).json({ success: false, error: 'One or more imageAssetIds are invalid' });
      return;
    }
    imageUrls = bodyImages.length > 0 ? bodyImages : assets.map((a) => a.url);
  }

  try {
    await connectToDatabase();
    const {
      name,
      category,
      subcategory,
      description,
      sizeLength,
      price,
      compareAtPrice,
      sku,
      stock,
      isActive,
      isFeatured,
      displayOrder,
      filterValues,
      metadata,
      weightInGrams,
      metalType,
      wastagePercentage,
      useDynamicPricing,
      hasStone,
      stoneName,
      stoneWeight,
      stoneValue,
    } = req.body;

    if (!name || !category || !subcategory) {
      res.status(400).json({
        success: false,
        error: 'Name, category, and subcategory are required',
      });
      return;
    }

    if (!sku || String(sku).trim() === '') {
      res.status(400).json({
        success: false,
        error: 'SKU is required (used for product URL slug)',
      });
      return;
    }

    // Validate pricing: either price OR (useDynamicPricing + weightInGrams + metalType)
    if (!useDynamicPricing && price === undefined) {
      res.status(400).json({
        success: false,
        error: 'Price is required when not using dynamic pricing',
      });
      return;
    }

    if (useDynamicPricing && (!weightInGrams || !metalType)) {
      res.status(400).json({
        success: false,
        error: 'Weight and metal type are required for dynamic pricing',
      });
      return;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const subcategoryExists = await Subcategory.findById(subcategory);
    if (!subcategoryExists) {
      res.status(404).json({ success: false, error: 'Subcategory not found' });
      return;
    }

    if (subcategoryExists.category.toString() !== category) {
      res.status(400).json({
        success: false,
        error: 'Subcategory does not belong to the specified category',
      });
      return;
    }

    const skuTrimmed = String(sku).trim();
    const product = new Product({
      name,
      slug: slugify(skuTrimmed),
      category,
      subcategory,
      description,
      sizeLength,
      images: imageUrls,
      price,
      compareAtPrice,
      sku: skuTrimmed,
      stock: stock !== undefined ? stock : 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      displayOrder: displayOrder || 0,
      filterValues: filterValues || {},
      metadata: metadata || {},
      weightInGrams: weightInGrams !== undefined ? weightInGrams : undefined,
      metalType: metalType || undefined,
      wastagePercentage: wastagePercentage !== undefined ? wastagePercentage : undefined,
      useDynamicPricing: useDynamicPricing || false,
      hasStone: hasStone !== undefined ? hasStone : false,
      stoneName: stoneName || undefined,
      stoneWeight: stoneWeight !== undefined ? stoneWeight : undefined,
      stoneValue: stoneValue !== undefined ? stoneValue : undefined,
    });

    await product.save();
    await product.populate('category', 'name slug');
    await product.populate('subcategory', 'name slug');

    if (imageAssetIds.length > 0) {
      await Asset.updateMany(
        { _id: { $in: imageAssetIds } },
        { refType: 'Product', refId: product._id }
      );
    }

    res.status(201).json({ success: true, data: product });
  } catch (error: unknown) {
    if (imageAssetIds.length > 0) {
      try {
        await deleteAssetsByIds(imageAssetIds);
      } catch (cleanupErr) {
        console.warn('Cleanup of uploaded assets failed:', cleanupErr);
      }
    }
    console.error('Error creating product:', error);

    if (isMongoDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        error: 'Product with this name or slug already exists in this category/subcategory',
      });
      return;
    }
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const imageAssetIds = (req.body.imageAssetIds as string[] | undefined) || [];
  const bodyImages = Array.isArray(req.body.images) ? req.body.images : undefined;
  let imageUrls: string[] | undefined = bodyImages;

  if (imageAssetIds.length > 0) {
    await connectToDatabase();
    const assets = await Asset.find({ _id: { $in: imageAssetIds } });
    if (assets.length !== imageAssetIds.length) {
      res.status(400).json({ success: false, error: 'One or more imageAssetIds are invalid' });
      return;
    }
    imageUrls = bodyImages && bodyImages.length > 0 ? bodyImages : assets.map((a) => a.url);
  }

  try {
    await connectToDatabase();
    const {
      name,
      category,
      subcategory,
      description,
      sizeLength,
      price,
      compareAtPrice,
      sku,
      stock,
      isActive,
      isFeatured,
      displayOrder,
      filterValues,
      metadata,
      weightInGrams,
      metalType,
      wastagePercentage,
      useDynamicPricing,
      hasStone,
      stoneName,
      stoneWeight,
      stoneValue,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;

    if (sku !== undefined) {
      const skuTrimmed = String(sku).trim();
      if (skuTrimmed === '') {
        res.status(400).json({
          success: false,
          error: 'SKU cannot be empty (used for product URL slug)',
        });
        return;
      }
      updateData.sku = skuTrimmed;
      updateData.slug = slugify(skuTrimmed);
    }

    if (category !== undefined) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(404).json({ success: false, error: 'Category not found' });
        return;
      }
      updateData.category = category;
    }

    if (subcategory !== undefined) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) {
        res.status(404).json({ success: false, error: 'Subcategory not found' });
        return;
      }
      const finalCategory = category || (await Product.findById(req.params.id))?.category;
      if (subcategoryExists.category.toString() !== (finalCategory as mongoose.Types.ObjectId)?.toString()) {
        res.status(400).json({
          success: false,
          error: 'Subcategory does not belong to the specified category',
        });
        return;
      }
      updateData.subcategory = subcategory;
    }

    if (description !== undefined) updateData.description = description;
    if (sizeLength !== undefined) updateData.sizeLength = sizeLength;
    if (imageUrls !== undefined) updateData.images = imageUrls;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (stock !== undefined) updateData.stock = stock;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (filterValues !== undefined) updateData.filterValues = filterValues;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (weightInGrams !== undefined) updateData.weightInGrams = weightInGrams;
    if (metalType !== undefined) updateData.metalType = metalType;
    if (wastagePercentage !== undefined) updateData.wastagePercentage = wastagePercentage;
    if (useDynamicPricing !== undefined) updateData.useDynamicPricing = useDynamicPricing;
    if (hasStone !== undefined) updateData.hasStone = hasStone;
    if (stoneName !== undefined) updateData.stoneName = stoneName;
    if (stoneWeight !== undefined) updateData.stoneWeight = stoneWeight;
    if (stoneValue !== undefined) updateData.stoneValue = stoneValue;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    if (imageAssetIds.length > 0) {
      await Asset.updateMany(
        { _id: { $in: imageAssetIds } },
        { refType: 'Product', refId: product._id }
      );
    }

    res.json({ success: true, data: product });
  } catch (error: unknown) {
    if (imageAssetIds.length > 0) {
      try {
        await deleteAssetsByIds(imageAssetIds);
      } catch (cleanupErr) {
        console.warn('Cleanup of uploaded assets failed:', cleanupErr);
      }
    }
    console.error('Error updating product:', error);

    if (isMongoDuplicateKeyError(error)) {
      res.status(409).json({
        success: false,
        error: 'Product with this name or slug already exists in this category/subcategory',
      });
      return;
    }
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

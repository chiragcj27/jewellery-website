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

    const query: Partial<IProduct> = {};
    if (categoryId) query.category = new mongoose.Types.ObjectId(categoryId);
    if (subcategoryId) query.subcategory = new mongoose.Types.ObjectId(subcategoryId);

    const products = await Product.find(query as mongoose.FilterQuery<IProduct>)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({ success: true, data: products });
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
      shortDescription,
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
      useDynamicPricing,
    } = req.body;

    if (!name || !category || !subcategory) {
      res.status(400).json({
        success: false,
        error: 'Name, category, and subcategory are required',
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

    const product = new Product({
      name,
      slug: slugify(name),
      category,
      subcategory,
      description,
      shortDescription,
      images: imageUrls,
      price,
      compareAtPrice,
      sku,
      stock: stock !== undefined ? stock : 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      displayOrder: displayOrder || 0,
      filterValues: filterValues || {},
      metadata: metadata || {},
      weightInGrams: weightInGrams !== undefined ? weightInGrams : undefined,
      metalType: metalType || undefined,
      useDynamicPricing: useDynamicPricing || false,
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
      shortDescription,
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
      useDynamicPricing,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
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
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (imageUrls !== undefined) updateData.images = imageUrls;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (sku !== undefined) updateData.sku = sku;
    if (stock !== undefined) updateData.stock = stock;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (filterValues !== undefined) updateData.filterValues = filterValues;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (weightInGrams !== undefined) updateData.weightInGrams = weightInGrams;
    if (metalType !== undefined) updateData.metalType = metalType;
    if (useDynamicPricing !== undefined) updateData.useDynamicPricing = useDynamicPricing;

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

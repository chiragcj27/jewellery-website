import { Request, Response } from 'express';
import { connectToDatabase, Category, Subcategory, Asset, ICategory } from '@jewellery-website/db';
import { deleteAssetById } from '../services/assets';
import { slugify } from '../utils/slugify';
import { getErrorMessage } from '../utils/errors';

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const imageAssetId = req.body.imageAssetId as string | undefined;
  const cardImageAssetId = req.body.cardImageAssetId as string | undefined;
  const cardImageHoverAssetId = req.body.cardImageHoverAssetId as string | undefined;
  let imageUrl: string | undefined = req.body.image;
  let cardImageUrl: string | undefined = req.body.cardImage;
  let cardImageHoverUrl: string | undefined = req.body.cardImageHover;

  await connectToDatabase();

  if (imageAssetId) {
    const asset = await Asset.findById(imageAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid imageAssetId' }); return; }
    imageUrl = asset.url;
  }
  if (cardImageAssetId) {
    const asset = await Asset.findById(cardImageAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid cardImageAssetId' }); return; }
    cardImageUrl = asset.url;
  }
  if (cardImageHoverAssetId) {
    const asset = await Asset.findById(cardImageHoverAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid cardImageHoverAssetId' }); return; }
    cardImageHoverUrl = asset.url;
  }

  const allAssetIds = [imageAssetId, cardImageAssetId, cardImageHoverAssetId].filter(Boolean) as string[];

  try {
    const { name, description, isActive, displayOrder, filters } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }

    const category = new Category({
      name,
      slug: slugify(name),
      description,
      image: imageUrl,
      cardImage: cardImageUrl,
      cardImageHover: cardImageHoverUrl,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      filters: filters || [],
    });

    await category.save();

    for (const assetId of allAssetIds) {
      await Asset.findByIdAndUpdate(assetId, { refType: 'Category', refId: category._id });
    }

    res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    for (const assetId of allAssetIds) {
      try { await deleteAssetById(assetId); } catch (cleanupErr) {
        console.warn('Cleanup of uploaded asset failed:', cleanupErr);
      }
    }
    console.error('Error creating category:', error);
    const status = error instanceof Error ? 409 : 500;
    const message =
      error instanceof Error ? 'Category with this name or slug already exists' : getErrorMessage(error);
    res.status(status).json({ success: false, error: message });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const imageAssetId = req.body.imageAssetId as string | undefined;
  const cardImageAssetId = req.body.cardImageAssetId as string | undefined;
  const cardImageHoverAssetId = req.body.cardImageHoverAssetId as string | undefined;
  let imageUrl: string | undefined = req.body.image;
  let cardImageUrl: string | undefined = req.body.cardImage;
  let cardImageHoverUrl: string | undefined = req.body.cardImageHover;

  await connectToDatabase();

  if (imageAssetId) {
    const asset = await Asset.findById(imageAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid imageAssetId' }); return; }
    imageUrl = asset.url;
  }
  if (cardImageAssetId) {
    const asset = await Asset.findById(cardImageAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid cardImageAssetId' }); return; }
    cardImageUrl = asset.url;
  }
  if (cardImageHoverAssetId) {
    const asset = await Asset.findById(cardImageHoverAssetId);
    if (!asset) { res.status(400).json({ success: false, error: 'Invalid cardImageHoverAssetId' }); return; }
    cardImageHoverUrl = asset.url;
  }

  const allAssetIds = [imageAssetId, cardImageAssetId, cardImageHoverAssetId].filter(Boolean) as string[];

  try {
    const { name, description, isActive, displayOrder, filters } = req.body;

    const updateData: Partial<ICategory> = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (cardImageUrl !== undefined) updateData.cardImage = cardImageUrl;
    if (cardImageHoverUrl !== undefined) updateData.cardImageHover = cardImageHoverUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (filters !== undefined) updateData.filters = filters;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    for (const assetId of allAssetIds) {
      await Asset.findByIdAndUpdate(assetId, { refType: 'Category', refId: category._id });
    }

    res.json({ success: true, data: category });
  } catch (error: unknown) {
    for (const assetId of allAssetIds) {
      try { await deleteAssetById(assetId); } catch (cleanupErr) {
        console.warn('Cleanup of uploaded asset failed:', cleanupErr);
      }
    }
    console.error('Error updating category:', error);
    const status = error instanceof Error ? 409 : 500;
    const message =
      error instanceof Error ? 'Category with this name or slug already exists' : getErrorMessage(error);
    res.status(status).json({ success: false, error: message });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();

    const subcategoryCount = await Subcategory.countDocuments({ category: req.params.id });
    if (subcategoryCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing subcategories',
      });
      return;
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

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

export async function create(req: Request, res: Response): Promise<void> {
  const imageAssetId = req.body.imageAssetId as string | undefined;
  let imageUrl: string | undefined = req.body.image;

  if (imageAssetId) {
    await connectToDatabase();
    const asset = await Asset.findById(imageAssetId);
    if (!asset) {
      res.status(400).json({ success: false, error: 'Invalid imageAssetId' });
      return;
    }
    imageUrl = asset.url;
  }

  try {
    await connectToDatabase();
    const { name, description, isActive, displayOrder } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }

    const category = new Category({
      name,
      slug: slugify(name),
      description,
      image: imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    await category.save();

    if (imageAssetId) {
      await Asset.findByIdAndUpdate(imageAssetId, {
        refType: 'Category',
        refId: category._id,
      });
    }

    res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    if (imageAssetId) {
      try {
        await deleteAssetById(imageAssetId);
      } catch (cleanupErr) {
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
  let imageUrl: string | undefined = req.body.image;

  if (imageAssetId) {
    await connectToDatabase();
    const asset = await Asset.findById(imageAssetId);
    if (!asset) {
      res.status(400).json({ success: false, error: 'Invalid imageAssetId' });
      return;
    }
    imageUrl = asset.url;
  }

  try {
    await connectToDatabase();
    const { name, description, isActive, displayOrder } = req.body;

    const updateData: Partial<ICategory> = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    if (imageAssetId) {
      await Asset.findByIdAndUpdate(imageAssetId, {
        refType: 'Category',
        refId: category._id,
      });
    }

    res.json({ success: true, data: category });
  } catch (error: unknown) {
    if (imageAssetId) {
      try {
        await deleteAssetById(imageAssetId);
      } catch (cleanupErr) {
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

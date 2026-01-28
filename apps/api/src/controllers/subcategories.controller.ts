import { Request, Response } from 'express';
import { connectToDatabase, Subcategory, Category, Product, Asset, ISubcategory } from '@jewellery-website/db';
import { deleteAssetById } from '../services/assets';
import { slugify } from '../utils/slugify';
import { getErrorMessage } from '../utils/errors';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const categoryId = req.query.categoryId as string;
    const query = categoryId ? { category: categoryId } : {};
    const subcategories = await Subcategory.find(query)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: subcategories });
  } catch (error: unknown) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name slug');
    if (!subcategory) {
      res.status(404).json({ success: false, error: 'Subcategory not found' });
      return;
    }
    res.json({ success: true, data: subcategory });
  } catch (error: unknown) {
    console.error('Error fetching subcategory:', error);
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
    const { name, category, description, isActive, displayOrder } = req.body;

    if (!name || !category) {
      res.status(400).json({ success: false, error: 'Name and category are required' });
      return;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const subcategory = new Subcategory({
      name,
      slug: slugify(name),
      category,
      description,
      image: imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    await subcategory.save();
    await subcategory.populate('category', 'name slug');

    if (imageAssetId) {
      await Asset.findByIdAndUpdate(imageAssetId, {
        refType: 'Subcategory',
        refId: subcategory._id,
      });
    }

    res.status(201).json({ success: true, data: subcategory });
  } catch (error: unknown) {
    if (imageAssetId) {
      try {
        await deleteAssetById(imageAssetId);
      } catch (cleanupErr) {
        console.warn('Cleanup of uploaded asset failed:', cleanupErr);
      }
    }
    console.error('Error creating subcategory:', error);
    const status = error instanceof Error ? 409 : 500;
    const message =
      error instanceof Error
        ? 'Subcategory with this name or slug already exists in this category'
        : getErrorMessage(error);
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
    const { name, category, description, isActive, displayOrder } = req.body;

    const updateData: Partial<ISubcategory> = {};
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
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!subcategory) {
      res.status(404).json({ success: false, error: 'Subcategory not found' });
      return;
    }

    if (imageAssetId) {
      await Asset.findByIdAndUpdate(imageAssetId, {
        refType: 'Subcategory',
        refId: subcategory._id,
      });
    }

    res.json({ success: true, data: subcategory });
  } catch (error: unknown) {
    if (imageAssetId) {
      try {
        await deleteAssetById(imageAssetId);
      } catch (cleanupErr) {
        console.warn('Cleanup of uploaded asset failed:', cleanupErr);
      }
    }
    console.error('Error updating subcategory:', error);
    const status = error instanceof Error ? 409 : 500;
    const message =
      error instanceof Error
        ? 'Subcategory with this name or slug already exists in this category'
        : getErrorMessage(error);
    res.status(status).json({ success: false, error: message });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();

    const productCount = await Product.countDocuments({ subcategory: req.params.id });
    if (productCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete subcategory with existing products',
      });
      return;
    }

    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      res.status(404).json({ success: false, error: 'Subcategory not found' });
      return;
    }

    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

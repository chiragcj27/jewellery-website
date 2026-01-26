import { Router, Request, Response } from 'express';
import { connectToDatabase, Category, Subcategory, ICategory } from '@jewellery-website/db';

const router = Router();

// GET - Fetch all categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
    return res.json({ success: true, data: categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET - Fetch a single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    return res.json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST - Create a new category
router.post('/', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const { name, description, image, isActive, displayOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = new Category({
      name,
      slug,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    await category.save();
    return res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    
    if (error instanceof Error) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name or slug already exists',
      });
    }
    
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT - Update a category
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const { name, description, image, isActive, displayOrder } = req.body;
    
    const updateData: Partial<ICategory> = {};
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
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    return res.json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    
    if (error instanceof Error) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name or slug already exists',
      });
    }
    
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE - Delete a category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    
    // Check if category has subcategories
    const subcategoryCount = await Subcategory.countDocuments({ category: req.params.id });
    
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing subcategories',
      });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;

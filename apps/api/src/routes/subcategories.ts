import { Router, Request, Response } from 'express';
import { connectToDatabase, Subcategory, Category, Product, ISubcategory } from '@jewellery-website/db';

const router = Router();

// GET - Fetch all subcategories (optionally filtered by category)
router.get('/', async (req: Request, res: Response) => {
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
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET - Fetch a single subcategory
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name slug');
    
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    
    return res.json({ success: true, data: subcategory });
  } catch (error: unknown) {
    console.error('Error fetching subcategory:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST - Create a new subcategory
router.post('/', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const { name, category, description, image, isActive, displayOrder } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const subcategory = new Subcategory({
      name,
      slug,
      category,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });

    await subcategory.save();
    await subcategory.populate('category', 'name slug');
    
    return res.status(201).json({ success: true, data: subcategory });
  } catch (error: unknown) {
    console.error('Error creating subcategory:', error);
    
    if (error instanceof Error) {
      return res.status(409).json({
        success: false,
        error: 'Subcategory with this name or slug already exists in this category',
      }); 
    }
    
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT - Update a subcategory
router.put('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    const { name, category, description, image, isActive, displayOrder } = req.body;
    
    const updateData: Partial<ISubcategory> = {};
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
      // Verify category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      updateData.category = category;
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    
    return res.json({ success: true, data: subcategory });
  } catch (error: unknown) {
    console.error('Error updating subcategory:', error);
    
    if (error instanceof Error) {
      return res.status(409).json({
        success: false,
        error: 'Subcategory with this name or slug already exists in this category',
      });
    }
    
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE - Delete a subcategory
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    
    // Check if subcategory has products
    const productCount = await Product.countDocuments({ subcategory: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete subcategory with existing products',
      });
    }
    
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    
    return res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting subcategory:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;

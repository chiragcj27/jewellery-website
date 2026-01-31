import { Request, Response } from 'express';
import { Banner } from '@jewellery-website/db';

/**
 * Get all banners
 */
export const getBanners = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    const filter: { isActive?: boolean } = {};
    if (active === 'true') {
      filter.isActive = true;
    }

    const banners = await Banner.find(filter).sort({ displayOrder: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch banners',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single banner by ID
 */
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }

    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ 
      error: 'Failed to fetch banner',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new banner
 */
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating banner with data:', req.body);
    const { image, link, title, displayOrder, isActive } = req.body;

    if (!image) {
      console.log('Error: Image is required');
      res.status(400).json({ error: 'Image is required' });
      return;
    }

    // Get the highest display order and add 1
    const highestBanner = await Banner.findOne().sort({ displayOrder: -1 });
    const nextDisplayOrder = highestBanner ? highestBanner.displayOrder + 1 : 0;
    console.log('Next display order:', nextDisplayOrder);

    const banner = await Banner.create({
      image,
      link: link || '',
      title: title || '',
      displayOrder: displayOrder !== undefined ? displayOrder : nextDisplayOrder,
      isActive: isActive !== undefined ? isActive : true,
    });

    console.log('Banner created successfully:', banner._id);
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ 
      error: 'Failed to create banner',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a banner
 */
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { image, link, title, displayOrder, isActive } = req.body;

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }

    // Update fields
    if (image !== undefined) banner.image = image;
    if (link !== undefined) banner.link = link;
    if (title !== undefined) banner.title = title;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;
    if (isActive !== undefined) banner.isActive = isActive;

    await banner.save();

    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ 
      error: 'Failed to update banner',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a banner
 */
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }

    res.json({ message: 'Banner deleted successfully', banner });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ 
      error: 'Failed to delete banner',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update banner display orders (for reordering)
 */
export const updateBannerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orders } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(orders)) {
      res.status(400).json({ error: 'Orders must be an array' });
      return;
    }

    // Update each banner's display order
    const updatePromises = orders.map(({ id, displayOrder }) =>
      Banner.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    // Return updated banners
    const banners = await Banner.find().sort({ displayOrder: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Error updating banner orders:', error);
    res.status(500).json({ 
      error: 'Failed to update banner orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

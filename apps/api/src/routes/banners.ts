import { Router } from 'express';
import * as bannersController from '../controllers/banners.controller';

const router = Router();

/**
 * @route   GET /api/banners
 * @desc    Get all banners (optionally filter by active)
 * @access  Public
 */
router.get('/', bannersController.getBanners);

/**
 * @route   GET /api/banners/:id
 * @desc    Get a single banner by ID
 * @access  Public
 */
router.get('/:id', bannersController.getBannerById);

/**
 * @route   POST /api/banners
 * @desc    Create a new banner
 * @access  Admin (currently no auth, add middleware later)
 */
router.post('/', bannersController.createBanner);

/**
 * @route   PUT /api/banners/:id
 * @desc    Update a banner
 * @access  Admin (currently no auth, add middleware later)
 */
router.put('/:id', bannersController.updateBanner);

/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete a banner
 * @access  Admin (currently no auth, add middleware later)
 */
router.delete('/:id', bannersController.deleteBanner);

/**
 * @route   PUT /api/banners/reorder
 * @desc    Update banner display orders
 * @access  Admin (currently no auth, add middleware later)
 */
router.put('/bulk/reorder', bannersController.updateBannerOrders);

export default router;

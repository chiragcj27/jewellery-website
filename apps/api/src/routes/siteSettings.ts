import { Router } from 'express';
import * as siteSettingsController from '../controllers/siteSettings.controller';

const router = Router();

/**
 * @route   GET /api/site-settings
 * @desc    Get site settings
 * @access  Public
 */
router.get('/', siteSettingsController.getSiteSettings);

/**
 * @route   PUT /api/site-settings
 * @desc    Update site settings
 * @access  Admin (currently no auth, add middleware later)
 */
router.put('/', siteSettingsController.updateSiteSettings);

export default router;

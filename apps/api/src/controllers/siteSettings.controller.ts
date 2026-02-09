import { Request, Response } from 'express';
import { SiteSettings } from '@jewellery-website/db';

/**
 * Get site settings (or create default if none exists)
 */
export const getSiteSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await SiteSettings.create({
        preHeaderText: '✨ Free shipping on orders over $150',
        preHeaderLink: '',
        whatsappEnquiryNumber: '',
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch site settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update site settings
 */
export const updateSiteSettings = async (req: Request, res: Response) => {
  try {
    const { preHeaderText, preHeaderLink, whatsappEnquiryNumber } = req.body;

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        preHeaderText: preHeaderText || '✨ Free shipping on orders over $150',
        preHeaderLink: preHeaderLink || '',
        whatsappEnquiryNumber: whatsappEnquiryNumber || '',
      });
    } else {
      if (preHeaderText !== undefined) settings.preHeaderText = preHeaderText;
      if (preHeaderLink !== undefined) settings.preHeaderLink = preHeaderLink;
      if (whatsappEnquiryNumber !== undefined) settings.whatsappEnquiryNumber = whatsappEnquiryNumber;
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ 
      error: 'Failed to update site settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

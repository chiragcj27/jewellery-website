import { Request, Response } from 'express';
import { connectToDatabase, MetalRate, IMetalRate } from '@jewellery-website/db';
import { getErrorMessage } from '../utils/errors';
import { FilterQuery } from 'mongoose';

/**
 * Get all metal rates
 */
export const getAllMetalRates = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();
    const { active } = req.query;
    
    const filter: FilterQuery<IMetalRate> = {};
    if (active === 'true') {
      filter.isActive = true;
    }

    const metalRates = await MetalRate.find(filter).sort({ metalType: 1 });
    res.json({ success: true, data: metalRates });
  } catch (error: unknown) {
    console.error('Error fetching metal rates:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

/**
 * Get a single metal rate by ID
 */
export const getMetalRateById = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();
    const metalRate = await MetalRate.findById(req.params.id);

    if (!metalRate) {
      res.status(404).json({ success: false, error: 'Metal rate not found' });
      return;
    }

    res.json({ success: true, data: metalRate });
  } catch (error: unknown) {
    console.error('Error fetching metal rate:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

/**
 * Get metal rate by metal type
 */
export const getMetalRateByType = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();
    const { metalType } = req.params;
    
    const metalRate = await MetalRate.findOne({ 
      metalType: metalType,
      isActive: true 
    });

    if (!metalRate) {
      res.status(404).json({ 
        success: false, 
        error: `Metal rate for ${metalType} not found` 
      });
      return;
    }

    res.json({ success: true, data: metalRate });
  } catch (error: unknown) {
    console.error('Error fetching metal rate by type:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

/**
 * Create a new metal rate
 */
export const createMetalRate = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();
    const { metalType, purityPercentage, ratePerTenGrams, makingChargesPercentage, gstPercentage, isActive } = req.body;

    if (!metalType || ratePerTenGrams === undefined || makingChargesPercentage === undefined) {
      res.status(400).json({
        success: false,
        error: 'Metal type, rate per 10 grams, and making charges percentage are required',
      });
      return;
    }

    // Check if metal type already exists
    const existing = await MetalRate.findOne({ metalType });
    if (existing) {
      res.status(409).json({
        success: false,
        error: `Metal rate for ${metalType} already exists`,
      });
      return;
    }

    const metalRate = new MetalRate({
      metalType,
      ...(purityPercentage !== undefined && { purityPercentage }),
      ratePerTenGrams,
      makingChargesPercentage,
      gstPercentage: gstPercentage !== undefined ? gstPercentage : 3,
      isActive: isActive !== undefined ? isActive : true,
    });

    await metalRate.save();
    res.status(201).json({ success: true, data: metalRate });
  } catch (error: unknown) {
    console.error('Error creating metal rate:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

/**
 * Update a metal rate
 */
export const updateMetalRate = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();
    const { metalType, purityPercentage, ratePerTenGrams, makingChargesPercentage, gstPercentage, isActive } = req.body;

    const updateData: Record<string, unknown> = {};

    if (metalType !== undefined) updateData.metalType = metalType;
    if ('purityPercentage' in req.body) updateData.purityPercentage = purityPercentage ?? null;
    if (ratePerTenGrams !== undefined) updateData.ratePerTenGrams = ratePerTenGrams;
    if (makingChargesPercentage !== undefined) updateData.makingChargesPercentage = makingChargesPercentage;
    if (gstPercentage !== undefined) updateData.gstPercentage = gstPercentage;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Ensure makingChargesPercentage is always set when updating (required for schema)
    if (makingChargesPercentage === undefined) {
      res.status(400).json({
        success: false,
        error: 'Making charges percentage is required',
      });
      return;
    }

    // Remove legacy field when updating so document conforms to new schema
    const update: Record<string, unknown> = {
      $set: updateData,
      $unset: { makingChargePerGram: '' },
    };

    const metalRate = await MetalRate.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!metalRate) {
      res.status(404).json({ success: false, error: 'Metal rate not found' });
      return;
    }

    res.json({ success: true, data: metalRate });
  } catch (error: unknown) {
    console.error('Error updating metal rate:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

/**
 * Delete a metal rate
 */
export const deleteMetalRate = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectToDatabase();

    const metalRate = await MetalRate.findByIdAndDelete(req.params.id);

    if (!metalRate) {
      res.status(404).json({ success: false, error: 'Metal rate not found' });
      return;
    }

    res.json({ success: true, message: 'Metal rate deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting metal rate:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

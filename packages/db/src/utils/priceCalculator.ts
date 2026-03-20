/**
 * Price calculation utility for jewellery products
 *
 * Formula:
 * - Gold value = Weight × (Rate per 10g ÷ 10)
 * - Making charges = Gold value × Making charges %
 * - Subtotal = Gold value + Making charges
 * - Total = Subtotal + GST%
 */

export interface MetalRateData {
  metalType: string;
  ratePerTenGrams: number;
  makingChargesPercentage: number;
  gstPercentage: number;
}

export interface PriceCalculationInput {
  weightInGrams: number;
  metalRate: MetalRateData;
  customMakingChargesPercentage?: number;
}

export interface PriceBreakdown {
  goldCost: number; // Cost of gold based on weight
  makingCharges: number; // Making charges
  subtotal: number; // Gold cost + making charges
  gstAmount: number; // GST amount
  finalPrice: number; // Total price including GST
}

/**
 * Calculate the price of a jewellery product based on weight and metal rate
 */
export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
  const { weightInGrams, metalRate } = input;

  // Gold value = weight × (rate per 10g ÷ 10)
  const goldCost = (metalRate.ratePerTenGrams / 10) * weightInGrams;

  // Making charges = gold value × making charges % (fallback to global metal rate if product specific is not provided)
  const makingChargesPercent = input.customMakingChargesPercentage ?? metalRate.makingChargesPercentage;
  const makingCharges = goldCost * (makingChargesPercent / 100);

  // Subtotal = gold value + making charges
  const subtotal = goldCost + makingCharges;

  // Calculate GST
  const gstAmount = (subtotal * metalRate.gstPercentage) / 100;

  // Calculate final price
  const finalPrice = subtotal + gstAmount;

  return {
    goldCost: Math.round(goldCost * 100) / 100, // Round to 2 decimal places
    makingCharges: Math.round(makingCharges * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '₹'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Effective weight including wastage (for wholesaler pricing).
 * e.g. 10g with 8% wastage => 10.8g
 */
export function getEffectiveWeight(
  weightInGrams: number,
  wastagePercentage: number = 0
): number {
  return weightInGrams * (1 + wastagePercentage / 100);
}

/**
 * Validate if a product can use dynamic pricing
 */
export function canUseDynamicPricing(
  weightInGrams?: number,
  metalType?: string
): boolean {
  return (
    weightInGrams !== undefined &&
    weightInGrams > 0 &&
    metalType !== undefined &&
    metalType.trim() !== ''
  );
}

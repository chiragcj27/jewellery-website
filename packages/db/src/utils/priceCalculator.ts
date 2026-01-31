/**
 * Price calculation utility for jewellery products
 * 
 * Formula: (goldRate * weight) + (makingChargePerGram * weight) + GST
 * Where:
 * - goldRate is per 10 grams
 * - weight is in grams
 * - makingChargePerGram is per gram
 * - GST is a percentage
 */

export interface MetalRateData {
  metalType: string;
  ratePerTenGrams: number;
  makingChargePerGram: number;
  gstPercentage: number;
}

export interface PriceCalculationInput {
  weightInGrams: number;
  metalRate: MetalRateData;
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

  // Calculate gold cost (rate is per 10 grams)
  const goldCost = (metalRate.ratePerTenGrams / 10) * weightInGrams;

  // Calculate making charges
  const makingCharges = metalRate.makingChargePerGram * weightInGrams;

  // Calculate subtotal
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

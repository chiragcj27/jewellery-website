/**
 * Price calculation utility for jewellery products - Frontend version
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

export interface ProductData {
  weightInGrams?: number;
  metalType?: string;
  useDynamicPricing: boolean;
  price?: number;
  makingChargesPercentage?: number;
  hasStone?: boolean;
  stoneName?: string;
  stoneWeight?: number;
  stoneValue?: number;
}

export interface PriceBreakdown {
  goldCost: number;
  makingCharges: number;
  stoneCharges: number;
  stoneName?: string;
  subtotal: number;
  gstAmount: number;
  finalPrice: number;
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
 * Calculate the price of a jewellery product based on weight and metal rate
 */
export function calculatePrice(
  weightInGrams: number,
  metalRate: MetalRateData,
  customMakingChargesPercentage?: number,
  stoneProperties?: {
    hasStone?: boolean;
    stoneName?: string;
    stoneWeight?: number;
    stoneValue?: number;
  }
): PriceBreakdown {
  // Gold value = weight × (rate per 10g ÷ 10)
  const goldCost = (metalRate.ratePerTenGrams / 10) * weightInGrams;

  // Making charges = gold value × making charges % override if present, else fallback
  const makingChargesPercent = customMakingChargesPercentage ?? metalRate.makingChargesPercentage;
  const makingCharges = goldCost * (makingChargesPercent / 100);

  // Stone charges = stone value × stone weight (if stone is present)
  let stoneCharges = 0;
  if (stoneProperties?.hasStone && stoneProperties.stoneValue && stoneProperties.stoneWeight) {
    stoneCharges = stoneProperties.stoneValue * stoneProperties.stoneWeight;
  }

  // Subtotal = gold value + making charges + stone charges
  const subtotal = goldCost + makingCharges + stoneCharges;

  // Calculate GST
  const gstAmount = (subtotal * metalRate.gstPercentage) / 100;

  // Calculate final price
  const finalPrice = subtotal + gstAmount;

  return {
    goldCost: Math.round(goldCost * 100) / 100,
    makingCharges: Math.round(makingCharges * 100) / 100,
    stoneCharges: Math.round(stoneCharges * 100) / 100,
    stoneName: stoneProperties?.stoneName,
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number | null | undefined,
  currency: string = '₹'
): string {
  const n = price == null ? NaN : Number(price);
  if (!Number.isFinite(n)) {
    return `${currency}—`;
  }
  return `${currency}${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get display price for a product
 * Returns either the fixed price or calculated price based on metal rate
 */
export function getDisplayPrice(
  product: ProductData,
  metalRates: MetalRateData[]
): number | null {
  if (!product.useDynamicPricing) {
    return product.price || null;
  }

  if (!product.weightInGrams || !product.metalType) {
    return null;
  }

  const metalRate = metalRates.find(
    (rate) => rate.metalType === product.metalType
  );

  if (!metalRate) {
    return null;
  }

  const priceBreakdown = calculatePrice(
    product.weightInGrams, 
    metalRate, 
    product.makingChargesPercentage,
    {
      hasStone: product.hasStone,
      stoneName: product.stoneName,
      stoneWeight: product.stoneWeight,
      stoneValue: product.stoneValue,
    }
  );
  return priceBreakdown.subtotal;
}

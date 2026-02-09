/**
 * Price calculation utility for jewellery products - Frontend version
 * 
 * Formula: (goldRate * weight) + (makingChargePerGram * weight) + GST
 */

export interface MetalRateData {
  metalType: string;
  ratePerTenGrams: number;
  makingChargePerGram: number;
  gstPercentage: number;
}

export interface ProductData {
  weightInGrams?: number;
  metalType?: string;
  useDynamicPricing: boolean;
  price?: number;
}

export interface PriceBreakdown {
  goldCost: number;
  makingCharges: number;
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
  metalRate: MetalRateData
): PriceBreakdown {
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
    goldCost: Math.round(goldCost * 100) / 100,
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
  return `${currency}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const priceBreakdown = calculatePrice(product.weightInGrams, metalRate);
  return priceBreakdown.finalPrice;
}

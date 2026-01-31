# Dynamic Pricing System for Jewellery Website

## Overview

This document describes the implementation of a comprehensive dynamic pricing system for the jewellery website. The system allows products to have prices calculated automatically based on:
- **Weight** (in grams)
- **Metal Type** (22KT, 18KT, 20KT, etc.)
- **Gold Rate** per 10 grams (configurable)
- **Making Charges** per gram (configurable)
- **GST Percentage** (configurable)

## Pricing Formula

```
Final Price = (Gold Rate × Weight) + (Making Charges × Weight) + GST

Where:
- Gold Rate is per 10 grams (divided by 10 for per-gram calculation)
- Weight is in grams
- Making Charges is per gram
- GST is calculated as a percentage of the subtotal
```

### Example Calculation

For a 5g product with 22KT gold:
- Gold Rate: ₹75,000 per 10g
- Making Charges: ₹500 per gram
- GST: 3%

```
Gold Cost = (75,000 ÷ 10) × 5 = ₹37,500
Making Charges = 500 × 5 = ₹2,500
Subtotal = ₹40,000
GST = 40,000 × 0.03 = ₹1,200
Final Price = ₹41,200
```

## Implementation Components

### 1. Database Models

#### MetalRate Model (`packages/db/src/models/MetalRate.ts`)
Stores metal rates and pricing configuration:
```typescript
{
  metalType: string;          // e.g., "22KT", "18KT", "20KT"
  ratePerTenGrams: number;   // Gold rate per 10 grams
  makingChargePerGram: number; // Making charges per gram
  gstPercentage: number;      // GST percentage (default: 3)
  isActive: boolean;          // Active status
}
```

#### Updated Product Model (`packages/db/src/models/Product.ts`)
Added fields for weight-based pricing:
```typescript
{
  // ... existing fields
  price?: number;              // Optional for dynamic pricing products
  weightInGrams?: number;      // Weight in grams
  metalType?: string;          // Metal type reference
  useDynamicPricing: boolean;  // Enable dynamic pricing
}
```

### 2. Backend API

#### Metal Rates API (`/api/metal-rates`)
- `GET /api/metal-rates` - Get all metal rates
- `GET /api/metal-rates/:id` - Get metal rate by ID
- `GET /api/metal-rates/type/:metalType` - Get metal rate by type
- `POST /api/metal-rates` - Create new metal rate
- `PUT /api/metal-rates/:id` - Update metal rate
- `DELETE /api/metal-rates/:id` - Delete metal rate

#### Updated Products API
- Products controller now validates pricing based on `useDynamicPricing`
- If dynamic pricing: requires `weightInGrams` and `metalType`
- If fixed pricing: requires `price`

### 3. Price Calculation Utilities

#### Backend Utility (`packages/db/src/utils/priceCalculator.ts`)
```typescript
calculatePrice(input: PriceCalculationInput): PriceBreakdown
formatPrice(price: number, currency?: string): string
canUseDynamicPricing(weightInGrams?: number, metalType?: string): boolean
```

#### Frontend Utility (`apps/website/lib/priceCalculator.ts`)
```typescript
calculatePrice(weightInGrams: number, metalRate: MetalRateData): PriceBreakdown
formatPrice(price: number, currency?: string): string
getDisplayPrice(product: ProductData, metalRates: MetalRateData[]): number | null
```

### 4. Admin Portal Features

#### Metal Rates Management (`/metal-rates`)
- Create and manage metal rates for different types (22KT, 18KT, etc.)
- Set gold rate per 10 grams
- Configure making charges per gram
- Set GST percentage
- Activate/deactivate metal rates
- View pricing formula and calculation examples

#### Updated Product Creation (`/products`)
- **Pricing Type Toggle**: Choose between fixed pricing or weight-based dynamic pricing
- **Fixed Pricing Mode**: Enter price directly (traditional method)
- **Dynamic Pricing Mode**: 
  - Enter weight in grams
  - Select metal type from configured rates
  - Price calculated automatically based on current rates
- Product listing shows pricing type and weight/metal info

#### Updated Bulk Upload
The Excel template now includes:
- `weightInGrams` - Weight of product in grams
- `metalType` - Metal type (22KT, 18KT, etc.)
- `useDynamicPricing` - Set to true for weight-based pricing
- `price` - Required only if useDynamicPricing is false

### 5. Frontend Components

#### Product Card (`apps/website/components/product-card.tsx`)
Enhanced to display:
- Metal type and weight information
- Calculated prices based on current metal rates
- Supports both fixed and dynamic pricing display

#### API Client (`apps/website/lib/api.ts`)
Added methods for:
- Fetching metal rates
- Filtering products by metal type

## Usage Guide

### For Administrators

#### 1. Configure Metal Rates

1. Navigate to **Admin Portal** → **Metal Rates**
2. Click **"+ Add Metal Rate"**
3. Enter:
   - Metal Type (e.g., "22KT")
   - Rate per 10 Grams (e.g., 75000)
   - Making Charge per Gram (e.g., 500)
   - GST Percentage (default: 3)
4. Click **"Create"**

Repeat for all metal types you offer (22KT, 18KT, 20KT, 24KT, Silver, Platinum, etc.)

#### 2. Create Products with Dynamic Pricing

**Option A: Manual Creation**
1. Go to **Products** → **"+ Add Product"**
2. Fill in basic details (name, category, subcategory)
3. Check **"Use Weight-Based Dynamic Pricing"**
4. Enter:
   - Weight in Grams (e.g., 5.5)
   - Select Metal Type from dropdown
5. Price will be calculated automatically based on current rates
6. Click **"Create"**

**Option B: Bulk Upload**
1. Go to **Products** → **Bulk Upload**
2. Download the Excel template
3. Fill in the template:
   - Set `useDynamicPricing` = `true`
   - Enter `weightInGrams` (e.g., 5.5)
   - Enter `metalType` (e.g., "22KT")
   - Leave `price` empty or set to 0
4. Upload the Excel file
5. Products will be created with dynamic pricing enabled

#### 3. Update Metal Rates

When gold rates change:
1. Go to **Metal Rates**
2. Click **"Edit"** on the metal type you want to update
3. Update the **Rate per 10 Grams** or **Making Charges**
4. Click **"Update"**

**Note**: Changing rates will affect all products using that metal type. The new price will be calculated automatically when products are displayed.

### For Developers

#### Fetching Products with Calculated Prices

Frontend code example:
```typescript
import { api } from '@/lib/api';
import { getDisplayPrice, formatPrice } from '@/lib/priceCalculator';

// Fetch products and metal rates
const productsResult = await api.products.getAll();
const metalRatesResult = await api.metalRates.getAll(true); // Only active rates

const products = productsResult.data;
const metalRates = metalRatesResult.data;

// Calculate display price for each product
products.forEach(product => {
  const price = getDisplayPrice(product, metalRates);
  const formattedPrice = formatPrice(price || 0);
  console.log(`${product.name}: ${formattedPrice}`);
});
```

## Database Schema Changes

### New Collection: `metalrates`
```javascript
{
  _id: ObjectId,
  metalType: String (unique),
  ratePerTenGrams: Number,
  makingChargePerGram: Number,
  gstPercentage: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Collection: `products`
```javascript
{
  _id: ObjectId,
  // ... existing fields
  price: Number (optional),              // Made optional
  weightInGrams: Number (optional),      // NEW
  metalType: String (optional),          // NEW
  useDynamicPricing: Boolean,            // NEW
  // ... rest of fields
}
```

## Benefits

1. **Centralized Rate Management**: Update gold rates once, affects all relevant products
2. **Real-time Pricing**: Prices automatically reflect current metal rates
3. **Multiple Metal Types**: Support different karats and metals
4. **Transparency**: Clear breakdown of gold cost, making charges, and GST
5. **Flexibility**: Products can use either fixed or dynamic pricing
6. **Bulk Operations**: Upload hundreds of products with weight-based pricing via Excel
7. **Easy Updates**: Change rates without touching individual products

## Migration Notes

### For Existing Products

Existing products with fixed prices will continue to work without changes:
- `useDynamicPricing` defaults to `false`
- `price` field remains required for non-dynamic products
- No breaking changes to existing functionality

### Adding Dynamic Pricing to Existing Products

To convert a fixed-price product to dynamic pricing:
1. Edit the product
2. Enable **"Use Weight-Based Dynamic Pricing"**
3. Enter weight and metal type
4. Save

The product will now use calculated pricing instead of the fixed price.

## Technical Notes

### Price Calculation Performance
- Prices are calculated on-demand (not stored)
- Metal rates are cached for performance
- Calculation is lightweight (simple arithmetic)

### Data Consistency
- Metal type in products is a string reference (not a foreign key)
- If a metal rate is deleted, products using it won't calculate prices
- Recommend soft delete (isActive: false) instead of hard delete

### Future Enhancements

Potential additions:
1. **Historical Rate Tracking**: Store rate changes over time
2. **Discount Rules**: Apply percentage/amount discounts on calculated prices
3. **Multi-currency Support**: Calculate in different currencies
4. **Price Alerts**: Notify when rates change significantly
5. **Product Variants**: Same design in multiple metal types with automatic price adjustment

## Support

For questions or issues with the dynamic pricing system:
1. Check the pricing formula is configured correctly in Metal Rates
2. Verify product has both weight and metal type set
3. Ensure the metal rate for that type is active
4. Check console for calculation errors

## Files Modified/Created

### Backend
- ✅ `packages/db/src/models/MetalRate.ts` (new)
- ✅ `packages/db/src/models/Product.ts` (updated)
- ✅ `packages/db/src/utils/priceCalculator.ts` (new)
- ✅ `packages/db/src/index.ts` (updated)
- ✅ `apps/api/src/controllers/metalRates.controller.ts` (new)
- ✅ `apps/api/src/controllers/products.controller.ts` (updated)
- ✅ `apps/api/src/controllers/bulkUpload.controller.ts` (updated)
- ✅ `apps/api/src/routes/metalRates.ts` (new)
- ✅ `apps/api/src/index.ts` (updated)

### Admin Portal
- ✅ `apps/admin-portal/lib/api.ts` (updated)
- ✅ `apps/admin-portal/app/metal-rates/page.tsx` (new)
- ✅ `apps/admin-portal/app/page.tsx` (updated)
- ✅ `apps/admin-portal/app/products/page.tsx` (updated)

### Website
- ✅ `apps/website/lib/api.ts` (new)
- ✅ `apps/website/lib/priceCalculator.ts` (new)
- ✅ `apps/website/components/product-card.tsx` (updated)

## Conclusion

The dynamic pricing system provides a robust, flexible solution for managing jewellery product pricing based on real-time metal rates, weight, and configurable charges. The system maintains backward compatibility with existing fixed-price products while enabling powerful new pricing capabilities.

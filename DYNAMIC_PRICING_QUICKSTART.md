# Quick Start Guide: Dynamic Pricing System

This guide will help you quickly set up and test the new dynamic pricing system for your jewellery website.

## Prerequisites

- Admin portal running (default: http://localhost:3001)
- API server running (default: http://localhost:4000)
- MongoDB connected

## Step 1: Configure Metal Rates (5 minutes)

1. **Open Admin Portal**: Navigate to http://localhost:3001
2. **Go to Metal Rates**: Click on the "Metal Rates" card (💰 icon)
3. **Add First Metal Rate**:
   - Click "+ Add Metal Rate"
   - Metal Type: `22KT`
   - Rate per 10 Grams: `75000` (₹75,000)
   - Making Charge per Gram: `500` (₹500)
   - GST Percentage: `3` (3%)
   - Check "Active"
   - Click "Create"

4. **Add More Metal Types** (optional):
   ```
   18KT: ₹60,000/10g, ₹400/g making, 3% GST
   20KT: ₹67,500/10g, ₹450/g making, 3% GST
   24KT: ₹82,500/10g, ₹600/g making, 3% GST
   ```

## Step 2: Create a Test Product with Dynamic Pricing (2 minutes)

### Option A: Manual Creation

1. **Go to Products**: Click "Products" in the admin portal
2. **Add New Product**: Click "+ Add Product"
3. **Fill Basic Info**:
   - Name: `Test Gold Ring`
   - Category: Select any category
   - Subcategory: Select matching subcategory
   - Description: `Test product for dynamic pricing`

4. **Enable Dynamic Pricing**:
   - ✅ Check "Use Weight-Based Dynamic Pricing"
   - Weight in Grams: `5.5`
   - Metal Type: Select `22KT`

5. **Upload Image** (optional): Add product images
6. **Click "Create"**

### Option B: Bulk Upload

1. **Download Template**: Go to Products → Bulk Upload → Download Excel Template
2. **Edit Template**:
   ```
   name: Test Gold Ring
   category: Rings
   subcategory: Gold Rings
   weightInGrams: 5.5
   metalType: 22KT
   useDynamicPricing: true
   stock: 10
   isActive: true
   ```
3. **Upload**: Click "Upload and Create Products"

## Step 3: Verify Price Calculation (1 minute)

### Expected Calculation for 5.5g @ 22KT:

```
Gold Cost = (75,000 ÷ 10) × 5.5 = ₹41,250
Making Charges = 500 × 5.5 = ₹2,750
Subtotal = ₹44,000
GST = 44,000 × 0.03 = ₹1,320
Final Price = ₹45,320
```

### Verification:

1. In the Products list, you should see "Dynamic Pricing" with "5.5g • 22KT"
2. The product uses weight-based pricing (not fixed price)

## Step 4: Test Price Updates (2 minutes)

1. **Go to Metal Rates**
2. **Edit 22KT Rate**:
   - Click "Edit" on the 22KT rate
   - Change Rate per 10 Grams to `80000` (₹80,000)
   - Click "Update"

3. **New Calculation**:
   ```
   Gold Cost = (80,000 ÷ 10) × 5.5 = ₹44,000
   Making Charges = 500 × 5.5 = ₹2,750
   Subtotal = ₹46,750
   GST = 46,750 × 0.03 = ₹1,402.50
   Final Price = ₹48,152.50
   ```

4. **Note**: All 22KT products will now use the updated rate!

## Step 5: Create Fixed Price Product for Comparison (2 minutes)

1. **Add New Product**: Go to Products → "+ Add Product"
2. **Fill Basic Info**: Same as before
3. **Use Fixed Pricing**:
   - ❌ Leave "Use Weight-Based Dynamic Pricing" unchecked
   - Price: `45000` (₹45,000)
4. **Click "Create"**

**Observation**: This product will always show ₹45,000 regardless of metal rate changes.

## Step 6: Test Bulk Upload with Mixed Pricing (3 minutes)

Create an Excel file with both pricing types:

```
Row 1 (Dynamic):
name: Gold Necklace
category: Necklaces
subcategory: Gold Necklaces
weightInGrams: 25
metalType: 22KT
useDynamicPricing: true
stock: 5

Row 2 (Fixed):
name: Diamond Bracelet
category: Bracelets
subcategory: Diamond Bracelets
price: 125000
stock: 3
```

Upload and verify both products are created correctly.

## Common Scenarios

### Scenario 1: Same Design in Multiple Metal Types

Create the same product with different metal types:

```
Product A: Gold Ring 22KT (5.5g, 22KT) → ₹45,320
Product B: Gold Ring 18KT (5.5g, 18KT) → ₹35,750
```

Users can choose based on their budget and preference!

### Scenario 2: Daily Rate Updates

Every day:
1. Check current gold rates from market
2. Update Metal Rates in admin portal
3. All products automatically show updated prices
4. No need to edit individual products!

### Scenario 3: Custom Making Charges

Different products can have different making charges:
- Simple ring: Use default making charges from metal rate
- Complex design: Create with higher fixed price, or adjust metal rate making charges

## Troubleshooting

### Product Price Not Showing?
- Check metal rate exists for that metal type
- Verify metal rate is "Active"
- Ensure product has both weight and metal type set

### Bulk Upload Validation Error?
- Check metal type exactly matches configured rate (case-sensitive)
- Verify you have either price OR (weight + metalType + useDynamicPricing)
- Ensure weight is a positive number

### Want to Convert Fixed to Dynamic?
1. Edit the product
2. Check "Use Weight-Based Dynamic Pricing"
3. Enter weight and metal type
4. Save (old price will be ignored)

### Want to Convert Dynamic to Fixed?
1. Edit the product
2. Uncheck "Use Weight-Based Dynamic Pricing"
3. Enter fixed price
4. Save (weight and metal type will be ignored)

## Best Practices

1. **Configure All Metal Types First**: Set up all your metal rates before creating products
2. **Use Descriptive Names**: Name products clearly (e.g., "Gold Ring 22KT 5g")
3. **Regular Rate Updates**: Update rates when market prices change
4. **Test Before Bulk Upload**: Upload 1-2 test products first
5. **Backup Rates**: Keep a record of your metal rates configuration
6. **Document Changes**: Track when you update rates for transparency

## Next Steps

- Explore the Metal Rates page to see pricing formula examples
- Try creating products with different weights and metal types
- Test the bulk upload with your actual product catalog
- Configure additional metal types (Silver, Platinum) if needed
- Update your website frontend to display calculated prices

## API Endpoints for Integration

If you need to integrate with other systems:

```bash
# Get all metal rates
GET http://localhost:4000/api/metal-rates

# Get specific metal rate
GET http://localhost:4000/api/metal-rates/type/22KT

# Get products (includes pricing info)
GET http://localhost:4000/api/products

# Calculate price (use frontend utility)
import { calculatePrice } from '@/lib/priceCalculator';
const price = calculatePrice(5.5, metalRate);
```

## Success!

You now have a fully functional dynamic pricing system! Products using weight-based pricing will automatically update their prices when you change the metal rates, making it easy to keep your pricing current with market conditions.

For detailed information, see `DYNAMIC_PRICING_IMPLEMENTATION.md`.

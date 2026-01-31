# Dynamic Pricing System - README

## Overview

A complete weight-based dynamic pricing system has been implemented for the jewellery website. Products can now have their prices calculated automatically based on:
- Weight in grams
- Metal type (22KT, 18KT, 20KT, etc.)
- Current gold rates
- Making charges
- GST

## Quick Links

- 📖 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Overview of all changes
- 🚀 [Quick Start Guide](./DYNAMIC_PRICING_QUICKSTART.md) - Get started in 10 minutes
- 📚 [Technical Documentation](./DYNAMIC_PRICING_IMPLEMENTATION.md) - Detailed implementation guide
- 📦 [Bulk Upload Guide](./BULK_UPLOAD_GUIDE.md) - Excel upload instructions

## Key Features

### For Administrators
- **Metal Rates Management**: Centralized configuration for all metal types
- **Flexible Pricing**: Choose fixed or weight-based pricing per product
- **Bulk Operations**: Upload products with dynamic pricing via Excel
- **Instant Updates**: Change rates once, affects all relevant products

### For Developers
- **API Endpoints**: RESTful APIs for metal rates and products
- **Price Calculator**: Reusable utility functions for price calculation
- **Type Safety**: Full TypeScript support
- **Documentation**: Comprehensive code comments

### For Customers
- **Transparent Pricing**: See metal type and weight information
- **Accurate Prices**: Always reflects current market rates
- **Multiple Options**: Same design available in different metal types

## Pricing Formula

```
Final Price = (Gold Rate × Weight) + (Making Charges × Weight) + GST
```

Example: 5.5g @ 22KT (₹75,000/10g, ₹500/g making, 3% GST)
```
Gold: ₹41,250 + Making: ₹2,750 = ₹44,000
GST: ₹1,320
Total: ₹45,320
```

## File Structure

```
jewellery-website/
├── packages/db/
│   ├── src/models/
│   │   ├── MetalRate.ts          # NEW - Metal rates model
│   │   └── Product.ts             # UPDATED - Added weight fields
│   ├── src/utils/
│   │   └── priceCalculator.ts    # NEW - Price calculation logic
│   └── src/index.ts               # UPDATED - Export new models
│
├── apps/api/
│   ├── src/controllers/
│   │   ├── metalRates.controller.ts   # NEW - Metal rates CRUD
│   │   ├── products.controller.ts     # UPDATED - Dynamic pricing support
│   │   └── bulkUpload.controller.ts   # UPDATED - Weight-based upload
│   ├── src/routes/
│   │   └── metalRates.ts          # NEW - Metal rates routes
│   └── src/index.ts               # UPDATED - Register routes
│
├── apps/admin-portal/
│   ├── app/metal-rates/
│   │   └── page.tsx               # NEW - Metal rates management UI
│   ├── app/products/
│   │   └── page.tsx               # UPDATED - Dynamic pricing form
│   ├── app/page.tsx               # UPDATED - Added metal rates card
│   └── lib/api.ts                 # UPDATED - Metal rates API client
│
├── apps/website/
│   ├── lib/
│   │   ├── api.ts                 # NEW - Website API client
│   │   └── priceCalculator.ts    # NEW - Frontend price calculator
│   └── components/
│       └── product-card.tsx       # UPDATED - Show metal type/weight
│
└── Documentation/
    ├── IMPLEMENTATION_SUMMARY.md      # NEW - Overview
    ├── DYNAMIC_PRICING_QUICKSTART.md  # NEW - Quick start
    ├── DYNAMIC_PRICING_IMPLEMENTATION.md  # NEW - Technical docs
    └── BULK_UPLOAD_GUIDE.md           # UPDATED - Dynamic pricing
```

## API Endpoints

### Metal Rates
```bash
# Get all metal rates
GET /api/metal-rates

# Get metal rate by ID
GET /api/metal-rates/:id

# Get metal rate by type
GET /api/metal-rates/type/22KT

# Create metal rate
POST /api/metal-rates
Body: { metalType, ratePerTenGrams, makingChargePerGram, gstPercentage }

# Update metal rate
PUT /api/metal-rates/:id
Body: { ratePerTenGrams, makingChargePerGram, gstPercentage }

# Delete metal rate
DELETE /api/metal-rates/:id
```

### Products (Enhanced)
```bash
# Create product with dynamic pricing
POST /api/products
Body: {
  name, category, subcategory,
  weightInGrams: 5.5,
  metalType: "22KT",
  useDynamicPricing: true
}

# Create product with fixed pricing
POST /api/products
Body: {
  name, category, subcategory,
  price: 45000,
  useDynamicPricing: false
}
```

## Quick Start

### 1. Configure Metal Rates (Admin Portal)
```
Navigate to: http://localhost:3001/metal-rates
Add: 22KT @ ₹75,000/10g, ₹500/g making, 3% GST
```

### 2. Create Test Product
```
Products → Add Product
✅ Enable "Use Weight-Based Dynamic Pricing"
Weight: 5.5g
Metal Type: 22KT
```

### 3. Verify Calculation
```
Expected Price: ₹45,320
(See pricing formula above)
```

## Usage Examples

### JavaScript: Calculate Price
```javascript
import { calculatePrice, formatPrice } from '@jewellery-website/db';

const metalRate = {
  metalType: '22KT',
  ratePerTenGrams: 75000,
  makingChargePerGram: 500,
  gstPercentage: 3
};

const breakdown = calculatePrice({
  weightInGrams: 5.5,
  metalRate
});

console.log(formatPrice(breakdown.finalPrice)); // "₹45,320.00"
```

### Excel: Bulk Upload with Dynamic Pricing
```excel
name             | category | subcategory  | weightInGrams | metalType | useDynamicPricing
Gold Ring        | Rings    | Gold Rings   | 5.5          | 22KT      | true
Gold Necklace    | Necklaces| Gold Necklaces| 25          | 22KT      | true
Diamond Bracelet | Bracelets| Diamond      | 15           | 18KT      | true
```

## Database Schema

### metalrates Collection
```javascript
{
  _id: ObjectId,
  metalType: "22KT",
  ratePerTenGrams: 75000,
  makingChargePerGram: 500,
  gstPercentage: 3,
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### products Collection (Updated)
```javascript
{
  _id: ObjectId,
  name: "Gold Ring",
  category: ObjectId,
  subcategory: ObjectId,
  // NEW FIELDS:
  price: Number (optional),        // Only for fixed pricing
  weightInGrams: 5.5,             // For dynamic pricing
  metalType: "22KT",              // For dynamic pricing
  useDynamicPricing: true,        // Enable/disable
  // ... other existing fields
}
```

## Configuration

### Environment Variables
```bash
# No additional env variables required
# Uses existing MONGODB_URI and API_URL
```

### Admin Portal
- Default URL: http://localhost:3001
- New Route: `/metal-rates`

### API Server
- Default URL: http://localhost:4000
- New Route: `/api/metal-rates`

## Testing

### Manual Testing Checklist
- [ ] Create metal rate (22KT)
- [ ] Create product with dynamic pricing
- [ ] Verify calculated price is correct
- [ ] Update metal rate
- [ ] Verify product price updates
- [ ] Create product with fixed pricing
- [ ] Test bulk upload with both pricing types
- [ ] Edit product from fixed to dynamic
- [ ] Edit product from dynamic to fixed

### Automated Testing
```bash
# Unit tests for price calculator
npm test packages/db/src/utils/priceCalculator.test.ts

# API integration tests
npm test apps/api/src/controllers/metalRates.test.ts
```

## Troubleshooting

### Issue: "Metal rate not found"
**Solution**: Create metal rate for that type in admin portal

### Issue: "Price is undefined"
**Solution**: Ensure metal rate is active and product has weight + metal type

### Issue: "Validation error on bulk upload"
**Solution**: Check metal type exactly matches configured rate (case-sensitive)

### Issue: "Cannot convert to dynamic pricing"
**Solution**: Ensure metal rate exists before enabling dynamic pricing

## Best Practices

1. **Configure All Metal Types First**: Set up rates before creating products
2. **Use Consistent Names**: Metal type must match exactly (22KT, not 22kt)
3. **Regular Updates**: Update rates when market prices change
4. **Test Before Bulk Upload**: Upload 1-2 test products first
5. **Document Rate Changes**: Keep history of rate updates
6. **Backup Before Migration**: Backup database before converting products

## Support

### Documentation Files
- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `DYNAMIC_PRICING_QUICKSTART.md` - Setup guide
- `DYNAMIC_PRICING_IMPLEMENTATION.md` - Technical details
- `BULK_UPLOAD_GUIDE.md` - Excel upload help

### Code Comments
All new code includes detailed comments explaining:
- What the code does
- Why it's structured that way
- How to use the functions
- Example usage

## Future Enhancements

Potential additions:
- [ ] Historical rate tracking
- [ ] Discount rules on calculated prices
- [ ] Multi-currency support
- [ ] Price alerts for rate changes
- [ ] Product variants (same design, multiple metal types)
- [ ] Customer-facing rate transparency
- [ ] Profit margin calculator

## Version History

### v1.0.0 (Current)
- ✅ Metal rates management
- ✅ Dynamic pricing for products
- ✅ Bulk upload support
- ✅ Admin portal UI
- ✅ Frontend price display
- ✅ Complete documentation

## Contributors

This system was implemented as a comprehensive solution for weight-based dynamic pricing in the jewellery industry, following industry-standard formulas and best practices.

## License

Same as the main project.

---

**Ready to get started?** Follow the [Quick Start Guide](./DYNAMIC_PRICING_QUICKSTART.md)!

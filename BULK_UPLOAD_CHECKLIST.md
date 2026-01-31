# Bulk Product Upload Checklist

## 📋 Complete Checklist for Bulk Product Upload

### Before You Start

- [ ] **Backup your data** - Save a copy of your Excel file before uploading
- [ ] **Configure metal rates** (if using dynamic pricing) - Go to Metal Rates page and add all metal types you'll use
- [ ] **Check categories exist** - Verify all categories and subcategories are created in the system
- [ ] **Test with 1-2 products first** - Upload a small test file to verify everything works

### Preparing Your Excel File

#### Required Columns
- [ ] `name` - Product name filled for every row
- [ ] `category` - Category name or slug (must exist in system)
- [ ] `subcategory` - Subcategory name or slug (must exist in system)

#### Pricing Configuration (Choose ONE method)

**Option A: Fixed Pricing**
- [ ] `price` - Set to a number (e.g., 45000)
- [ ] `useDynamicPricing` - Leave empty or set to false

**Option B: Dynamic Pricing**
- [ ] `weightInGrams` - Set to a positive number (e.g., 5.5)
- [ ] `metalType` - Set to exact metal type from Metal Rates (e.g., "22KT")
- [ ] `useDynamicPricing` - Set to true
- [ ] `price` - Leave empty or remove

#### Data Validation

- [ ] **Category/Subcategory match** - Verify subcategory belongs to the specified category
- [ ] **Spelling correct** - Category and subcategory names must be spelled correctly (NOT case-sensitive: "Rings" = "rings" = "RINGS")
- [ ] **Metal type exact match** - Metal type IS case-sensitive and must match exactly (e.g., "22KT" ≠ "22kt" ≠ "22 KT")
- [ ] **Decimal format** - Use dot (.) for decimals: 5.5 not 5,5
- [ ] **Boolean values** - Use true/false, yes/no, or 1/0 (not True/False or YES/NO)
- [ ] **Weight is positive** - If using dynamic pricing, weight must be > 0
- [ ] **No mixed pricing** - Don't use both price AND dynamic pricing fields for same product
- [ ] **Unique product names** - Each product name should be unique within same category/subcategory

#### Optional Fields
- [ ] `description` - Detailed product description
- [ ] `shortDescription` - Brief product description
- [ ] `compareAtPrice` - Original price for showing discounts
- [ ] `sku` - Stock keeping unit (unique identifier)
- [ ] `stock` - Quantity available (default: 0)
- [ ] `isActive` - true/false (default: true)
- [ ] `isFeatured` - true/false (default: false)
- [ ] `displayOrder` - Sort order (default: 0)
- [ ] `filterValues` - JSON object: `{"material":"Gold","color":"Yellow"}`

### Images Handling (Choose ONE method)

**Option 1: Pre-uploaded URLs**
- [ ] Upload images to Assets page first
- [ ] Copy image URLs
- [ ] Paste comma-separated URLs in `images` column

**Option 2: ZIP File with Images**
- [ ] Create Excel file with product data
- [ ] Set `images` column to filenames only (e.g., "ring1.jpg,ring2.jpg")
- [ ] Add all image files to root of ZIP (not in subfolders)
- [ ] Add Excel file to root of ZIP
- [ ] Create ZIP file
- [ ] Upload ZIP instead of Excel

**Option 3: Add Later**
- [ ] Leave `images` column empty
- [ ] Upload Excel file
- [ ] Add images manually later by editing products

### Image Requirements
- [ ] **Supported formats** - JPG, JPEG, PNG, GIF, WEBP only
- [ ] **File naming** - No spaces or special characters in filenames
- [ ] **File location** - Images in ZIP root, not in subfolders
- [ ] **File size** - Individual images should be reasonable size (< 5MB each)

### File Requirements
- [ ] **Excel format** - .xlsx, .xls, or .csv
- [ ] **File size** - Excel under 10MB, ZIP under 50MB
- [ ] **Encoding** - UTF-8 encoding for special characters
- [ ] **No empty rows** - Remove any empty rows between data
- [ ] **Header row** - First row should have column names

### Dynamic Pricing Specific Checks
- [ ] **Metal rates configured** - All metal types used are configured in Metal Rates page
- [ ] **Metal rates active** - Metal rates are marked as "Active"
- [ ] **Metal type case-sensitive** - Exact match: "22KT" not "22kt" or "22 KT"
- [ ] **Weight unit** - Weight in grams (not milligrams or other units)
- [ ] **Calculation preview** - Verify expected price matches formula: (Rate÷10 × Weight) + (Making × Weight) + GST

### Before Upload
- [ ] **Review Reference sheet** - Check template's Reference sheet for exact category/subcategory names
- [ ] **Remove example row** - Delete or replace the example product row
- [ ] **Save file** - Save Excel file after all changes
- [ ] **Close Excel** - Close Excel program before uploading (file lock issues)

### During Upload
- [ ] **Select correct file** - Choose your prepared Excel or ZIP file
- [ ] **Wait for validation** - Don't close browser during upload
- [ ] **Check file size** - File uploading indicator should show

### After Upload - Success
- [ ] **Review success message** - Check how many products were created
- [ ] **Click "View Products"** - Go to products page
- [ ] **Verify products** - Check a few products to ensure data is correct
- [ ] **Check images** - Verify images uploaded correctly
- [ ] **Test dynamic pricing** - If used, verify prices calculate correctly

### After Upload - Errors
- [ ] **Read error messages** - Review the errors table carefully
- [ ] **Note row numbers** - Errors show which Excel row has the issue
- [ ] **Fix errors** - Correct issues in your Excel file
- [ ] **Re-upload** - Upload the corrected file
- [ ] **No products created** - Remember: if ANY row fails validation, NO products are created

## ⚠️ Critical Things to Remember

### 1. All-or-Nothing Validation
- If even ONE row has an error, ZERO products will be created
- Fix all errors before any products are imported
- This prevents partial imports with inconsistent data

### 2. Category/Subcategory Relationship
- Every subcategory belongs to exactly one category
- Example: "Gold Rings" subcategory belongs to "Rings" category
- Pairing wrong subcategory with category will fail validation

### 3. Dynamic Pricing Requirements
```
Must have ALL three:
✓ weightInGrams (e.g., 5.5)
✓ metalType (e.g., "22KT")
✓ useDynamicPricing = true

Metal rate MUST exist and be active
```

### 4. Fixed Pricing Requirements
```
Must have:
✓ price (e.g., 45000)
✓ useDynamicPricing = false (or empty)
```

### 5. Cannot Mix Both Pricing Types
```
❌ WRONG:
price = 45000
weightInGrams = 5.5
metalType = 22KT
useDynamicPricing = true

✓ CORRECT (choose one):
Option A: price = 45000, useDynamicPricing = false
Option B: weightInGrams = 5.5, metalType = 22KT, useDynamicPricing = true
```

## 🎯 Best Practices

### 1. Start Small
- Test with 2-3 products first
- Verify the upload works correctly
- Then proceed with full catalog

### 2. Use Reference Sheet
- Template includes a Reference sheet
- Lists all available categories and subcategories
- Copy exact names from there

### 3. Consistent Naming
- Category/Subcategory: NOT case-sensitive ("Rings" = "rings" = "RINGS")
- Metal Type: IS case-sensitive ("22KT" ≠ "22kt")
- Use exact metal type names: "22KT", "18KT", "20KT"
- Don't vary the format: "22 KT", "22k" will fail

### 4. Organize Your Data
- Keep a master Excel file with all products
- Create smaller batches for upload (50-100 products at a time)
- Easier to fix errors in smaller files

### 5. Image Management
- Upload all images to Assets first
- Copy URLs to Excel
- Or use ZIP method for bulk image upload

### 6. Test Calculations
For dynamic pricing, manually calculate one product:
```
Example: 5.5g @ 22KT
Gold Rate: ₹75,000/10g → ₹7,500/g
Gold Cost: ₹7,500 × 5.5 = ₹41,250
Making: ₹500 × 5.5 = ₹2,750
Subtotal: ₹44,000
GST (3%): ₹1,320
Total: ₹45,320
```

### 7. Keep Backups
- Save original Excel file before upload
- After successful upload, archive the file
- Helps if you need to update products later

## 🐛 Troubleshooting Common Errors

### Error: "Category not found"
**Cause:** Category name spelling doesn't match (note: case doesn't matter)  
**Fix:** Check Reference sheet, copy exact spelling. "Rings", "rings", "RINGS" all work, but "Rigns" won't.

### Error: "Subcategory does not belong to category"
**Cause:** Wrong category-subcategory pairing  
**Fix:** Check Reference sheet for correct pairing

### Error: "Valid price (>= 0) is required"
**Cause:** Price missing for fixed pricing product  
**Fix:** Add price value OR enable dynamic pricing

### Error: "Weight and metal type required"
**Cause:** Dynamic pricing enabled but weight or metal type missing  
**Fix:** Add weightInGrams and metalType values

### Error: "Metal rate for X not found"
**Cause:** Metal type doesn't exist, is inactive, or case doesn't match  
**Fix:** Go to Metal Rates, add the metal type or activate it. Make sure case matches exactly (e.g., "22KT" not "22kt")

### Error: "Product with this name already exists"
**Cause:** Duplicate product name in same category/subcategory  
**Fix:** Make product names unique or use different subcategory

### Error: "Upload failed"
**Cause:** File corrupted or wrong format  
**Fix:** Re-save Excel file, try .xlsx format

### Error: "Image not found in ZIP"
**Cause:** Image filename doesn't match ZIP contents  
**Fix:** Verify image files are in ZIP root, check spelling

## 📊 Example Validation Checklist

Before clicking "Upload", verify:

```
✓ Excel file has data
✓ No empty rows
✓ Category names match Reference sheet
✓ Subcategory names match Reference sheet
✓ Each product has either price OR (weight + metal type + useDynamicPricing)
✓ Metal types match Metal Rates page (if using dynamic pricing)
✓ Decimal numbers use dot (.)
✓ Boolean values are true/false
✓ Image URLs are valid or images are in ZIP
✓ File size under limits
✓ Backup saved
```

## 🎓 Learning Resources

- **BULK_UPLOAD_GUIDE.md** - Detailed documentation
- **DYNAMIC_PRICING_QUICKSTART.md** - Dynamic pricing setup
- **Metal Rates page** - Configure rates before dynamic pricing
- **Template Instructions sheet** - Built-in help in template

## 📞 Need Help?

If you encounter issues:
1. Review error messages carefully - they explain what's wrong
2. Check this checklist for the specific error
3. Verify your data against the template
4. Test with a smaller file (1-2 products)
5. Review the documentation files

---

**Pro Tip:** Keep this checklist handy for every bulk upload to ensure smooth imports! 🚀

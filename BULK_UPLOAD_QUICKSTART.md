# Bulk Product Upload - Quick Start

## What Was Built

A complete bulk product upload system that allows admins to upload multiple products at once using Excel files, with sophisticated support for handling product images.

## Key Features

✅ **Excel-based upload** - Use familiar Excel/spreadsheet format
✅ **ZIP file support** - Include images directly in upload
✅ **Template download** - Get pre-configured Excel template with examples
✅ **Smart validation** - All data validated before creating any products
✅ **Detailed error reporting** - Know exactly what to fix
✅ **Multiple image options** - URLs, ZIP files, or leave blank
✅ **S3 integration** - Automatic image upload to cloud storage
✅ **Category/subcategory reference** - Template includes list of valid options

## How to Use

### Quick Steps:

1. **Go to Products → Bulk Upload** in admin portal
2. **Download Template** - Click green button
3. **Fill in Excel** - Add your product data
4. **Handle Images** - Choose one option:
   - Upload images to Assets page first, copy URLs
   - Put image files in ZIP with Excel
   - Leave blank, add later
5. **Upload** - Upload Excel or ZIP file
6. **Review Results** - Fix any errors or celebrate success!

## File Locations

### Backend (API):
- `apps/api/src/controllers/bulkUpload.controller.ts` - Main logic
- `apps/api/src/routes/bulkUpload.ts` - API routes
- `apps/api/src/index.ts` - Route registration

### Frontend (Admin Portal):
- `apps/admin-portal/app/products/bulk-upload/page.tsx` - Upload UI
- `apps/admin-portal/app/products/page.tsx` - Added bulk upload button
- `apps/admin-portal/lib/api.ts` - API client methods

### Documentation:
- `BULK_UPLOAD_GUIDE.md` - Complete user guide
- `BULK_UPLOAD_EXAMPLES.md` - Example data and patterns
- `BULK_UPLOAD_IMPLEMENTATION.md` - Technical documentation

## API Endpoints

### POST /api/bulk-upload/products
Upload Excel or ZIP file to create products.

### GET /api/bulk-upload/template
Download Excel template with current categories.

## Excel Template Structure

The template includes 3 sheets:

1. **Products** - Fill with your data
   - Required: name, category, subcategory, price
   - Optional: description, images, stock, SKU, etc.

2. **Reference** - List of categories and subcategories
   - Shows valid names to use
   - Both name and slug work

3. **Instructions** - Quick guide
   - How to format data
   - Image handling options

## Image Handling (3 Options)

### Option 1: Pre-upload URLs
```
Upload images to Assets page → Copy URLs → Paste in Excel
```

### Option 2: ZIP File (Recommended)
```
Create folder with Excel + images → Zip it → Upload
```

### Option 3: Add Later
```
Upload Excel without images → Edit products individually later
```

## Example Data

**Minimum (required fields only):**
```
name: Gold Ring
category: Rings
subcategory: Gold Rings
price: 999.99
```

**Complete:**
```
name: Gold Ring
category: Rings
subcategory: Gold Rings
description: Beautiful handcrafted ring
shortDescription: 24k gold ring
price: 999.99
compareAtPrice: 1499.99
sku: RING-001
stock: 10
isActive: true
isFeatured: true
displayOrder: 1
images: ring1.jpg,ring2.jpg
filterValues: {"material":"Gold","purity":"24k"}
```

## Validation

System checks:
- ✓ Required fields present
- ✓ Category exists
- ✓ Subcategory exists and matches category
- ✓ Price is valid number
- ✓ Stock is valid (if provided)

**Important:** If ANY row has errors, NO products are created. Fix errors and re-upload.

## Testing It Out

1. Go to admin portal: http://localhost:3001/products/bulk-upload
2. Download the template
3. Open in Excel or Google Sheets
4. Try the example data (already filled in)
5. Or add your own products
6. Upload and see results!

## Common Questions

**Q: Can I update existing products?**
A: Not yet - this is for creating new products only.

**Q: What image formats are supported?**
A: JPG, PNG, GIF, WebP

**Q: How many products can I upload at once?**
A: Hundreds work fine. File size limit is 50MB for ZIP.

**Q: Do I need S3 configured?**
A: Only if using ZIP files with images. URLs work without S3.

**Q: What if I make a mistake?**
A: No worries! If validation fails, nothing is created. Fix and try again.

**Q: Can I mix URLs and filenames for images?**
A: Yes! System detects URLs vs filenames automatically.

## Next Steps

1. **Try it out** with the example data
2. **Create your first real batch** with 5-10 products
3. **Scale up** to larger uploads
4. **Share the guide** with other admins

## Need Help?

- Read `BULK_UPLOAD_GUIDE.md` for detailed instructions
- Check `BULK_UPLOAD_EXAMPLES.md` for more examples
- See `BULK_UPLOAD_IMPLEMENTATION.md` for technical details

# Bulk Product Upload Guide

## Overview

The bulk upload feature allows administrators to upload multiple products at once using an Excel file. This is much faster than manually creating products one by one.

## Features

- **Template-based**: Download a pre-configured Excel template with example data
- **Validation**: All rows are validated before any products are created
- **Error reporting**: Detailed error messages showing exactly which rows have issues
- **Image support**: Multiple ways to handle product images
- **Reference sheet**: Template includes a list of available categories and subcategories

## How to Use

### Step 1: Download the Template

1. Navigate to **Products** → **Bulk Upload** in the admin portal
2. Click the **"Download Excel Template"** button
3. Open the downloaded file in Excel or Google Sheets

The template includes:
- **Products sheet**: Example data showing how to fill in product information
- **Reference sheet**: List of all available categories and subcategories

### Step 2: Prepare Your Data

Fill in the Products sheet with your product data. Here's what each column means:

#### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `name` | Text | Product name | "Gold Diamond Ring" |
| `category` | Text | Category name or slug (must exist) | "Rings" or "rings" |
| `subcategory` | Text | Subcategory name or slug (must exist) | "Gold Rings" or "gold-rings" |
| `price` | Number | Product price | 999.99 |

#### Optional Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `description` | Text | Detailed product description | "Beautiful handcrafted gold ring..." |
| `shortDescription` | Text | Brief description | "24k gold ring with diamonds" |
| `compareAtPrice` | Number | Original price (for showing discounts) | 1499.99 |
| `sku` | Text | Stock keeping unit | "RING-001" |
| `stock` | Number | Available quantity | 10 |
| `isActive` | Boolean | Product is visible on website | true / false / yes / no |
| `isFeatured` | Boolean | Featured product | true / false / yes / no |
| `displayOrder` | Number | Sort order (lower appears first) | 0 |
| `images` | Text | Comma-separated image URLs | "https://example.com/img1.jpg,https://example.com/img2.jpg" |
| `filterValues` | JSON | Category-specific filters | `{"material":"Gold","color":"Yellow"}` |

### Step 3: Handle Images

There are three ways to handle product images:

#### Option 1: Pre-upload to S3 (Recommended for many images)

1. Go to the **Assets** page in admin portal
2. Upload all your product images
3. Copy the image URLs
4. Paste the URLs in the `images` column, separated by commas

Example:
```
https://your-bucket.s3.amazonaws.com/products/img1.jpg,https://your-bucket.s3.amazonaws.com/products/img2.jpg
```

#### Option 2: Upload Images in ZIP File (Easiest for bulk upload)

1. Place your Excel file and all product images in a folder
2. In the Excel `images` column, reference images by filename only (not full path)
3. Create a ZIP file containing:
   - Your Excel file (e.g., `products.xlsx`)
   - All image files (e.g., `ring1.jpg`, `ring2.jpg`, `necklace1.png`)
4. Upload the ZIP file instead of just the Excel file

Example Excel `images` column values:
```
ring1.jpg,ring2.jpg
necklace1.png
bracelet1.jpg,bracelet2.jpg,bracelet3.jpg
```

ZIP file structure:
```
products.zip
├── products.xlsx
├── ring1.jpg
├── ring2.jpg
├── necklace1.png
├── bracelet1.jpg
├── bracelet2.jpg
└── bracelet3.jpg
```

The system will automatically:
- Extract the ZIP file
- Find the Excel file
- Upload all images to S3
- Associate images with the correct products

#### Option 3: Use Public URLs

If your images are already hosted elsewhere (e.g., existing website, CDN):
```
https://example.com/products/ring1.jpg,https://example.com/products/ring2.jpg
```

#### Option 4: Leave Empty

You can upload the Excel file without images and add them later by editing each product individually.

### Step 4: Validation Rules

The system validates all data before creating products. Make sure:

- **Category exists**: Use exact category name or slug from the Reference sheet
- **Subcategory exists**: Use exact subcategory name or slug from the Reference sheet
- **Subcategory belongs to category**: The subcategory must be under the specified category
- **Price is valid**: Must be a number >= 0
- **Stock is valid**: If provided, must be a number >= 0
- **Unique names**: Product names should be unique within the same category/subcategory combination

### Step 5: Upload the File

1. Click **"Select Excel File"** and choose your completed file
2. Click **"Upload and Create Products"**
3. Wait for validation and processing

The system will:
- Validate all rows first
- If any errors are found, NO products will be created
- Fix the errors in your Excel file and try again
- If all rows are valid, all products will be created

### Step 6: Review Results

After upload, you'll see:
- **Total rows processed**
- **Number of successful creations**
- **Number of errors**
- **Detailed error table** (if any errors occurred)

If there are errors:
1. Review the error table
2. Fix the issues in your Excel file
3. Upload again

If successful:
1. Click **"View Products"** to see your newly created products
2. You can now manage them individually or do another bulk upload

## Filter Values

If your category has custom filters (e.g., Material, Color, Size), you can set them using JSON in the `filterValues` column.

### Example for Select Filters

```json
{"material":"Gold","color":"Yellow"}
```

### Example for Multi-select Filters

```json
{"material":"Gold","occasions":["Wedding","Engagement","Party"]}
```

Check your category's filters in the Categories page to see what options are available.

## Tips & Best Practices

1. **Start small**: Test with 2-3 products first to make sure everything works
2. **Use the Reference sheet**: Always check category and subcategory names
3. **Consistent naming**: Use exact same names/slugs as shown in the Reference sheet
4. **Prepare images first**: Upload all images to S3 before creating the Excel file
5. **Use SKUs**: Even if optional, SKUs help you track and manage products
6. **Set display order**: Control the order products appear on your website
7. **Double-check prices**: Make sure decimal points are correct (e.g., 99.99 not 9999)
8. **Save backups**: Keep a copy of your Excel file before uploading

## Troubleshooting

### "Category not found"
- Make sure you're using the exact category name or slug from the Reference sheet
- Category names are case-insensitive, but spelling must be exact

### "Subcategory does not belong to category"
- Check the Reference sheet to see which category the subcategory belongs to
- Make sure you're pairing them correctly

### "Valid price (>= 0) is required"
- Make sure the price column contains a number
- Don't include currency symbols ($)
- Use decimal point (.) not comma (,) for decimals

### "Upload failed"
- Check file format (must be .xlsx, .xls, or .csv)
- Make sure file is not corrupted
- File size must be under 10MB
- Make sure you have an active internet connection

### Images not appearing
- Verify the image URLs are publicly accessible
- Make sure URLs start with https://
- Check for extra spaces in the URLs

## Example Excel Data

Here's a complete example row:

| name | category | subcategory | price | compareAtPrice | sku | stock | isActive | isFeatured | images | description |
|------|----------|-------------|-------|----------------|-----|-------|----------|------------|--------|-------------|
| Classic Gold Ring | Rings | Gold Rings | 999.99 | 1499.99 | RING-GLD-001 | 25 | true | true | https://cdn.example.com/ring1.jpg | Beautiful 24k gold ring with intricate designs |

## Support

If you encounter issues not covered in this guide:
1. Check the error messages carefully - they usually explain what's wrong
2. Verify your data against the template
3. Try uploading a smaller subset of products to isolate the issue

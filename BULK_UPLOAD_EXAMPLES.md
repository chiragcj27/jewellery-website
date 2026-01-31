# Example Product Upload Data

This document shows example data for bulk product upload. Use this as a reference when filling in your Excel file.

## Basic Example (Minimum Required Fields)

| name | category | subcategory | price |
|------|----------|-------------|-------|
| Classic Gold Ring | Rings | Gold Rings | 999.99 |
| Silver Necklace | Necklaces | Silver Necklaces | 499.99 |
| Diamond Bracelet | Bracelets | Diamond Bracelets | 1999.99 |

## Complete Example (All Fields)

| name | category | subcategory | description | shortDescription | price | compareAtPrice | sku | stock | isActive | isFeatured | displayOrder | images | filterValues |
|------|----------|-------------|-------------|------------------|-------|----------------|-----|-------|----------|------------|--------------|--------|--------------|
| Classic Gold Ring | Rings | Gold Rings | Beautiful handcrafted 24k gold ring with intricate traditional designs. Perfect for weddings and special occasions. | 24k gold ring with intricate designs | 999.99 | 1499.99 | RING-GLD-001 | 25 | true | true | 1 | https://example.com/ring1.jpg,https://example.com/ring2.jpg | {"material":"Gold","purity":"24k","occasion":"Wedding"} |
| Silver Necklace Set | Necklaces | Silver Necklaces | Elegant silver necklace set with matching earrings. Rhodium plated for extra shine and durability. | Silver necklace with earrings | 499.99 | 699.99 | NECK-SLV-001 | 15 | true | false | 2 | necklace1.jpg,necklace2.jpg | {"material":"Silver","color":"White"} |
| Diamond Bracelet | Bracelets | Diamond Bracelets | Stunning diamond bracelet with natural diamonds set in 18k white gold. Certified diamonds with excellent cut. | Diamond bracelet in white gold | 1999.99 | | BRAC-DIA-001 | 5 | true | true | 3 | | {"material":"White Gold","stones":"Diamond"} |
| Pearl Earrings | Earrings | Pearl Earrings | Classic pearl drop earrings with AAA grade pearls. Sterling silver posts with secure butterfly backs. | AAA grade pearl earrings | 299.99 | 399.99 | EAR-PRL-001 | 50 | true | false | 4 | https://cdn.example.com/pearl1.jpg | {"material":"Pearl","metal":"Silver"} |

## Example with ZIP File Images

When using a ZIP file, you can reference images by filename:

### Excel Content:

| name | category | subcategory | price | images |
|------|----------|-------------|-------|--------|
| Gold Ring Style 1 | Rings | Gold Rings | 899.99 | ring-style1-front.jpg,ring-style1-back.jpg |
| Gold Ring Style 2 | Rings | Gold Rings | 949.99 | ring-style2-1.jpg,ring-style2-2.jpg,ring-style2-3.jpg |
| Silver Pendant | Pendants | Silver Pendants | 349.99 | pendant-silver-01.jpg |

### ZIP File Structure:

```
products.zip
├── products.xlsx
├── ring-style1-front.jpg
├── ring-style1-back.jpg
├── ring-style2-1.jpg
├── ring-style2-2.jpg
├── ring-style2-3.jpg
└── pendant-silver-01.jpg
```

## Filter Values Examples

Filter values must be in JSON format and match your category's filter definitions.

### Single Select Filters:

```json
{"material":"Gold","purity":"22k","occasion":"Daily Wear"}
```

### Multi-Select Filters:

```json
{"material":"Gold","occasions":["Wedding","Engagement","Party"]}
```

### Mixed Filters:

```json
{"material":"Gold","purity":"18k","occasions":["Wedding","Party"],"color":"Yellow"}
```

## Boolean Field Examples

For `isActive` and `isFeatured` fields, you can use any of these values:

**True values:**
- `true`
- `TRUE`
- `yes`
- `YES`
- `1`

**False values:**
- `false`
- `FALSE`
- `no`
- `NO`
- `0`
- (empty cell)

## Common Patterns

### Products with No Images (Add Later):

| name | category | subcategory | price | images |
|------|----------|-------------|-------|--------|
| Product Name | Category | Subcategory | 99.99 | |

### Products with Single Image:

| name | category | subcategory | price | images |
|------|----------|-------------|-------|--------|
| Product Name | Category | Subcategory | 99.99 | https://example.com/image.jpg |

### Products with Multiple Images (URL):

| name | category | subcategory | price | images |
|------|----------|-------------|-------|--------|
| Product Name | Category | Subcategory | 99.99 | https://cdn.example.com/img1.jpg,https://cdn.example.com/img2.jpg,https://cdn.example.com/img3.jpg |

### Products with Multiple Images (ZIP):

| name | category | subcategory | price | images |
|------|----------|-------------|-------|--------|
| Product Name | Category | Subcategory | 99.99 | image1.jpg,image2.jpg,image3.jpg |

### Sale Products (with compareAtPrice):

| name | category | subcategory | price | compareAtPrice | images |
|------|----------|-------------|-------|----------------|--------|
| Sale Ring | Rings | Gold Rings | 799.99 | 999.99 | sale-ring.jpg |

This shows a discount from 999.99 to 799.99.

### Out of Stock Products:

| name | category | subcategory | price | stock | isActive |
|------|----------|-------------|-------|-------|----------|
| Sold Out Item | Category | Subcategory | 99.99 | 0 | false |

### Featured Products (Show on Homepage):

| name | category | subcategory | price | isFeatured | displayOrder |
|------|----------|-------------|-------|------------|--------------|
| Best Seller Ring | Rings | Gold Rings | 1299.99 | true | 1 |
| Popular Necklace | Necklaces | Gold Necklaces | 899.99 | true | 2 |
| Trending Bracelet | Bracelets | Silver Bracelets | 599.99 | true | 3 |

Lower `displayOrder` numbers appear first.

## Tips for Large Uploads

1. **Start small**: Test with 5-10 products first
2. **Consistent formatting**: Use same format for all rows
3. **Check spellings**: Category and subcategory names must match exactly
4. **Organize images**: Name image files clearly (e.g., `product-name-1.jpg`, `product-name-2.jpg`)
5. **Use SKUs**: Even if optional, SKUs help you manage products
6. **Set display order**: Control how products appear on your website

## Complete Workflow Example

Let's say you want to upload 10 gold rings:

1. Take photos of all 10 rings (2-3 photos per ring)
2. Name photos clearly: `ring1-front.jpg`, `ring1-side.jpg`, etc.
3. Create Excel with 10 rows, one per ring
4. Fill in all details: name, price, stock, etc.
5. In images column, put: `ring1-front.jpg,ring1-side.jpg` for each ring
6. Put Excel file and all 20-30 images in a folder
7. Create ZIP file of that folder
8. Upload ZIP file via bulk upload page
9. System validates data
10. System uploads all images to S3
11. System creates all 10 products
12. Done! View products on products page

This workflow is much faster than:
- Creating each product individually
- Uploading each image through the UI
- Filling in each form field 10 times

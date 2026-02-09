/**
 * Migrate products from packages/scripts/products.json into MongoDB.
 *
 * Run: npx tsx scripts/migrate-from-json.ts (from apps/api)
 * Or:  npm run migrate:products
 *
 * Requires: MONGODB_URI in .env
 */

import 'dotenv/config';

// External API category ID → your category slug
const CATEGORY_MAP: Record<number, string> = {
  8: 'rings',
  9: 'earrings',
  12: 'rings',
  836: '',
  848: 'silverware',
  853: 'necklace',
  863: 'bangle',
  864: 'chain',
  865: 'men-rings',
};
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  connectToDatabase,
  disconnectFromDatabase,
  Product,
  Category,
  Subcategory,
  MetalRate,
} from '@jewellery-website/db';
import mongoose from 'mongoose';

interface ExternalMedia {
  product_id: string;
  storage_location: string;
  creationdate: string;
}

interface ExternalProductDataValues {
  product_id: string;
  product_name: string;
  net_weight: number;
  category: number;
  sub_category: number;
  purity: string;
  regular_wastage: string | null;
  premium_wastage: string | null;
  size?: string;
  color?: string;
  availability?: string;
  global_sku?: string | null;
  sku?: string | null;
  description?: string | null;
  product_description?: string | null;
  short_description?: string | null;
  featured_product?: boolean | null;
  JC_Product_Medias?: ExternalMedia[];
}

interface ExternalProductItem {
  dataValues: ExternalProductDataValues;
  image?: ExternalMedia;
}

interface ProductsJson {
  totalCount: number;
  data: ExternalProductItem[];
}

const DEFAULT_JSON_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'scripts',
  'products.json'
);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImages(item: ExternalProductItem): string[] {
  const medias = item.dataValues.JC_Product_Medias;
  if (Array.isArray(medias) && medias.length > 0) {
    return medias.map((m) => m.storage_location).filter(Boolean);
  }
  if (item.image?.storage_location) {
    return [item.image.storage_location];
  }
  return [];
}

function parseWastage(val: string | null | undefined): number | undefined {
  if (val == null || val === '') return undefined;
  const n = parseFloat(String(val));
  return isNaN(n) ? undefined : n;
}

async function run() {
  const jsonPath = process.env.PRODUCTS_JSON_PATH || DEFAULT_JSON_PATH;
  console.log(`Reading from ${jsonPath}...`);

  const raw = readFileSync(jsonPath, 'utf-8');
  const json = JSON.parse(raw) as ProductsJson;
  const products = json.data ?? [];

  if (products.length === 0) {
    console.log('No products in JSON file.');
    return;
  }

  console.log(`Found ${products.length} products`);

  await connectToDatabase();

  const existingCategories = await Category.find({ isActive: true }).select('_id slug name');
  const categoryBySlug = new Map(existingCategories.map((c) => [c.slug, c]));

  const categoryMapping = new Map<number, string>(Object.entries(CATEGORY_MAP).map(([k, v]) => [parseInt(k, 10), v]));

  const subcategoryNames = new Map<string, string>();
  for (const item of products) {
    const d = item.dataValues;
    const key = `${d.category}_${d.sub_category}`;
    if (!subcategoryNames.has(key)) {
      subcategoryNames.set(key, d.product_name);
    }
  }

  const categoryMap = new Map<number, mongoose.Types.ObjectId>();
  const uniqueCategories = new Set(products.map((p) => p.dataValues.category));

  for (const catId of uniqueCategories) {
    const mappedSlug = categoryMapping.get(catId);
    let resolvedCat: { _id: mongoose.Types.ObjectId };

    if (mappedSlug) {
      const existing = categoryBySlug.get(mappedSlug);
      if (existing) {
        resolvedCat = existing;
      } else {
        const displayName = mappedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        resolvedCat = await Category.create({ name: displayName, slug: mappedSlug, isActive: true, displayOrder: 0 });
        categoryBySlug.set(mappedSlug, resolvedCat);
        console.log(`  Created category: ${displayName}`);
      }
    } else {
      const slug = `category-${catId}`;
      const found = await Category.findOne({ slug });
      resolvedCat = found ?? (await Category.create({
        name: `Category ${catId}`,
        slug,
        isActive: true,
        displayOrder: 0,
      }));
      console.log(`  Created unmapped category: ${catId} (add to CATEGORY_MAP in script)`);
    }

    categoryMap.set(catId, resolvedCat._id);
  }

  // Create subcategories
  const subcategoryMap = new Map<string, mongoose.Types.ObjectId>();
  const uniqueSubs = new Set(
    products.map((p) => `${p.dataValues.category}_${p.dataValues.sub_category}`)
  );

  for (const key of uniqueSubs) {
    const [catIdStr] = key.split('_');
    const catId = Number(catIdStr);
    const categoryOurId = categoryMap.get(catId);
    if (!categoryOurId) continue;

    const name = subcategoryNames.get(key) ?? `Subcategory ${key.split('_')[1]}`;
    const slug = slugify(name);

    let sub = await Subcategory.findOne({ category: categoryOurId, slug });
    if (!sub) {
      sub = await Subcategory.create({
        name,
        slug,
        category: categoryOurId,
        isActive: true,
        displayOrder: 0,
      });
      console.log(`  Created subcategory: ${name}`);
    }
    subcategoryMap.set(key, sub._id);
  }

  // Insert products
  const puritySet = new Set<string>();
  let migrated = 0;

  for (const item of products) {
    const d = item.dataValues;
    const key = `${d.category}_${d.sub_category}`;
    const categoryOurId = categoryMap.get(d.category);
    const subcategoryOurId = subcategoryMap.get(key);

    if (!categoryOurId || !subcategoryOurId) {
      console.warn(`  Skip "${d.product_name}": unknown category/sub_category`);
      continue;
    }

    const purity = (d.purity || '22KT').trim();
    puritySet.add(purity);

    const baseSlug = slugify(d.product_name);
    const slug = `${baseSlug}-${d.product_id.replace(/-/g, '').slice(0, 8)}`;

    const wastage = parseWastage(d.regular_wastage) ?? parseWastage(d.premium_wastage);

    const filterValues: Record<string, string | string[]> = {};
    if (d.size) filterValues.size = d.size;
    if (d.color) filterValues.color = d.color;
    if (d.availability) filterValues.availability = d.availability;

    const skuVal = (d.global_sku ?? d.sku ?? '')?.trim();
    const descriptionVal = (d.description ?? d.product_description ?? '')?.trim();
    const shortDescVal = (d.short_description ?? '')?.trim();

    const productData = {
      name: d.product_name,
      slug,
      description: descriptionVal || undefined,
      shortDescription: shortDescVal || undefined,
      images: getImages(item),
      category: categoryOurId,
      subcategory: subcategoryOurId,
      weightInGrams: d.net_weight,
      metalType: purity,
      wastagePercentage: wastage,
      useDynamicPricing: true,
      sku: skuVal || undefined,
      isFeatured: Boolean(d.featured_product),
      filterValues,
      isActive: true,
      displayOrder: 0,
    };

    await Product.findOneAndUpdate(
      { category: categoryOurId, subcategory: subcategoryOurId, slug },
      { $set: productData },
      { upsert: true, new: true }
    );
    migrated++;
  }

  console.log(`  Products migrated: ${migrated}`);

  // Ensure MetalRate exists for purities
  for (const purity of puritySet) {
    const exists = await MetalRate.findOne({ metalType: purity });
    if (!exists) {
      await MetalRate.create({
        metalType: purity,
        ratePerTenGrams: 0,
        makingChargePerGram: 0,
        gstPercentage: 3,
        isActive: true,
      });
      console.log(`  Created MetalRate placeholder for ${purity} (set rate in admin)`);
    }
  }

  console.log('\n✅ Migration complete.');
  await disconnectFromDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

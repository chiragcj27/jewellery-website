/**
 * Migrate products from JewelCasa collection_multi_filter API into MongoDB.
 * Loops over collection IDs to fetch all products.
 *
 * Run: npm run migrate:api (from apps/api)
 *
 * Env: MONGODB_URI
 *      JEWELCASA_API_BASE_URL (default: https://api.jewelcasa.com/api/v1)
 *      JEWELCASA_AUTH_HEADER (optional)
 *      COLLECTION_IDS - comma-separated, e.g. 1200,1201,1501
 *      Or COLLECTION_ID_START + COLLECTION_ID_END to try a range (e.g. 1-2000)
 */

import 'dotenv/config';

// Manual override: external API category ID → your slug (overrides discovery).
// Omit generic categories (e.g. 863 HANDMADE) here; they use SUBCATEGORY_NAME_TO_SLUG instead.
const CATEGORY_MAP: Record<number, string> = {
  8: 'rings',
  9: 'earrings',
  12: 'rings',
  836: 'chain',
  848: 'silverware',
  853: 'necklace',
  864: 'mangalsutra',
  865: 'men-rings',
};

// API category_name (uppercase) → your slug (used when discovery finds names)
const NAME_TO_SLUG: Record<string, string> = {
  RINGS: 'rings',
  EARRINGS: 'earrings',
  CHAIN: 'chain',
  BANGLE: 'bangle',
  MANGALSUTRA: 'mangalsutra',
  NECKLACE: 'necklace',
  NECKLACES: 'necklace',
  'MEN RINGS': 'men-rings',
  SILVERWARE: 'silverware',
  HANDMADE: 'handmade', // generic; actual slug resolved by subcategory name below
};

// Category IDs that contain mixed types (e.g. HANDMADE has necklace, rings, etc.). For these we
// resolve the actual category slug from subcategory name (and optionally style) via the maps below.
const GENERIC_CATEGORY_IDS = new Set<number>([863]);

// For products in a generic category, subcategory name (uppercase) → your category slug.
// E.g. HANDMADE (863) + BOMBAY → necklace; add more as needed.
const SUBCATEGORY_NAME_TO_SLUG: Record<string, string> = {
  BOMBAY: 'necklace',
  // Add more: e.g. 'SOME RING STYLE': 'rings', 'SOME BANGLE STYLE': 'bangle',
};

import {
  connectToDatabase,
  disconnectFromDatabase,
  Product,
  Category,
  Subcategory,
  MetalRate,
} from '@jewellery-website/db';
import mongoose from 'mongoose';

const API_BASE = process.env.JEWELCASA_API_BASE_URL || 'https://api.jewelcasa.com/api/v1';

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
  size?: string | null;
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

interface ApiResponse {
  totalCount: number;
  hasNextPage: boolean;
  nextOffset: number | null;
  data: ExternalProductItem[];
}

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

function getCollectionIds(): number[] {
  const idsStr = process.env.COLLECTION_IDS;
  if (idsStr) {
    return idsStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }
  const start = parseInt(String(process.env.COLLECTION_ID_START || '1'), 10);
  const end = parseInt(String(process.env.COLLECTION_ID_END || '2000'), 10);
  const ids: number[] = [];
  for (let i = start; i <= end; i++) ids.push(i);
  return ids;
}

async function fetchCollectionPage(
  collectionId: number,
  offset: number
): Promise<ApiResponse | null> {
  const url = new URL(`${API_BASE}/collection_multi_filter`);
  url.searchParams.set('id', String(collectionId));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', '1000');
  url.searchParams.set('subscription_status', 'false');
  url.searchParams.set('category', '');
  url.searchParams.set('sub_category', '');
  url.searchParams.set('metal_type', '');
  url.searchParams.set('style', '');
  url.searchParams.set('sub_style', '');
  url.searchParams.set('net_weight', '');
  url.searchParams.set('availability', '');
  url.searchParams.set('wastage', '');
  url.searchParams.set('price', '');
  url.searchParams.set('purity', '');
  url.searchParams.set('sort', '');
  url.searchParams.set('variant', '');
  url.searchParams.set('wastage_type', 'undefined');
  url.searchParams.set('size', '');

  try {
    const res = await fetch(url.toString(), {
      headers: process.env.JEWELCASA_AUTH_HEADER
        ? { Authorization: process.env.JEWELCASA_AUTH_HEADER }
        : {},
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.statusCode !== 200 || !json.data) return null;
    return json as ApiResponse;
  } catch {
    return null;
  }
}

async function fetchAllProductsFromCollection(
  collectionId: number
): Promise<ExternalProductItem[]> {
  const results: ExternalProductItem[] = [];
  let offset = 0;

  while (true) {
    const resp = await fetchCollectionPage(collectionId, offset);
    if (!resp || !Array.isArray(resp.data) || resp.data.length === 0) break;

    results.push(...resp.data);
    if (!resp.hasNextPage || resp.nextOffset == null) break;
    offset = resp.nextOffset;
  }

  return results;
}

interface SideFilterCategory {
  id: number;
  category_name: string;
}

/** Full side filter response: categories with subcategories (and optionally styles). */
interface SideFilterCategoryItem {
  JC_Category?: { id?: number; category_name?: string } | null;
  JC_Sub_Category?: Array<{ id?: number; sub_category_name?: string; category_id?: number }> | null;
}

interface SideFilterResult {
  categories: SideFilterCategory[];
  /** Key: `${categoryId}_${subCategoryId}`, value: sub_category_name from API */
  subCategoryNames: Map<string, string>;
}

async function fetchCollectionSideFilter(
  collectionId: number
): Promise<SideFilterResult | null> {
  const url = new URL(`${API_BASE}/collection_page_side_filter`);
  url.searchParams.set('id', String(collectionId));
  url.searchParams.set('source', 'collection');
  url.searchParams.set('subscription_status', 'false');
  url.searchParams.set('wastage_type', 'all');
  url.searchParams.set('purity', 'undefined');

  try {
    const res = await fetch(url.toString(), {
      headers: process.env.JEWELCASA_AUTH_HEADER
        ? { Authorization: process.env.JEWELCASA_AUTH_HEADER }
        : {},
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.statusCode !== 200) return null;

    const categories: SideFilterCategory[] = [];
    const seenCat = new Set<number>();
    const subCategoryNames = new Map<string, string>();

    const addCat = (jc: { id?: number; category_name?: string } | null) => {
      if (jc?.id != null && jc.category_name && !seenCat.has(jc.id)) {
        seenCat.add(jc.id);
        categories.push({ id: jc.id, category_name: String(jc.category_name).trim() });
      }
    };

    for (const item of json.category ?? []) {
      const catItem = item as SideFilterCategoryItem;
      addCat(catItem.JC_Category ?? null);
      const catId = catItem.JC_Category?.id;
      const subs = catItem.JC_Sub_Category;
      if (catId != null && Array.isArray(subs)) {
        for (const sub of subs) {
          if (sub?.id != null && sub.sub_category_name != null) {
            const key = `${catId}_${sub.id}`;
            if (!subCategoryNames.has(key)) {
              subCategoryNames.set(key, String(sub.sub_category_name).trim());
            }
          }
        }
      }
    }
    for (const item of json.purity ?? []) {
      addCat((item as { JC_Category?: { id?: number; category_name?: string } }).JC_Category ?? null);
      const purityItem = item as {
        category?: number;
        JC_Sub_Category?: { id?: number; sub_category_name?: string; category_id?: number } | null;
      };
      const catId = purityItem.category ?? purityItem.JC_Sub_Category?.category_id;
      const sub = purityItem.JC_Sub_Category;
      if (catId != null && sub?.id != null && sub.sub_category_name != null) {
        const key = `${catId}_${sub.id}`;
        if (!subCategoryNames.has(key)) {
          subCategoryNames.set(key, String(sub.sub_category_name).trim());
        }
      }
    }

    return { categories, subCategoryNames };
  } catch {
    return null;
  }
}

interface DiscoveredCategoryMaps {
  /** API category ID → your category slug (for non-generic categories) */
  categoryMapping: Map<number, string>;
  /** For generic categories: `${categoryId}_${subCategoryId}` → slug (from subcategory name) */
  subCategorySlugOverrides: Map<string, string>;
  /** `${categoryId}_${subCategoryId}` → sub_category_name from API (for display and subcategory creation) */
  subCategoryNamesFromApi: Map<string, string>;
}

async function discoverCategoriesFromApi(
  collectionIds: number[]
): Promise<DiscoveredCategoryMaps> {
  const categoryMapping = new Map<number, string>(
    Object.entries(CATEGORY_MAP).map(([k, v]) => [parseInt(k, 10), v])
  );
  const discovered = new Map<number, string>();
  const subCategorySlugOverrides = new Map<string, string>();
  const subCategoryNamesFromApi = new Map<string, string>();

  for (const id of collectionIds) {
    const result = await fetchCollectionSideFilter(id);
    if (!result) continue;

    for (const c of result.categories) {
      if (categoryMapping.has(c.id)) continue;
      const nameUpper = c.category_name.toUpperCase().trim();
      const slug =
        NAME_TO_SLUG[nameUpper] ?? NAME_TO_SLUG[nameUpper.replace(/\s+/g, ' ')];
      if (slug) {
        discovered.set(c.id, slug);
        categoryMapping.set(c.id, slug);
      }
    }

    // Merge subcategory names and build overrides for generic categories
    for (const [key, name] of result.subCategoryNames) {
      if (!subCategoryNamesFromApi.has(key)) {
        subCategoryNamesFromApi.set(key, name);
      }
      const [catIdStr] = key.split('_');
      const catId = parseInt(catIdStr, 10);
      if (!GENERIC_CATEGORY_IDS.has(catId)) continue;
      const nameUpper = name.toUpperCase().trim();
      const resolvedSlug = SUBCATEGORY_NAME_TO_SLUG[nameUpper] ?? SUBCATEGORY_NAME_TO_SLUG[nameUpper.replace(/\s+/g, ' ')];
      if (resolvedSlug) {
        subCategorySlugOverrides.set(key, resolvedSlug);
      }
    }
  }

  if (discovered.size > 0) {
    console.log('\nDiscovered categories from API:');
    for (const [id, slug] of discovered) {
      console.log(`  ${id} → ${slug}`);
    }
  }
  if (subCategorySlugOverrides.size > 0) {
    console.log('\nSubcategory → category overrides (generic categories):');
    for (const [key, slug] of subCategorySlugOverrides) {
      const name = subCategoryNamesFromApi.get(key) ?? key;
      console.log(`  ${name} (${key}) → ${slug}`);
    }
  }

  return {
    categoryMapping,
    subCategorySlugOverrides,
    subCategoryNamesFromApi,
  };
}

async function run() {
  const collectionIds = getCollectionIds();
  if (collectionIds.length === 0) {
    console.error(
      'Set COLLECTION_IDS (e.g. 1200,1201,1501) or COLLECTION_ID_START and COLLECTION_ID_END'
    );
    process.exit(1);
  }

  console.log(`Fetching from ${collectionIds.length} collection(s)...`);

  const allProducts: ExternalProductItem[] = [];
  const collectionsWithProducts: number[] = [];
  for (const id of collectionIds) {
    const products = await fetchAllProductsFromCollection(id);
    if (products.length > 0) {
      allProducts.push(...products);
      collectionsWithProducts.push(id);
      console.log(`  Collection ${id}: ${products.length} products`);
    }
  }

  if (allProducts.length === 0) {
    console.log('No products found. Check collection IDs and API access.');
    return;
  }

  console.log(`\nTotal products: ${allProducts.length}`);

  const {
    categoryMapping,
    subCategorySlugOverrides,
    subCategoryNamesFromApi,
  } = await discoverCategoriesFromApi(collectionsWithProducts);

  function getResolvedSlug(categoryId: number, subCategoryId: number): string {
    const key = `${categoryId}_${subCategoryId}`;
    return (
      subCategorySlugOverrides.get(key) ??
      categoryMapping.get(categoryId) ??
      `category-${categoryId}`
    );
  }

  await connectToDatabase();

  const existingCategories = await Category.find({ isActive: true }).select(
    '_id slug name'
  );
  const categoryBySlug = new Map(existingCategories.map((c) => [c.slug, c]));

  // First-product name fallback when API didn't give us subcategory name
  const subcategoryNameFallback = new Map<string, string>();
  for (const item of allProducts) {
    const d = item.dataValues;
    const key = `${d.category}_${d.sub_category}`;
    if (!subcategoryNameFallback.has(key)) {
      subcategoryNameFallback.set(key, d.product_name);
    }
  }

  const uniqueResolvedSlugs = new Set<string>();
  for (const item of allProducts) {
    const d = item.dataValues;
    uniqueResolvedSlugs.add(getResolvedSlug(d.category, d.sub_category));
  }

  for (const resolvedSlug of uniqueResolvedSlugs) {
    const existing = categoryBySlug.get(resolvedSlug);
    if (existing) continue;
    const displayName =
      existingCategories.find((c) => c.slug === resolvedSlug)?.name ??
      resolvedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const created = await Category.create({
      name: displayName,
      slug: resolvedSlug,
      isActive: true,
      displayOrder: 0,
    });
    categoryBySlug.set(resolvedSlug, created);
    console.log(`  Created category: ${created.name} (${resolvedSlug})`);
  }

  const SUBKEY_SEP = '::';
  const subcategoryMap = new Map<string, mongoose.Types.ObjectId>();
  const uniqueSubKeys = new Set<string>();
  for (const item of allProducts) {
    const d = item.dataValues;
    const resolvedSlug = getResolvedSlug(d.category, d.sub_category);
    uniqueSubKeys.add(`${resolvedSlug}${SUBKEY_SEP}${d.category}${SUBKEY_SEP}${d.sub_category}`);
  }

  for (const subKey of uniqueSubKeys) {
    const parts = subKey.split(SUBKEY_SEP);
    const resolvedSlug = parts[0] ?? '';
    const extCatId = parts.length >= 3 ? parseInt(parts[1], 10) : 0;
    const extSubId = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
    const extKey = `${extCatId}_${extSubId}`;
    const categoryOurId = categoryBySlug.get(resolvedSlug)?._id;
    if (!categoryOurId) continue;

    const name =
      subCategoryNamesFromApi.get(extKey) ??
      subcategoryNameFallback.get(extKey) ??
      `Subcategory ${extSubId}`;
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
      console.log(`  Created subcategory: ${name} (under ${resolvedSlug})`);
    }
    subcategoryMap.set(subKey, sub._id);
  }

  const BATCH_SIZE = 500;
  const puritySet = new Set<string>();
  const bulkOps: mongoose.mongo.AnyBulkWriteOperation[] = [];
  let skipped = 0;

  for (const item of allProducts) {
    const d = item.dataValues;
    const resolvedSlug = getResolvedSlug(d.category, d.sub_category);
    const subKey = `${resolvedSlug}${SUBKEY_SEP}${d.category}${SUBKEY_SEP}${d.sub_category}`;
    const categoryOurId = categoryBySlug.get(resolvedSlug)?._id;
    const subcategoryOurId = subcategoryMap.get(subKey);

    if (!categoryOurId || !subcategoryOurId) {
      skipped++;
      continue;
    }

    const purity = (d.purity || '22KT').trim();
    puritySet.add(purity);

    const baseSlug = slugify(d.product_name);
    const slug = `${baseSlug}-${d.product_id.replace(/-/g, '').slice(0, 8)}`;

    const wastage =
      parseWastage(d.regular_wastage) ?? parseWastage(d.premium_wastage);

    const filterValues: Record<string, string | string[]> = {};
    if (d.size) filterValues.size = d.size;
    if (d.color) filterValues.color = d.color;
    if (d.availability) filterValues.availability = d.availability;

    const skuVal =
      ((d.global_sku ?? d.sku ?? '')?.trim()) ||
      d.product_id?.replace(/-/g, '').slice(0, 12) ||
      undefined;
    const descriptionVal =
      (d.description ?? d.product_description ?? '')?.trim() ||
      d.product_name ||
      undefined;
    const shortDescVal =
      (d.short_description ?? '')?.trim() || d.product_name || undefined;

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

    bulkOps.push({
      updateOne: {
        filter: {
          category: categoryOurId,
          subcategory: subcategoryOurId,
          slug,
        },
        update: { $set: productData },
        upsert: true,
      },
    });
  }

  let migrated = 0;
  const totalBatches = Math.ceil(bulkOps.length / BATCH_SIZE);
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const batch = bulkOps.slice(i, i + BATCH_SIZE);
    await Product.bulkWrite(batch);
    migrated += batch.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${totalBatches}: ${batch.length} products`
    );
  }

  if (skipped > 0) console.log(`  Skipped: ${skipped}`);
  console.log(`  Products migrated: ${migrated}`);

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
      console.log(`  Created MetalRate placeholder for ${purity}`);
    }
  }

  console.log('\n✅ Migration complete.');
  await disconnectFromDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

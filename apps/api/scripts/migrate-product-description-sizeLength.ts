/**
 * Migrate Product documents: fix description vs sizeLength.
 *
 * In the old Excel uploads, the description column was used for Size/Length
 * and the shortDescription column for the actual Description. This script:
 * - Where both exist: sizeLength = old description, description = old shortDescription
 * - Where only shortDescription exists: description = shortDescription
 * - Where only description exists: leave as is (description is already correct)
 * - Removes shortDescription from all products.
 *
 * Run from apps/api: npx tsx scripts/migrate-product-description-sizeLength.ts
 * Env: MONGODB_URI
 */

import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '@jewellery-website/db';
import mongoose from 'mongoose';

async function run() {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const collection = db.collection('products');
  const cursor = collection.find({
    $or: [
      { shortDescription: { $exists: true, $ne: null, $ne: '' } },
      { description: { $exists: true, $ne: null, $ne: '' } },
    ],
  });

  let updated = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const doc = (await cursor.next()) as {
      _id: unknown;
      description?: string | null;
      shortDescription?: string | null;
    };
    if (!doc) continue;

    const oldDesc = (doc.description ?? '').trim();
    const oldShort = (doc.shortDescription ?? '').trim();

    const updates: Record<string, unknown> = {};
    const unsets: Record<string, 1> = {};

    if (oldShort) {
      // Real description came from shortDescription (Excel convention)
      updates.description = oldShort;
    }
    if (oldDesc) {
      // Size/Length was in description column (Excel convention)
      updates.sizeLength = oldDesc;
    }
    // Always remove shortDescription
    unsets.shortDescription = 1;

    if (Object.keys(updates).length > 0 || Object.keys(unsets).length > 0) {
      const updateOp: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {};
      if (Object.keys(updates).length > 0) updateOp.$set = updates;
      if (Object.keys(unsets).length > 0) updateOp.$unset = unsets;
      await collection.updateOne({ _id: doc._id }, updateOp);
      updated++;
      if (updated <= 5) {
        console.log(`  Updated product ${doc._id}: description=${!!updates.description}, sizeLength=${!!updates.sizeLength}`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Migration done. Updated: ${updated}, Skipped: ${skipped}`);
  await disconnectFromDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Migrate MetalRate documents from makingChargePerGram (₹ per gram)
 * to makingChargesPercentage (% of gold value).
 *
 * Run: npx tsx scripts/migrate-metal-rates-making-charges.ts (from apps/api)
 *
 * Env: MONGODB_URI
 *
 * Documents with makingChargePerGram will get makingChargesPercentage = 15 (default).
 * You can re-configure the exact % in the admin Metal Rates page after migration.
 */

import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '@jewellery-website/db';
import mongoose from 'mongoose';

const DEFAULT_MAKING_CHARGES_PERCENTAGE = 15;

async function run() {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const collection = db.collection('metalrates');
  const withOld = await collection.find({ makingChargePerGram: { $exists: true } }).toArray();

  if (withOld.length === 0) {
    console.log('No documents with makingChargePerGram found. Nothing to migrate.');
    await disconnectFromDatabase();
    return;
  }

  console.log(`Found ${withOld.length} MetalRate(s) with old field makingChargePerGram.`);
  console.log(`Migrating to makingChargesPercentage = ${DEFAULT_MAKING_CHARGES_PERCENTAGE}% (default).`);
  console.log('You can edit the exact % in Admin > Metal Rates after migration.\n');

  let updated = 0;
  for (const doc of withOld) {
    await collection.updateOne(
      { _id: doc._id },
      {
        $set: { makingChargesPercentage: DEFAULT_MAKING_CHARGES_PERCENTAGE },
        $unset: { makingChargePerGram: '' },
      }
    );
    updated++;
    console.log(`  Updated ${(doc as { metalType?: string }).metalType ?? doc._id}`);
  }

  console.log(`\n✅ Migrated ${updated} MetalRate(s).`);
  await disconnectFromDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

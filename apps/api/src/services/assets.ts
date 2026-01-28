import { connectToDatabase, Asset } from '@jewellery-website/db';
import { deleteFromS3 } from './s3';

/**
 * Delete an asset from S3 and remove its metadata. Use when a parent operation
 * (e.g. create category) fails after the asset was uploaded, to avoid orphans.
 */
export async function deleteAssetById(assetId: string): Promise<void> {
  await connectToDatabase();
  const asset = await Asset.findById(assetId);
  if (!asset) return;
  try {
    await deleteFromS3(asset.key);
  } catch (e) {
    console.warn('S3 delete failed for key', asset.key, e);
  }
  await Asset.findByIdAndDelete(assetId);
}

/**
 * Delete multiple assets from S3 and remove their metadata.
 */
export async function deleteAssetsByIds(assetIds: string[]): Promise<void> {
  await Promise.all(assetIds.map((id) => deleteAssetById(id)));
}

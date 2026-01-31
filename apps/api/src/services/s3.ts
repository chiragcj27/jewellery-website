import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET || '';
const baseUrl =
  process.env.AWS_S3_PUBLIC_BASE_URL ||
  (bucket ? `https://${bucket}.s3.${region}.amazonaws.com` : '');

const client = new S3Client({
  region,
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export const S3_AVAILABLE = Boolean(bucket && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_S3_ENDPOINT));

/**
 * Generate a unique S3 key for an asset (folder/prefix + random id + ext)
 */
export function generateKey(prefix: string, originalFilename: string): string {
  const ext = originalFilename.replace(/^.*\./, '') || 'bin';
  const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : 'bin';
  const id = Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString('base64url');
  return `${prefix}/${id}.${safeExt}`.replace(/\/+/g, '/');
}

/**
 * Upload a buffer to S3 and return the public URL and key.
 */
export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; url: string }> {
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
    // Note: ACL removed - bucket uses bucket policy for public access
  };

  await client.send(new PutObjectCommand(input));

  const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${params.key}` : `https://${bucket}.s3.${region}.amazonaws.com/${params.key}`;
  return { key: params.key, url };
}

/**
 * Delete an object from S3 by key.
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!bucket) return;
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export { baseUrl, bucket, region };

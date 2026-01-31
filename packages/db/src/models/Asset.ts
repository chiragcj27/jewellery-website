import mongoose, { Schema, Document } from 'mongoose';

export type AssetRefType = 'Category' | 'Subcategory' | 'Product' | null;

export interface IAsset extends Document {
  /** S3 object key (e.g. assets/categories/abc123.jpg) - used for delete */
  key: string;
  /** Public URL to serve the file */
  url: string;
  mimeType: string;
  size: number;
  originalFilename: string;
  /** Document type this asset is attached to */
  refType: AssetRefType;
  /** ID of the document when attached */
  refId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    refType: {
      type: String,
      enum: ['Category', 'Subcategory', 'Product'],
      required: false,
    },
    refId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Note: key index is automatically created via unique: true on the field
AssetSchema.index({ refType: 1, refId: 1 });

export default mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

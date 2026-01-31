import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  image: string; // URL or asset reference
  link?: string; // Optional link when banner is clicked
  title?: string; // Optional title for accessibility
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
BannerSchema.index({ displayOrder: 1 });
BannerSchema.index({ isActive: 1 });

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

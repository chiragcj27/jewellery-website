import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';

export interface ISubcategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: mongoose.Types.ObjectId | ICategory;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
SubcategorySchema.index({ category: 1, slug: 1 }, { unique: true });
SubcategorySchema.index({ category: 1, displayOrder: 1 });

export default mongoose.models.Subcategory || mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);

import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';
import { ISubcategory } from './Subcategory';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  category: mongoose.Types.ObjectId | ICategory;
  subcategory: mongoose.Types.ObjectId | ISubcategory;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  filterValues: Record<string, string | string[]>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
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
    shortDescription: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    filterValues: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ProductSchema.index({ category: 1, subcategory: 1, slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ displayOrder: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

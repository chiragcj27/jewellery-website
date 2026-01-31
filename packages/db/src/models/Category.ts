import mongoose, { Schema, Document } from 'mongoose';

export interface IFilter {
  name: string;
  slug: string;
  type: 'select' | 'multiselect';
  options: string[];
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  filters: IFilter[];
  createdAt: Date;
  updatedAt: Date;
}

const FilterSchema = new Schema(
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
    type: {
      type: String,
      enum: ['select', 'multiselect'],
      required: true,
    },
    options: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    filters: {
      type: [FilterSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// Note: slug index is automatically created via unique: true on the field
CategorySchema.index({ displayOrder: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

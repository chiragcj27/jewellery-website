import mongoose, { Schema, Document } from 'mongoose';

export interface IMetalRate extends Document {
  metalType: string; // e.g., "22KT", "18KT", "20KT", "24KT", "Silver", "Platinum"
  ratePerTenGrams: number; // Gold rate per 10 grams
  makingChargePerGram: number; // Making charges per gram
  gstPercentage: number; // GST percentage (e.g., 3 for 3%)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MetalRateSchema: Schema = new Schema(
  {
    metalType: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ratePerTenGrams: {
      type: Number,
      required: true,
      min: 0,
    },
    makingChargePerGram: {
      type: Number,
      required: true,
      min: 0,
    },
    gstPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 3,
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

// Create index for quick lookup by metal type
MetalRateSchema.index({ metalType: 1 });
MetalRateSchema.index({ isActive: 1 });

export default mongoose.models.MetalRate || mongoose.model<IMetalRate>('MetalRate', MetalRateSchema);

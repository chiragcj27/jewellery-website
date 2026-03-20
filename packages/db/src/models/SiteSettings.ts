import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  preHeaderText?: string;
  preHeaderLink?: string;
  /** WhatsApp number for business enquiries (with country code, no +) e.g. 919876543210 */
  whatsappEnquiryNumber?: string;
  /** Global discount percentage applied to all products (0 = disabled) */
  discountPercentage?: number;
  /** Reason for the discount, e.g. "Valentine", "Diwali" */
  discountReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    preHeaderText: {
      type: String,
      trim: true,
      default: '✨ Free shipping on orders over $150',
    },
    preHeaderLink: {
      type: String,
      trim: true,
    },
    whatsappEnquiryNumber: {
      type: String,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

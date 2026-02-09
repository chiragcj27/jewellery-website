import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  preHeaderText?: string;
  preHeaderLink?: string;
  /** WhatsApp number for business enquiries (with country code, no +) e.g. 919876543210 */
  whatsappEnquiryNumber?: string;
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

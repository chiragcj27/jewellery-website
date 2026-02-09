import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'customer' | 'wholesaler';
export type WholesalerApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  // Wholesaler-specific (when role === 'wholesaler')
  businessName?: string;
  gstNo?: string;
  firmName?: string;
  city?: string;
  visitingCardImage?: string;
  mobNumber?: string;
  gstCertificateFiles?: string[];
  approvalStatus?: WholesalerApprovalStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'wholesaler'],
      required: true,
      default: 'customer',
    },
    // Wholesaler fields
    businessName: { type: String, trim: true },
    gstNo: { type: String, trim: true },
    firmName: { type: String, trim: true },
    city: { type: String, trim: true },
    visitingCardImage: { type: String, trim: true },
    mobNumber: { type: String, trim: true },
    gstCertificateFiles: [{ type: String, trim: true }],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, approvalStatus: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

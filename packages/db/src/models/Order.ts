import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'enquiry' | 'pending_payment' | 'payment_failed' | 'in_process' | 'shipped' | 'delivered';

export interface IOrderItem {
  productId: string;
  title: string;
  sku: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  weightInGrams?: number;
  metalType?: string;
  wastagePercentage?: number;
  makingChargesPercentage?: number;
  hasStone?: boolean;
  stoneName?: string;
  stoneWeight?: number;
  stoneValue?: number;
  linePrice: number; // Calculated at time of order
  selectedMetalColor?: string;
  selectedSizeLength?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  wastageIncluded: boolean;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  /** Snapshot of discount applied at order time */
  discountPercentage?: number;
  discountReason?: string;
  discountAmount?: number;
  /** Snapshot of customer/wholesaler info at order time */
  customerName: string;
  customerEmail: string;
  businessName?: string;
  mobileNumber?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    weightInGrams: { type: Number },
    metalType: { type: String },
    wastagePercentage: { type: Number },
    makingChargesPercentage: { type: Number },
    hasStone: { type: Boolean, default: false },
    stoneName: { type: String },
    stoneWeight: { type: Number },
    stoneValue: { type: Number },
    linePrice: { type: Number, required: true },
    selectedMetalColor: { type: String },
    selectedSizeLength: { type: String },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    status: {
      type: String,
      enum: ['enquiry', 'pending_payment', 'payment_failed', 'in_process', 'shipped', 'delivered'],
      default: 'enquiry',
    },
    wastageIncluded: { type: Boolean, default: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    discountPercentage: { type: Number },
    discountReason: { type: String },
    discountAmount: { type: Number },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    businessName: { type: String },
    mobileNumber: { type: String },
    notes: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

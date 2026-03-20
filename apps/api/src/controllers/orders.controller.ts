import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { connectToDatabase, Order, User, MetalRate, SiteSettings, getEffectiveWeight } from '@jewellery-website/db';
import { getErrorMessage } from '../utils/errors';
import type { IOrderItem, OrderStatus } from '@jewellery-website/db';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function calculateLinePrice(
  weightInGrams: number | null,
  metalType: string | null,
  wastagePercentage: number,
  wastageIncluded: boolean,
  price: number,
  quantity: number,
  metalRates: { metalType: string; ratePerTenGrams: number; makingChargesPercentage: number; gstPercentage: number }[],
  customMakingChargesPercentage?: number,
  stoneProperties?: {
    hasStone?: boolean;
    stoneName?: string;
    stoneWeight?: number;
    stoneValue?: number;
  }
): { subtotal: number; gstAmount: number } {
  if (weightInGrams == null || !metalType) {
    return { subtotal: price * quantity, gstAmount: 0 };
  }
  const rate = metalRates.find((r) => r.metalType === metalType);
  if (!rate) return { subtotal: price * quantity, gstAmount: 0 };
  const wastage = wastageIncluded ? wastagePercentage : 0;
  const effectiveWeight = getEffectiveWeight(weightInGrams, wastage);
  const goldCost = (rate.ratePerTenGrams / 10) * effectiveWeight;
  const makingChargesPercent = customMakingChargesPercentage ?? rate.makingChargesPercentage;
  const makingCharges = goldCost * (makingChargesPercent / 100);

  let stoneCharges = 0;
  if (stoneProperties?.hasStone && stoneProperties.stoneValue && stoneProperties.stoneWeight) {
    stoneCharges = stoneProperties.stoneValue * stoneProperties.stoneWeight;
  }

  const subtotal = goldCost + makingCharges + stoneCharges;
  const gstAmount = (subtotal * rate.gstPercentage) / 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100 * quantity,
    gstAmount: Math.round(gstAmount * 100) / 100 * quantity
  };
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const token = authHeader.slice(7);
    let payload: { sub: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    } catch {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    await connectToDatabase();
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    const isWholesaler = user.role === 'wholesaler' && user.approvalStatus === 'approved';

    const { items, wastageIncluded = true } = req.body as {
      items: Array<{
        id: string;
        title: string;
        image: string;
        price: number;
        mrp: number;
        quantity: number;
        sku: string;
        weightInGrams?: number;
        metalType?: string;
        wastagePercentage?: number;
        makingChargesPercentage?: number;
        hasStone?: boolean;
        stoneName?: string;
        stoneWeight?: number;
        stoneValue?: number;
        selectedMetalColor?: string;
        selectedSizeLength?: string;
      }>;
      wastageIncluded?: boolean;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const metalRatesRaw = await MetalRate.find({ isActive: true }).lean();
    const metalRates: Array<{ metalType: string; ratePerTenGrams: number; makingChargesPercentage: number; gstPercentage: number }> =
      metalRatesRaw.map((r) => ({
        metalType: (r as Record<string, unknown>).metalType as string,
        ratePerTenGrams: (r as Record<string, unknown>).ratePerTenGrams as number,
        makingChargesPercentage: (r as Record<string, unknown>).makingChargesPercentage as number,
        gstPercentage: (r as Record<string, unknown>).gstPercentage as number,
      }));

    // Fetch discount settings
    const siteSettings = await SiteSettings.findOne().lean() as Record<string, unknown> | null;
    const discountPercentage = (siteSettings?.discountPercentage as number) || 0;
    const discountReason = (siteSettings?.discountReason as string) || '';

    let accumulatedSubtotal = 0;
    let accumulatedTax = 0;

    const orderItems: IOrderItem[] = items.map((item) => {
      const priceData = calculateLinePrice(
        item.weightInGrams ?? null,
        item.metalType ?? null,
        item.wastagePercentage ?? 0,
        wastageIncluded,
        item.price,
        item.quantity,
        metalRates,
        item.makingChargesPercentage,
        {
          hasStone: item.hasStone,
          stoneName: item.stoneName,
          stoneWeight: item.stoneWeight,
          stoneValue: item.stoneValue,
        }
      );
      
      const itemSubtotal = priceData.subtotal;
      accumulatedSubtotal += itemSubtotal;
      
      const isDynamic = item.weightInGrams != null && item.metalType != null;
      if (isDynamic) {
        accumulatedTax += priceData.gstAmount;
      } else {
        // Use the GST percentage from the first available metal rate (global config)
        const globalGstPercent = metalRates.length > 0 ? metalRates[0].gstPercentage : 3;
        accumulatedTax += (itemSubtotal * (globalGstPercent / 100));
      }

      return {
        productId: item.id,
        title: item.title,
        sku: item.sku,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
        quantity: item.quantity,
        weightInGrams: item.weightInGrams,
        metalType: item.metalType,
        wastagePercentage: item.wastagePercentage,
        makingChargesPercentage: item.makingChargesPercentage,
        hasStone: item.hasStone,
        stoneName: item.stoneName,
        stoneWeight: item.stoneWeight,
        stoneValue: item.stoneValue,
        selectedMetalColor: item.selectedMetalColor,
        selectedSizeLength: item.selectedSizeLength,
        linePrice: Math.round(itemSubtotal * 100) / 100,
      };
    });

    const subtotalBeforeDiscount = Math.round(accumulatedSubtotal * 100) / 100;

    // Apply discount
    const discountAmount = discountPercentage > 0
      ? Math.round((subtotalBeforeDiscount * discountPercentage / 100) * 100) / 100
      : 0;
    const subtotal = Math.round((subtotalBeforeDiscount - discountAmount) * 100) / 100;

    // Recalculate tax on discounted subtotal
    const discountMultiplier = discountPercentage > 0 ? (1 - discountPercentage / 100) : 1;
    const tax = Math.round(accumulatedTax * discountMultiplier * 100) / 100;

    const shippingThreshold = 15000;
    const shipping = subtotal >= shippingThreshold ? 0 : 150;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    let razorpayOrderData = null;
    let initialStatus: OrderStatus = 'enquiry';
    
    if (!isWholesaler) {
      initialStatus = 'pending_payment';
      try {
        const rpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}_${user._id}`,
        });
        razorpayOrderData = rpOrder;
      } catch (err) {
        console.error('Razorpay order creation error:', err);
        res.status(500).json({ success: false, error: 'Failed to initialize payment' });
        return;
      }
    }

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      status: initialStatus,
      razorpayOrderId: razorpayOrderData?.id,
      wastageIncluded,
      subtotal,
      tax,
      shipping,
      total,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      discountReason: discountPercentage > 0 ? discountReason : undefined,
      discountAmount: discountPercentage > 0 ? discountAmount : undefined,
      customerName: user.name,
      customerEmail: user.email,
      businessName: user.businessName || user.firmName,
      mobileNumber: user.mobNumber,
    });

    const obj = order.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- __v excluded from response
    const { __v, ...rest } = obj as Record<string, unknown> & { __v?: unknown };
    res.status(201).json({ 
      success: true, 
      data: rest, 
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id'
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const { status } = req.query as { status?: string };
    const filter = status && ['enquiry', 'in_process', 'shipped', 'delivered'].includes(status)
      ? { status: status as OrderStatus }
      : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email role businessName firmName mobNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('user', 'name email role businessName firmName mobNumber gstNo city')
      .lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    await connectToDatabase();
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    const validStatuses = ['enquiry', 'in_process', 'shipped', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status. Use: enquiry, in_process, shipped, delivered' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: status as OrderStatus },
      { new: true }
    )
      .populate('user', 'name email')
      .lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, error: 'Missing payment signature details' });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Signature mismatch - update order to failed if needed
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'payment_failed' }
      );
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
      return;
    }

    // Payment successful
    await connectToDatabase();
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        status: 'in_process',
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    ).lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found for this payment' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}

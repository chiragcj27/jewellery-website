import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { connectToDatabase, Order, User, MetalRate, getEffectiveWeight } from '@jewellery-website/db';
import { getErrorMessage } from '../utils/errors';
import type { IOrderItem, OrderStatus } from '@jewellery-website/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function calculateLinePrice(
  weightInGrams: number | null,
  metalType: string | null,
  wastagePercentage: number,
  wastageIncluded: boolean,
  price: number,
  quantity: number,
  metalRates: { metalType: string; ratePerTenGrams: number; makingChargePerGram: number; gstPercentage: number }[]
): number {
  if (weightInGrams == null || !metalType) {
    return price * quantity;
  }
  const rate = metalRates.find((r) => r.metalType === metalType);
  if (!rate) return price * quantity;
  const wastage = wastageIncluded ? wastagePercentage : 0;
  const effectiveWeight = getEffectiveWeight(weightInGrams, wastage);
  const goldCost = (rate.ratePerTenGrams / 10) * effectiveWeight;
  const makingCharges = rate.makingChargePerGram * effectiveWeight;
  const subtotal = goldCost + makingCharges;
  const gstAmount = (subtotal * rate.gstPercentage) / 100;
  const finalPrice = Math.round((subtotal + gstAmount) * 100) / 100;
  return finalPrice * quantity;
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

    if (user.role !== 'wholesaler' || user.approvalStatus !== 'approved') {
      res.status(403).json({ success: false, error: 'Only approved business accounts can submit enquiries' });
      return;
    }

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
      }>;
      wastageIncluded?: boolean;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const metalRatesRaw = await MetalRate.find({ isActive: true }).lean();
    const metalRates: Array<{ metalType: string; ratePerTenGrams: number; makingChargePerGram: number; gstPercentage: number }> =
      metalRatesRaw.map((r) => ({
        metalType: (r as Record<string, unknown>).metalType as string,
        ratePerTenGrams: (r as Record<string, unknown>).ratePerTenGrams as number,
        makingChargePerGram: (r as Record<string, unknown>).makingChargePerGram as number,
        gstPercentage: (r as Record<string, unknown>).gstPercentage as number,
      }));
    const orderItems: IOrderItem[] = items.map((item) => {
      const linePrice = calculateLinePrice(
        item.weightInGrams ?? null,
        item.metalType ?? null,
        item.wastagePercentage ?? 0,
        wastageIncluded,
        item.price,
        item.quantity,
        metalRates
      );
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
        linePrice: Math.round(linePrice * 100) / 100,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.linePrice, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shippingThreshold = 15000;
    const shipping = subtotal >= shippingThreshold ? 0 : 150;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      status: 'enquiry',
      wastageIncluded,
      subtotal,
      tax,
      shipping,
      total,
      customerName: user.name,
      customerEmail: user.email,
      businessName: user.businessName || user.firmName,
      mobileNumber: user.mobNumber,
    });

    const obj = order.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- __v excluded from response
    const { __v, ...rest } = obj as Record<string, unknown> & { __v?: unknown };
    res.status(201).json({ success: true, data: rest });
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

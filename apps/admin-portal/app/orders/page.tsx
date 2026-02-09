'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type OrderStatus = 'enquiry' | 'in_process' | 'shipped' | 'delivered';

interface OrderItem {
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
  linePrice: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  status: OrderStatus;
  wastageIncluded: boolean;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerName: string;
  customerEmail: string;
  businessName?: string;
  mobileNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
    businessName?: string;
    firmName?: string;
    mobNumber?: string;
  };
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  enquiry: 'Enquiry',
  in_process: 'In Process',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  enquiry: 'bg-amber-100 text-amber-800',
  in_process: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await api.orders.getAll(statusFilter || undefined);
      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(orderId);
    try {
      const result = await api.orders.updateStatus(orderId, newStatus);
      if (result.success) {
        await fetchOrders();
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Orders & Enquiries</h1>
            <p className="mt-1 text-sm text-gray-600">
              Business enquiries from wholesalers. Update order status as you process them.
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              statusFilter === ''
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          {(['enquiry', 'in_process', 'shipped', 'delivered'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                statusFilter === s
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading…
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No orders found for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  className="w-full px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{order.customerName}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{order.businessName || order.customerEmail}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {order.items.length} item(s) • Total {formatPrice(order.total)} • {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={statusUpdating === order._id}
                      className={`text-sm font-medium px-3 py-1.5 rounded-full border-0 ${STATUS_COLORS[order.status]} focus:ring-2 focus:ring-gray-500 disabled:opacity-50`}
                    >
                      {(['enquiry', 'in_process', 'shipped', 'delivered'] as const).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-400">
                      {expandedId === order._id ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {expandedId === order._id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
                        <dl className="text-sm space-y-1">
                          <div><dt className="text-gray-500 inline">Name: </dt><dd className="inline text-gray-900">{order.customerName}</dd></div>
                          <div><dt className="text-gray-500 inline">Email: </dt><dd className="inline text-gray-900">{order.customerEmail}</dd></div>
                          {order.businessName && (
                            <div><dt className="text-gray-500 inline">Business: </dt><dd className="inline text-gray-900">{order.businessName}</dd></div>
                          )}
                          {order.mobileNumber && (
                            <div><dt className="text-gray-500 inline">Phone: </dt><dd className="inline text-gray-900">{order.mobileNumber}</dd></div>
                          )}
                          <div><dt className="text-gray-500 inline">Wastage included: </dt><dd className="inline">{order.wastageIncluded ? 'Yes' : 'No'}</dd></div>
                        </dl>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h3>
                        <dl className="text-sm space-y-1">
                          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                          <div className="flex justify-between"><dt>Tax (GST)</dt><dd>{formatPrice(order.tax)}</dd></div>
                          <div className="flex justify-between"><dt>Shipping</dt><dd>{formatPrice(order.shipping)}</dd></div>
                          <div className="flex justify-between font-semibold text-gray-900"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
                        </dl>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex gap-4 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-sm text-gray-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                            {(item.weightInGrams != null || item.metalType) && (
                              <p className="text-xs text-gray-500">
                                {item.metalType && <span>{item.metalType}</span>}
                                {item.weightInGrams != null && <span> • {item.weightInGrams}g</span>}
                                {item.wastagePercentage != null && order.wastageIncluded && (
                                  <span> • Wastage: {item.wastagePercentage}%</span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-medium text-gray-900">{formatPrice(item.linePrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

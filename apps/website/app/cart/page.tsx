"use client";

import { useSyncExternalStore, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";
import { useAuth } from "@/context/AuthProvider";
import { api, getAuthToken } from "@/lib/api";
import { calculatePrice, getEffectiveWeight, type MetalRateData } from "@/lib/priceCalculator";

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { isWholesaler } = useAuth();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const [metalRates, setMetalRates] = useState<MetalRateData[]>([]);
  const [metalRatesLoading, setMetalRatesLoading] = useState(false);
  const [wastageEnabled, setWastageEnabled] = useState(true);
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const cartItems = useSyncExternalStore<CartItem[]>(
    (onStoreChange) => useCartStore.subscribe(onStoreChange),
    () => useCartStore.getState().items,
    () => []
  );

  const hasWholesalerItems = useMemo(
    () => cartItems.some((i) => i.weightInGrams != null && i.metalType),
    [cartItems]
  );

  useEffect(() => {
    if (!hasWholesalerItems) return;
    const id = setTimeout(() => setMetalRatesLoading(true), 0);
    api.metalRates.getAll(true).then((res: { success?: boolean; data?: MetalRateData[] }) => {
      if (res.success && Array.isArray(res.data)) setMetalRates(res.data);
      setMetalRatesLoading(false);
    }).catch(() => setMetalRatesLoading(false));
    return () => clearTimeout(id);
  }, [hasWholesalerItems]);

  const getItemLinePrice = useMemo(() => {
    return (item: CartItem): number | null => {
      if (item.weightInGrams == null || !item.metalType) return item.price * item.quantity;
      const rate = metalRates.find((r) => r.metalType === item.metalType);
      if (!rate) return null;
      const wastage = wastageEnabled ? (item.wastagePercentage ?? 0) : 0;
      const effectiveWeight = getEffectiveWeight(item.weightInGrams, wastage);
      const breakdown = calculatePrice(effectiveWeight, rate);
      return breakdown.finalPrice * item.quantity;
    };
  }, [metalRates, wastageEnabled]);

  const retailSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => {
      if (item.weightInGrams != null && item.metalType) return sum;
      return sum + item.price * item.quantity;
    }, 0),
    [cartItems]
  );

  const wholesalerSubtotal = useMemo(() => {
    if (!hasWholesalerItems || metalRates.length === 0) return 0;
    return cartItems.reduce((sum, item) => {
      if (item.weightInGrams == null || !item.metalType) return sum;
      const rate = metalRates.find((r) => r.metalType === item.metalType);
      if (!rate) return sum;
      const wastage = wastageEnabled ? (item.wastagePercentage ?? 0) : 0;
      const effectiveWeight = getEffectiveWeight(item.weightInGrams, wastage);
      const breakdown = calculatePrice(effectiveWeight, rate);
      return sum + breakdown.finalPrice * item.quantity;
    }, 0);
  }, [cartItems, hasWholesalerItems, metalRates, wastageEnabled]);

  const subtotal = hasWholesalerItems ? retailSubtotal + wholesalerSubtotal : getSubtotal();
  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.weightInGrams != null && item.metalType) return sum;
    return sum + (item.mrp - item.price) * item.quantity;
  }, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const shippingThreshold = 15000;
  const shippingFee = subtotal >= shippingThreshold ? 0 : 150;
  const finalTotal = total + shippingFee;

  const showWholesalerCalculating = hasWholesalerItems && (metalRatesLoading || metalRates.length === 0);

  const handleSendWhatsAppEnquiry = async () => {
    const token = getAuthToken();
    if (!token) {
      setEnquiryError("Please sign in to send an enquiry");
      return;
    }
    setEnquirySending(true);
    setEnquiryError(null);
    try {
      const orderPayload = {
        items: cartItems.map((i) => ({
          id: i.id,
          title: i.title,
          image: i.image,
          price: i.price,
          mrp: i.mrp,
          quantity: i.quantity,
          sku: i.sku,
          weightInGrams: i.weightInGrams,
          metalType: i.metalType,
          wastagePercentage: i.wastagePercentage,
        })),
        wastageIncluded: wastageEnabled,
      };
      const res = await api.orders.create(orderPayload, token);
      if (!res.success) {
        setEnquiryError(res.error || "Failed to create enquiry");
        return;
      }
      const order = res.data;
      const orderId = order._id;
      const lines: string[] = [
        `*New Business Enquiry*`,
        ``,
        `Order ID: ${orderId}`,
        `Customer: ${order.customerName}`,
        `Business: ${order.businessName || "—"}`,
        `Total: ₹${order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        ``,
        `Items:`,
        ...order.items.map(
          (it: { title: string; sku: string; quantity: number; linePrice: number }) =>
            `• ${it.title} (SKU: ${it.sku}) x${it.quantity} - ₹${it.linePrice.toLocaleString("en-IN")}`
        ),
      ];
      const message = encodeURIComponent(lines.join("\n"));
      const settingsRes = await api.siteSettings.get();
      const whatsappNumber = settingsRes?.whatsappEnquiryNumber?.trim?.()?.replace(/^\+/, "") || "";
      if (!whatsappNumber) {
        setEnquiryError("WhatsApp number not configured. Please contact support.");
        return;
      }
      const waUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${message}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEnquirySending(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto text-gray-300"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 belleza-regular">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-8 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2 belleza-regular">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
          {isWholesaler && hasWholesalerItems && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Include wastage in pricing</span>
              <button
                type="button"
                role="switch"
                aria-checked={wastageEnabled}
                onClick={() => setWastageEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 ${
                  wastageEnabled ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none absolute left-1 top-1 inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    wastageEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-500">{wastageEnabled ? "On" : "Off"}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isWholesalerItem = item.weightInGrams != null && item.metalType;
              const linePrice = getItemLinePrice(item);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-32 h-32 bg-[#f8f5ef] rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 128px"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-black mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                        {isWholesalerItem ? (
                          <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-4">
                            <span>Purity: {item.metalType}</span>
                            {item.weightInGrams != null && <span>{item.weightInGrams}g</span>}
                            {wastageEnabled && item.wastagePercentage != null && (
                              <span>Wastage: {item.wastagePercentage}%</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.mrp)}
                            </span>
                            <span className="text-lg font-bold text-black">
                              {formatPrice(item.price)}
                            </span>
                            {item.mrp > item.price && (
                              <span className="text-xs text-green-600 font-medium">
                                Save {formatPrice(item.mrp - item.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 text-black font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          {isWholesalerItem ? (
                            linePrice != null ? (
                              <p className="text-lg font-bold text-black">{formatPrice(linePrice)}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Price at checkout</p>
                            )
                          ) : (
                            <p className="text-lg font-bold text-black">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-black mb-6 belleza-regular">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {showWholesalerCalculating && (
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                    Loading metal rates to calculate price…
                  </p>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {showWholesalerCalculating ? "—" : formatPrice(subtotal)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span className="font-medium">{formatPrice(totalSavings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                {subtotal < shippingThreshold && subtotal > 0 && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(shippingThreshold - subtotal)} more for free shipping
                  </p>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST)</span>
                  <span className="font-medium">
                    {showWholesalerCalculating ? "—" : formatPrice(tax)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-black">Total</span>
                    <span className="text-2xl font-bold text-black">
                      {showWholesalerCalculating ? "—" : formatPrice(finalTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>
              </div>

              {isWholesaler && (
                <>
                  <button
                    onClick={handleSendWhatsAppEnquiry}
                    disabled={enquirySending || showWholesalerCalculating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>{enquirySending ? "Creating enquiry…" : "Send enquiry via WhatsApp"}</span>
                  </button>
                  {enquiryError && (
                    <p className="text-sm text-red-600 mb-3">{enquiryError}</p>
                  )}
                </>
              )}

              <button
                onClick={() => {}}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 transition-colors mb-4"
              >
                <span>Proceed to Checkout</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

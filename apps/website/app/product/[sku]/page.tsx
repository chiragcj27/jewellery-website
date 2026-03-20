"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/context/AuthProvider";

import { api } from "@/lib/api";
import { getDisplayPrice, formatPrice, calculatePrice } from "@/lib/priceCalculator";
import type { MetalRateData, PriceBreakdown } from "@/lib/priceCalculator";

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  images: string[];
  price?: number;
  compareAtPrice?: number;
  description?: string;
  sizeLength?: string;
  category: { _id: string; name: string; slug: string };
  subcategory: { _id: string; name: string; slug: string };
  useDynamicPricing?: boolean;
  weightInGrams?: number;
  metalType?: string;
  wastagePercentage?: number;
  makingChargesPercentage?: number;
  hasStone?: boolean;
  stoneName?: string;
  stoneWeight?: number;
  stoneValue?: number;
  metadata?: Record<string, unknown>;
}

function calculateDiscount(price: number, compareAt?: number): string | null {
  if (compareAt == null || compareAt <= 0 || price >= compareAt) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  return pct > 0 ? `${pct}%` : null;
}

function DescriptionText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]*\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ProductPageBySku() {
  const params = useParams();
  const router = useRouter();
  const sku = (params?.sku as string) ?? "";
  const { isWholesaler } = useAuth();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [metalRates, setMetalRates] = useState<MetalRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isSpecificationOpen, setIsSpecificationOpen] = useState(false);
  const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountReason, setDiscountReason] = useState('');

  // Customization fields
  const [selectedMetalColor, setSelectedMetalColor] = useState<string>("");
  const [selectedSizeLength, setSelectedSizeLength] = useState<string>("");

  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product?.sku ?? ""));

  useEffect(() => {
    if (!sku) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [productRes, metalRes, settingsRes] = await Promise.all([
          api.products.getBySku(sku),
          api.metalRates.getAll(true) as Promise<{ success?: boolean; data?: MetalRateData[] }>,
          api.siteSettings.get(),
        ]);
        if (cancelled) return;
        if (productRes.success && productRes.data) {
          setProduct(productRes.data as ApiProduct);
        } else {
          setNotFound(true);
        }
        if (metalRes.success && Array.isArray(metalRes.data)) {
          setMetalRates(metalRes.data);
        }
        if (settingsRes && !settingsRes.error) {
          setDiscountPercentage(settingsRes.discountPercentage ?? 0);
          setDiscountReason(settingsRes.discountReason ?? '');
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sku]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading product…</div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-semibold text-gray-800">Product not found</h1>
        <Link href="/" className="text-gray-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const displayPrice = getDisplayPrice(
    {
      price: product.price,
      useDynamicPricing: product.useDynamicPricing ?? false,
      weightInGrams: product.weightInGrams,
      metalType: product.metalType,
      makingChargesPercentage: product.makingChargesPercentage,
      hasStone: product.hasStone,
      stoneName: product.stoneName,
      stoneWeight: product.stoneWeight,
      stoneValue: product.stoneValue,
    },
    metalRates
  );
  const rawPrice = displayPrice ?? product.price ?? 0;
  const discountAmt = discountPercentage > 0 ? Math.round(rawPrice * discountPercentage / 100 * 100) / 100 : 0;
  const priceToShow = Math.round((rawPrice - discountAmt) * 100) / 100;
  const compareAt = product.compareAtPrice ?? undefined;
  const savings = calculateDiscount(priceToShow, compareAt);
  const currentPriceStr = formatPrice(priceToShow);
  const mrpStr = compareAt != null ? formatPrice(compareAt) : (discountPercentage > 0 ? formatPrice(rawPrice) : null);

  const showWholesalerView =
    isWholesaler && (product.metalType != null || product.weightInGrams != null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1)
    );
  };

  const goToImage = (index: number) => setCurrentImageIndex(index);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleAddToCart = () => {
    // Generate an ID that includes customizations to treat different options as separate items
    const baseSku = product.sku ?? product._id;
    const customKey = `${selectedMetalColor || 'default'}-${selectedSizeLength || 'default'}`;
    const cartItemId = `${baseSku}-${customKey}`;

    if (showWholesalerView && product.weightInGrams != null && product.metalType) {
      addItem({
        id: cartItemId,
        title: product.name,
        image: product.images?.[0] ?? "",
        price: 0,
        mrp: 0,
        sku: baseSku,
        weightInGrams: product.weightInGrams,
        metalType: product.metalType,
        wastagePercentage: product.wastagePercentage,
        makingChargesPercentage: product.makingChargesPercentage,
        hasStone: product.hasStone,
        stoneName: product.stoneName,
        stoneWeight: product.stoneWeight,
        stoneValue: product.stoneValue,
        selectedMetalColor: selectedMetalColor || undefined,
        selectedSizeLength: selectedSizeLength || undefined,
      });
    } else {
      addItem({
        id: cartItemId,
        title: product.name,
        image: product.images?.[0] ?? "",
        price: priceToShow,
        mrp: compareAt ?? priceToShow,
        sku: baseSku,
        selectedMetalColor: selectedMetalColor || undefined,
        selectedSizeLength: selectedSizeLength || undefined,
      });
    }
  };

  const handleBuyNow = () => {
    clearCart();
    handleAddToCart();
    router.push("/cart");
  };

  const specifications: Record<string, string> = { ...(product.metadata as Record<string, string>) };
  if (product.sizeLength) specifications["Size / Length"] = product.sizeLength;
  if (product.weightInGrams != null) specifications["Weight"] = `${product.weightInGrams}g`;
  if (product.metalType) specifications["Purity"] = product.metalType;

  const images = product.images?.length ? product.images : ["/placeholder-product.png"];

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square bg-[#f8f5ef] rounded-lg overflow-hidden">
              {/* Main Product Image */}
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? "bg-black" : "bg-white/60 border border-white/80"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setIsShareOpen(true)}
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-md transition-all"
                aria-label="Share product"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-black">{product.name}</h1>
            </div>

            <div className="space-y-2">
              {showWholesalerView ? (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    {product.metalType && (
                      <span className="text-lg font-semibold text-black">Purity: {product.metalType}</span>
                    )}
                    {product.weightInGrams != null && (
                      <span className="text-lg font-semibold text-black">{product.weightInGrams}g</span>
                    )}
                    {product.wastagePercentage != null && (
                      <span className="text-lg font-semibold text-black">Wastage: {product.wastagePercentage}%</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 italic">Price calculated at checkout</p>
                  {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    {mrpStr && (
                      <span className="text-sm text-gray-500 line-through">{mrpStr}</span>
                    )}
                    <span className="text-2xl md:text-3xl font-bold text-black">{currentPriceStr}</span>
                    {savings && (
                      <span className="px-2 py-1 bg-black text-white text-xs font-semibold uppercase">
                        SAVE {savings}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Inclusive of all taxes</p>
                  {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                </>
              )}
            </div>

            {product.sizeLength && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Size / Length:</span> {product.sizeLength}
              </p>
            )}

            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium text-black">In stock – ready to ship</span>
            </div>

            {/* Customizations Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label htmlFor="metal-color" className="block text-sm font-medium text-gray-700">
                  Select Metal Color
                </label>
                <select
                  id="metal-color"
                  value={selectedMetalColor}
                  onChange={(e) => setSelectedMetalColor(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md border"
                >
                  <option value="">Choose a color...</option>
                  <option value="Yellow Gold">Yellow Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="size-length" className="block text-sm font-medium text-gray-700">
                  Size / Length
                </label>
                <input
                  type="text"
                  id="size-length"
                  value={selectedSizeLength}
                  onChange={(e) => setSelectedSizeLength(e.target.value)}
                  placeholder="e.g. 7 inches, 18 cm, Size 6"
                  className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 transition-colors"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={() => {
                    const productSku = product.sku ?? product._id;
                    if (isWishlisted) {
                      removeFromWishlist(productSku);
                    } else {
                      addToWishlist({
                        id: productSku,
                        title: product.name,
                        image: product.images?.[0] ?? "",
                        price: priceToShow,
                        mrp: compareAt ?? priceToShow,
                        sku: productSku,
                        slug: productSku,
                      });
                    }
                  }}
                  className={`w-14 h-14 border-2 flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 transition-colors"
              >
                BUY IT NOW
              </button>
            </div>

            {/* Weight disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs text-amber-800">
                Weight may slightly change after final product manufacturing. Final invoice value may vary accordingly.
              </p>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-black">Description</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isDescriptionOpen ? "rotate-45" : ""}`}>
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
              {isDescriptionOpen && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-700">
                  {product.description ? (
                    <DescriptionText text={product.description} />
                  ) : (
                    "No description available."
                  )}
                </div>
              )}

              <button
                onClick={() => setIsSpecificationOpen(!isSpecificationOpen)}
                className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-black">Specification</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isSpecificationOpen ? "rotate-45" : ""}`}>
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
              {isSpecificationOpen && (
                <div className="px-4 py-3 bg-gray-50">
                  <dl className="space-y-2 text-sm">
                    {Object.keys(specifications).length > 0 ? (
                      Object.entries(specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-gray-600 font-medium">{key}:</dt>
                          <dd className="text-gray-900">{String(value)}</dd>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No specifications available.</p>
                    )}
                  </dl>
                </div>
              )}
              {product.useDynamicPricing && product.weightInGrams != null && product.metalType && metalRates.length > 0 && (
                <>
                  <button
                    onClick={() => setIsPriceBreakupOpen(!isPriceBreakupOpen)}
                    className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <span className="font-medium text-black">Price Breakup</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isPriceBreakupOpen ? "rotate-180" : ""}`}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {isPriceBreakupOpen && (() => {
                    const rate = metalRates.find(r => r.metalType === product.metalType);
                    if (!rate) return null;
                    const breakdown = calculatePrice(product.weightInGrams, rate, product.makingChargesPercentage, {
                      hasStone: product.hasStone,
                      stoneName: product.stoneName,
                      stoneWeight: product.stoneWeight,
                      stoneValue: product.stoneValue
                    });
                    const breakdownDiscountAmt = discountPercentage > 0
                      ? Math.round(breakdown.subtotal * discountPercentage / 100 * 100) / 100
                      : 0;
                    const discountedSubtotal = breakdown.subtotal - breakdownDiscountAmt;
                    const discountedGst = Math.round(discountedSubtotal * rate.gstPercentage / 100 * 100) / 100;
                    const grandTotal = Math.round((discountedSubtotal + discountedGst) * 100) / 100;
                    const ratePerGram = rate.ratePerTenGrams / 10;
                    const makingPercent = product.makingChargesPercentage ?? rate.makingChargesPercentage;

                    return (
                      <div className="bg-gray-50 border-x border-b border-gray-200">
                        {/* Gold Section */}
                        <div className="px-5 pt-5 pb-4">
                          <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                            {product.metalType}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-base sm:text-lg font-bold text-black">{formatPrice(ratePerGram)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Rate / g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-base sm:text-lg font-bold text-black">{product.weightInGrams} g</p>
                              <p className="text-xs text-gray-500 mt-0.5">Weight</p>
                            </div>
                            <div className="text-right">
                              <p className="text-base sm:text-lg font-bold text-black">{formatPrice(breakdown.goldCost)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Final Value</p>
                            </div>
                          </div>
                        </div>

                        {/* Stone Section */}
                        {product.hasStone && breakdown.stoneCharges > 0 && (
                          <div className="px-5 pt-4 pb-4 border-t border-gray-200">
                            <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                              {breakdown.stoneName || 'Stone'}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <p className="text-base sm:text-lg font-bold text-black">{product.stoneWeight} ct</p>
                                <p className="text-xs text-gray-500 mt-0.5">Weight</p>
                              </div>
                              <div className="text-center">
                                <p className="text-base sm:text-lg font-bold text-black">{formatPrice(product.stoneValue ?? 0)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Rate / ct</p>
                              </div>
                              <div className="text-right">
                                <p className="text-base sm:text-lg font-bold text-black">{formatPrice(breakdown.stoneCharges)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Final Value</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary Rows */}
                        <div className="border-t border-gray-200">
                          <div className="flex justify-between items-center px-5 py-3 text-sm">
                            <span className="text-gray-700 font-medium">Making Charges ({makingPercent}%)</span>
                            <span className="font-bold text-black">{formatPrice(breakdown.makingCharges)}</span>
                          </div>

                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100 text-sm">
                              <span className="text-green-600 font-medium">{discountReason ? `${discountReason} Discount` : 'Discount'} ({discountPercentage}%)</span>
                              <span className="font-bold text-green-600">- {formatPrice(breakdownDiscountAmt)}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100 text-sm">
                            <span className="text-gray-700 font-medium">GST ({rate.gstPercentage}%)</span>
                            <span className="font-bold text-black">{formatPrice(discountedGst)}</span>
                          </div>

                          <div className="flex justify-between items-center px-5 py-3.5 border-t-2 border-gray-300 bg-gray-100">
                            <span className="text-black font-bold text-base">Grand Total</span>
                            <span className="text-black font-bold text-lg">{formatPrice(grandTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share dialog */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setIsShareOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="share-dialog-title" className="text-lg font-semibold text-black mb-2">
              Share this product
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Copy the link below and share it with friends and family.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-gray-50"
              />
              <button
                onClick={handleCopyShareUrl}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm rounded whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setIsShareOpen(false)}
              className="w-full py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

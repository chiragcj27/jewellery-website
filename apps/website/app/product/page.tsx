"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/context/AuthProvider";
import ProductCard from "@/components/product-card";

// Sample product data - replace with actual data from props/API
const product = {
  title: "Hearts All Over Bracelet",
    rating: 5,
    reviewCount: 1930,
    mrp: "₹3,184",
    currentPrice: "₹2,229",
    savings: "30%",
    sku: "PM-BRACELETS-035",
    metalType: "22KT",
    weightInGrams: 5.2,
    wastagePercentage: 8,
    images: [
      "https://palmonas.com/cdn/shop/files/preview_images/f99b0ab216d343f78d7fdf847c694775.thumbnail.0000000000.jpg?v=1754386713&width=1600",
      "https://palmonas.com/cdn/shop/files/PM-BRACELETS-035_2_0040.jpg?v=1744528665",
      "https://palmonas.com/cdn/shop/files/PM-BRACELETS-035_3_0040.jpg?v=1744528665",
      "https://palmonas.com/cdn/shop/files/PM-BRACELETS-035_4_0040.jpg?v=1744528665",
    ],
    offers: [
      "Buy 3 at 3003 Use Code : MEGA3 at checkout.",
      "Buy 4 at 3996 Use Code : MEGA4 at checkout.",
      "Buy 1 Get 1 Free Use Code : LOVE at checkout.",
    ],
    inStock: true,
    description: "This beautiful Hearts All Over Bracelet features intricate heart designs throughout, crafted with precision and elegance. Perfect for everyday wear or special occasions.",
    specifications: {
      "Material": "Gold Plated",
      "Weight": "15g",
      "Length": "7.5 inches",
      "Closure": "Lobster Clasp",
      "Care": "Clean with soft cloth",
    },
  };

const RELATED_PRODUCTS = [
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Crystal Love Bangle Bracelet",
    currentPrice: "₹2,659",
    originalPrice: "₹3,799",
    discountLabel: "30%",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Diamond Affair Bracelet",
    currentPrice: "₹2,553",
    originalPrice: "₹3,647",
    discountLabel: "30%",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Charm Love Bracelet",
    currentPrice: "₹2,499",
    originalPrice: "₹3,399",
    discountLabel: "27%",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWCHBR046-G-5_0040.jpg?v=1744520085",
    title: "Evil Eye Protection Bracelet",
    currentPrice: "₹2,199",
    originalPrice: "₹2,999",
    discountLabel: "27%",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWCHBR047-G-5_0040.jpg?v=1744520085",
    title: "Butterfly Dreams Bracelet",
    currentPrice: "₹2,799",
    originalPrice: "₹3,699",
    discountLabel: "24%",
    offerTag: "Buy 1 Get 1",
  },
];

export default function ProductPage() {
  const { isWholesaler } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isSpecificationOpen, setIsSpecificationOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) =>
    state.isInWishlist(product.sku)
  );
  const showWholesalerView = isWholesaler && (product.metalType != null || product.weightInGrams != null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Helper function to parse price string to number
  const parsePrice = (priceString: string): number => {
    return parseInt(priceString.replace(/[₹,]/g, ""), 10);
  };

  const handleAddToCart = () => {
    if (showWholesalerView && product.weightInGrams != null && product.metalType) {
      addItem({
        id: product.sku,
        title: product.title,
        image: product.images[0],
        price: 0,
        mrp: 0,
        sku: product.sku,
        weightInGrams: product.weightInGrams,
        metalType: product.metalType,
        wastagePercentage: (product as { wastagePercentage?: number }).wastagePercentage,
      });
    } else {
      addItem({
        id: product.sku,
        title: product.title,
        image: product.images[0],
        price: parsePrice(product.currentPrice),
        mrp: parsePrice(product.mrp),
        sku: product.sku,
      });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square bg-[#f8f5ef] rounded-lg overflow-hidden">
              {/* Buy 1 Get 1 Tag */}
              <div className="absolute left-0 top-0 z-10 px-3 py-1.5 bg-gray-200/90 text-xs font-medium text-black uppercase tracking-wide">
                Buy 1 Get 1
              </div>

              {/* Main Product Image */}
              <Image
                src={product.images[currentImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                aria-label="Previous image"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                aria-label="Next image"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-black"
                        : "bg-white/60 border border-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Share Button */}
              <button
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-md transition-all"
                aria-label="Share product"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col gap-6">
            {/* Title and Rating */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-black">{product.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-400"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviewCount.toLocaleString()})</span>
              </div>
            </div>

            {/* Pricing Information (retail) or Purity/Wastage (wholesaler) */}
            <div className="space-y-2">
              {showWholesalerView ? (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    {(product as { metalType?: string }).metalType && (
                      <span className="text-lg font-semibold text-black">
                        Purity: {(product as { metalType: string }).metalType}
                      </span>
                    )}
                    {(product as { weightInGrams?: number }).weightInGrams != null && (
                      <span className="text-lg font-semibold text-black">
                        {(product as { weightInGrams: number }).weightInGrams}g
                      </span>
                    )}
                    {(product as { wastagePercentage?: number }).wastagePercentage != null && (
                      <span className="text-lg font-semibold text-black">
                        Wastage: {(product as { wastagePercentage: number }).wastagePercentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 italic">Price calculated at checkout</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-500 line-through">{product.mrp}</span>
                    <span className="text-2xl md:text-3xl font-bold text-black">{product.currentPrice}</span>
                    <span className="px-2 py-1 bg-black text-white text-xs font-semibold uppercase">
                      SAVE {product.savings}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Inclusive of all taxes</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </>
              )}
            </div>

            {/* Offers Section */}
            <div className="space-y-3">
              {product.offers.map((offer, index) => (
                <div key={index} className="flex items-start gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-600 mt-0.5 shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-sm text-green-700">{offer}</p>
                </div>
              ))}
              <p className="text-sm text-black mt-2">
                <span className="font-semibold">Note:</span> You need to add minimum 2 products to avail this discount.
              </p>
              <button className="text-sm text-blue-600 hover:underline">
                See All Offers
              </button>
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium text-black">
                In stock - ready to ship
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  ADD TO CART
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (isWishlisted) {
                      removeFromWishlist(product.sku);
                    } else {
                      addToWishlist({
                        id: product.sku,
                        title: product.title,
                        image: product.images[0],
                        price: parsePrice(product.currentPrice),
                        mrp: parsePrice(product.mrp),
                        sku: product.sku,
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
              <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 transition-colors">
                BUY IT NOW
              </button>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {/* Description */}
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-black">Description</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${isDescriptionOpen ? "rotate-45" : ""}`}
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
              {isDescriptionOpen && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-700">
                  {product.description}
                </div>
              )}

              {/* Specification */}
              <button
                onClick={() => setIsSpecificationOpen(!isSpecificationOpen)}
                className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-black">Specification</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${isSpecificationOpen ? "rotate-45" : ""}`}
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
              {isSpecificationOpen && (
                <div className="px-4 py-3 bg-gray-50">
                  <dl className="space-y-2 text-sm">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 font-medium">{key}:</dt>
                        <dd className="text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16 pt-12 border-t border-gray-200" aria-label="Related products">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
            You May Also Like
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:gap-6">
            {RELATED_PRODUCTS.map((item) => (
              <Link
                key={item.title}
                href="/product"
                className="shrink-0 min-w-[220px] md:min-w-0 block"
              >
                <ProductCard
                  image={item.image}
                  title={item.title}
                  currentPrice={item.currentPrice}
                  originalPrice={item.originalPrice}
                  discountLabel={item.discountLabel}
                  offerTag={item.offerTag}
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export interface ProductCardProps {
  image: string;
  title: string;
  currentPrice: string;
  originalPrice?: string;
  discountLabel?: string;
  offerTag?: string;
  metalType?: string;
  weightInGrams?: number;
  wastagePercentage?: number;

  productId?: string;
  sku?: string;
  sizeLength?: string;
  /** Numeric price for cart/wishlist (required for Add to Bag) */
  price?: number;
  /** Numeric MRP/compare-at price for cart/wishlist */
  mrp?: number;
  /** Product slug for wishlist link (e.g. from /product/[slug]) */
  slug?: string;
}

export default function ProductCard({
  image,
  title,
  currentPrice,
  originalPrice,
  discountLabel,
  offerTag,
  metalType,
  weightInGrams,
  wastagePercentage,
  productId,
  sku,
  sizeLength,
  price,
  mrp,
  slug,
}: ProductCardProps) {
  const { isWholesaler } = useAuth();
  const addToCart = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(sku ?? ""));

  const showWholesalerView = isWholesaler && (metalType != null || weightInGrams != null || wastagePercentage != null);

  const itemId = sku ?? productId ?? "";
  const canAddToCart = itemId && (price != null || showWholesalerView);
  const productHref = sku ? `/product/${encodeURIComponent(sku)}` : productId || undefined;

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddToCart) return;
    if (showWholesalerView && weightInGrams != null && metalType) {
      addToCart({
        id: itemId,
        title,
        image,
        price: 0,
        mrp: 0,
        sku: sku ?? itemId,
        weightInGrams,
        metalType,
        wastagePercentage,
      });
    } else if (price != null) {
      addToCart({
        id: itemId,
        title,
        image,
        price,
        mrp: mrp ?? price,
        sku: sku ?? itemId,
      });
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!itemId || price == null) return;
    if (isWishlisted) {
      removeFromWishlist(itemId);
    } else {
      addToWishlist({
        id: itemId,
        title,
        image,
        price,
        mrp: mrp ?? price,
        sku: sku ?? itemId,
        slug,
      });
    }
  };

  const cardContent = (
    <>
      <div className="relative aspect-4/5 bg-[#f8f5ef]">
        {/* Offer tag */}
        {offerTag && (
          <div className="absolute left-0 top-0 z-10 px-2 py-0.5 sm:px-3 sm:py-1 bg-black/80 text-[10px] sm:text-xs font-medium text-white uppercase tracking-wide">
            {offerTag}
          </div>
        )}

        {/* Product image */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 20vw"
        />

        {/* Bottom controls overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 bg-linear-to-t from-white via-white/95 to-transparent">
          {/* Wishlist button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            disabled={!itemId || price == null}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-black"
              }`}
              aria-hidden="true"
            >
              <path
                d="M19 4.5c-1.5-1.4-3.9-1.4-5.4 0L12 6.1l-1.6-1.6c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 4 0 5.5l1.6 1.6L12 19l5.4-4.9 1.6-1.6c1.6-1.5 1.6-4 0-5.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>

          {/* Add to bag button */}
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={!canAddToCart}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-wide uppercase bg-[#f5f0e6] text-gray-900 border border-gray-300 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Bag
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-3 sm:pb-4 space-y-1 bg-white">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 min-h-10">
          {title}
        </h3>
        {/* Wholesaler: show purity (metalType) and wastage instead of price */}
        {showWholesalerView ? (
          <div className="text-xs text-gray-700 space-y-0.5">
            {metalType && <div>Purity: {metalType}</div>}
            {(weightInGrams != null || wastagePercentage != null) && (
              <div>
                {weightInGrams != null && <span>{weightInGrams}g</span>}
                {weightInGrams != null && wastagePercentage != null && " • "}
                {wastagePercentage != null && <span>Wastage: {wastagePercentage}%</span>}
              </div>
            )}
            <div className="text-gray-500 italic">Price at checkout</div>
          </div>
        ) : (
          <>
            {/* Metal type and weight info (retail) */}
            {metalType && weightInGrams && (
              <div className="text-[10px] sm:text-xs text-gray-500">
                {metalType} • {weightInGrams}g
              </div>
            )}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-semibold text-gray-900">{currentPrice}</span>
                {originalPrice && (
                  <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                    {originalPrice}
                  </span>
                )}
                {discountLabel && (
                  <span className="text-[10px] sm:text-xs font-semibold text-green-600">
                    {discountLabel}
                  </span>
                )}
              </div>
              {sizeLength && (
                <span className="font-bold text-gray-900 shrink-0 ml-1">{sizeLength}</span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <article className="flex flex-col bg-white rounded-none overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 min-w-[160px] sm:min-w-[200px] md:min-w-[220px]">
      {productHref ? (
        <Link href={productHref} className="flex flex-col flex-1 min-h-0">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </article>
  );
}


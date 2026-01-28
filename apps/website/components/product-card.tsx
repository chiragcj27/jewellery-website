"use client";

import Image from "next/image";
import { useState } from "react";

export interface ProductCardProps {
  image: string;
  title: string;
  currentPrice: string;
  originalPrice: string;
  discountLabel: string;
  offerTag?: string;
}

export default function ProductCard({
  image,
  title,
  currentPrice,
  originalPrice,
  discountLabel,
  offerTag = "Buy 1 Get 1",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <article className="flex flex-col bg-white rounded-none overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 min-w-[220px]">
      <div className="relative aspect-4/5 bg-[#f8f5ef]">
        {/* Offer tag */}
        <div className="absolute left-0 top-0 z-10 px-3 py-1 bg-black/80 text-xs font-medium text-white uppercase tracking-wide">
          {offerTag}
        </div>

        {/* Product image */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 20vw"
        />

        {/* Bottom controls overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-3 bg-linear-to-t from-white via-white/95 to-transparent">
          {/* Wishlist button */}
          <button
            type="button"
            onClick={() => setIsWishlisted((v) => !v)}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 ${
                isWishlisted ? "fill-black text-black" : "text-black"
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
            className="px-4 py-2 text-xs font-semibold tracking-wide uppercase bg-[#f5f0e6] text-gray-900 border border-gray-300 hover:bg-black hover:text-white transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-3 pt-3 pb-4 space-y-1 bg-white">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-10">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-900">{currentPrice}</span>
          <span className="text-xs text-gray-500 line-through">
            {originalPrice}
          </span>
          <span className="text-xs font-semibold text-green-600">
            {discountLabel}
          </span>
        </div>
      </div>
    </article>
  );
}


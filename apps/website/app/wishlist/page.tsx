"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import type { WishlistItem } from "@/store/wishlistStore";

export default function WishlistPage() {
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addToCart = useCartStore((state) => state.addItem);

  const wishlistItems = useSyncExternalStore<WishlistItem[]>(
    (onStoreChange) => useWishlistStore.subscribe(onStoreChange),
    () => useWishlistStore.getState().items,
    () => []
  );

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handleMoveToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      mrp: item.mrp,
      sku: item.sku,
    });
    removeItem(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-linear-to-b from-[#faf8f5] via-[#f5f0e6] to-[#ebe6df] relative overflow-hidden">
        {/* Subtle decorative pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 8-12 12-18 8s-4-14 4-16 14 2 14 8z' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-md mx-auto text-center">
            {/* Elegant heart icon */}
            <div className="mb-10">
              <svg
                width="140"
                height="140"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                className="mx-auto text-gray-300"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 belleza-regular tracking-tight">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              Save your favourite pieces here. When you find something you love,
              click the heart to add it to your wishlist.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 transition-all duration-300"
            >
              Discover jewellery
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf8f5] via-[#f5f0e6] to-[#ebe6df]">
      {/* Subtle top border accent */}
      <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl md:text-6xl font-bold text-black belleza-regular tracking-tight">
              My Wishlist
            </h1>
            <span className="text-lg text-gray-500">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "piece" : "pieces"}
            </span>
          </div>
          <p className="text-gray-600">
            Items you've saved for later. Move them to cart when you're ready.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {wishlistItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Image container */}
              <Link
                href={item.slug ? `/product/${item.slug}` : "/product"}
                className="block relative aspect-4/5 bg-[#f8f5ef] overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </Link>

              {/* Details */}
              <div className="p-5 flex flex-col">
                <Link
                  href={item.slug ? `/product/${item.slug}` : "/product"}
                  className="mb-2"
                >
                  <h3 className="text-lg font-semibold text-black group-hover:text-gray-700 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mb-3">SKU: {item.sku}</p>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(item.mrp)}
                  </span>
                  <span className="text-xl font-bold text-black">
                    {formatPrice(item.price)}
                  </span>
                  {item.mrp > item.price && (
                    <span className="text-xs font-medium text-green-700">
                      Save {formatPrice(item.mrp - item.price)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 text-white text-sm font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to cart
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-3 border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors"
                    aria-label="Remove from wishlist"
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
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Continue shopping */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

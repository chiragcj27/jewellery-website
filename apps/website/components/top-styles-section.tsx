"use client";

import { useMemo, useState } from "react";
import ProductCard from "./product-card";

type CategoryFilter =
  | "ALL"
  | "NECKLACES"
  | "BRACELETS"
  | "EARRINGS"
  | "RINGS"
  | "MENS"
  | "MANGALSUTRA";

type ProductCategory =
  | "NECKLACES"
  | "BRACELETS"
  | "EARRINGS"
  | "RINGS"
  | "MENS"
  | "MANGALSUTRA";

interface Product {
  id: string;
  title: string;
  image: string;
  currentPrice: string;
  originalPrice: string;
  discountLabel: string;
  category: ProductCategory;
}

const FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Necklaces", value: "NECKLACES" },
  { label: "Bracelets", value: "BRACELETS" },
  { label: "Earrings", value: "EARRINGS" },
  { label: "Rings", value: "RINGS" },
  { label: "Mens", value: "MENS" },
  { label: "Mangalsutra", value: "MANGALSUTRA" },
];

const PRODUCTS: Product[] = [
  {
    id: "hearts-all-over-bracelet",
    title: "Hearts All Over Bracelet",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 2,229.00",
    originalPrice: "₹ 3,184.00",
    discountLabel: "30% OFF",
    category: "BRACELETS",
  },
  {
    id: "crystal-love-bangle",
    title: "Crystal Love Bangle Bracelet",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 2,659.00",
    originalPrice: "₹ 3,799.00",
    discountLabel: "30% OFF",
    category: "BRACELETS",
  },
  {
    id: "athena-solitaire-hoops",
    title: "Athena Solitaire Hoop Earrings",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 2,258.00",
    originalPrice: "₹ 3,226.00",
    discountLabel: "30% OFF",
    category: "EARRINGS",
  },
  {
    id: "diamond-affair-bracelet",
    title: "Diamond Affair Bracelet",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 2,553.00",
    originalPrice: "₹ 3,647.00",
    discountLabel: "30% OFF",
    category: "BRACELETS",
  },
  {
    id: "celestial-diamond-necklace",
    title: "Celestial Diamond Necklace",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 4,899.00",
    originalPrice: "₹ 6,999.00",
    discountLabel: "30% OFF",
    category: "NECKLACES",
  },
  {
    id: "aurora-solitaire-ring",
    title: "Aurora Solitaire Ring",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 3,299.00",
    originalPrice: "₹ 4,714.00",
    discountLabel: "30% OFF",
    category: "RINGS",
  },
  {
    id: "mens-classic-chain",
    title: "Mens Classic Gold Chain",
    image:
      "https://images.unsplash.com/photo-1600186491678-8b293fd7f99c?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 5,799.00",
    originalPrice: "₹ 8,285.00",
    discountLabel: "30% OFF",
    category: "MENS",
  },
  {
    id: "heritage-mangalsutra",
    title: "Heritage Diamond Mangalsutra",
    image:
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80&auto=format&fit=crop",
    currentPrice: "₹ 6,249.00",
    originalPrice: "₹ 8,927.00",
    discountLabel: "30% OFF",
    category: "MANGALSUTRA",
  },
];

export default function TopStylesSection() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("ALL");

  const visibleProducts = useMemo(() => {
    if (activeFilter === "ALL") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <section className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Filter buttons row */}
          <div className="flex flex-wrap gap-3 justify-center">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeFilter;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold tracking-wide uppercase border transition-colors ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:bg-black hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Products row – scrollable on mobile, 4 cards like reference on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible">
            {visibleProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="shrink-0 sm:shrink min-w-[230px]">
                <ProductCard
                  image={product.image}
                  title={product.title}
                  currentPrice={product.currentPrice}
                  originalPrice={product.originalPrice}
                  discountLabel={product.discountLabel}
                />
              </div>
            ))}
          </div>

          {/* View all button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="px-8 py-2 border border-gray-900 text-xs sm:text-sm font-semibold uppercase tracking-wide bg-white text-gray-900 hover:bg-black hover:text-white transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


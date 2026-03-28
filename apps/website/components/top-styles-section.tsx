"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "./product-card";
import { api } from "@/lib/api";
import { getDisplayPrice } from "@/lib/priceCalculator";
import type { MetalRateData } from "@/lib/priceCalculator";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface SubcategoryItem {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder?: number;
}

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  isActive: boolean;
  useDynamicPricing?: boolean;
  weightInGrams?: number;
  metalType?: string;
  wastagePercentage?: number;
  makingChargesPercentage?: number;
  sizeLength?: string;
}

interface UiProduct {
  id: string;
  title: string;
  image: string;
  currentPrice: string;
  originalPrice?: string;
  discountLabel?: string;
  productHref?: string;
  sku?: string;
  metalType?: string;
  weightInGrams?: number;
  wastagePercentage?: number;
  makingChargesPercentage?: number;
  sizeLength?: string;
  price?: number;
  mrp?: number;
  slug?: string;
}

function formatPrice(price: number | undefined | null): string {
  if (price == null || typeof price !== "number") return "₹0.00";
  return `₹${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function discountLabel(price: number, compareAtPrice?: number): string | undefined {
  if (!compareAtPrice || compareAtPrice <= price) return undefined;
  const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `(${discount}%)`;
}

function ProductCardSkeleton() {
  return (
    <div className="shrink-0 sm:shrink min-w-[160px] sm:min-w-[200px] md:min-w-[230px]">
      <div className="flex flex-col bg-white border border-gray-200 shadow-sm min-w-[160px] sm:min-w-[200px] md:min-w-[220px] animate-pulse">
        <div className="relative aspect-4/5 bg-gray-200" />
        <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-3 sm:pb-4 space-y-2">
          <div className="h-4 bg-gray-200 w-5/6" />
          <div className="h-4 bg-gray-200 w-2/3" />
        </div>
      </div>
    </div>
  );
}

interface TopStylesSectionProps {
  categories?: CategoryItem[];
}

export default function TopStylesSection({ categories = [] }: TopStylesSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("ALL");
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [metalRates, setMetalRates] = useState<MetalRateData[]>([]);

  const activeCategory = useMemo(() => {
    if (activeCategoryId === "ALL") return null;
    return categories.find((c) => c._id === activeCategoryId) ?? categories[0] ?? null;
  }, [activeCategoryId, categories]);

  // Fetch metal rates for dynamic pricing (optional, safe)
  useEffect(() => {
    const fetchMetalRates = async () => {
      try {
        const res = (await api.metalRates.getAll(true)) as {
          success?: boolean;
          data?: MetalRateData[];
        };
        if (res.success && Array.isArray(res.data)) setMetalRates(res.data);
      } catch {
        // ignore; we'll fall back to fixed price
      }
    };
    fetchMetalRates();
  }, []);

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Fetch: for ALL -> 4 random categories, 1 random product each
  // Fetch: for category -> 1 product per subcategory (up to 4)
  useEffect(() => {
    let cancelled = false;

    const fetchTopStyles = async () => {
      setLoadingProducts(true);
      setProducts([]);

      try {
        // ALL: 4 random categories, 1 random product from each category
        if (activeCategoryId === "ALL") {
          const chosenCats = shuffle(categories).slice(0, 4);

          const picked = (
            await Promise.all(
              chosenCats.map(async (cat) => {
                try {
                  const pRes = (await api.products.getAll(cat._id)) as {
                    success?: boolean;
                    data?: ApiProduct[];
                  };
                  const list = (pRes.success && Array.isArray(pRes.data) ? pRes.data : []).filter(
                    (p) => p.isActive
                  );
                  if (list.length === 0) return null;
                  return list[Math.floor(Math.random() * list.length)];
                } catch {
                  return null;
                }
              })
            )
          ).filter(Boolean) as ApiProduct[];

          const ui: UiProduct[] = picked.slice(0, 4).map((p) => {
            const displayPrice =
              getDisplayPrice(
                {
                  price: p.price,
                  useDynamicPricing: p.useDynamicPricing ?? false,
                  weightInGrams: p.weightInGrams,
                  metalType: p.metalType,
                  makingChargesPercentage: p.makingChargesPercentage,
                },
                metalRates
              ) ?? p.price;

            return {
              id: p._id,
              title: p.name,
              image: p.images?.[0] || "",
              currentPrice: formatPrice(displayPrice),
              originalPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
              discountLabel: discountLabel(displayPrice, p.compareAtPrice),
              productHref: `/product/${encodeURIComponent(p.sku ?? p.slug)}`,
              sku: p.sku,
              metalType: p.metalType,
              weightInGrams: p.weightInGrams,
              wastagePercentage: p.wastagePercentage,
              makingChargesPercentage: p.makingChargesPercentage,
              sizeLength: p.sizeLength,
              price: displayPrice,
              mrp: p.compareAtPrice,
              slug: p.slug,
            };
          });

          if (!cancelled) setProducts(ui);
          return;
        }

        // Category: 1 product per subcategory (up to 4)
        if (!activeCategory?._id) return;

        const subRes = (await api.subcategories.getAll(activeCategory._id)) as {
          success?: boolean;
          data?: SubcategoryItem[];
        };

        const subcats = (subRes.success && Array.isArray(subRes.data) ? subRes.data : [])
          .filter((s) => s.isActive)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .slice(0, 4);

        const productResults = await Promise.all(
          subcats.map(async (sub) => {
            try {
              const pRes = (await api.products.getAll(activeCategory._id, sub._id)) as {
                success?: boolean;
                data?: ApiProduct[];
              };
              const list = (pRes.success && Array.isArray(pRes.data) ? pRes.data : []).filter(
                (p) => p.isActive
              );
              return list[0] ?? null;
            } catch {
              return null;
            }
          })
        );

        const picked = productResults.filter(Boolean) as ApiProduct[];

        const ui: UiProduct[] = picked.slice(0, 4).map((p) => {
          const displayPrice =
            getDisplayPrice(
              {
                price: p.price,
                useDynamicPricing: p.useDynamicPricing ?? false,
                weightInGrams: p.weightInGrams,
                metalType: p.metalType,
                makingChargesPercentage: p.makingChargesPercentage,
              },
              metalRates
            ) ?? p.price;

          return {
            id: p._id,
            title: p.name,
            image: p.images?.[0] || "",
            currentPrice: formatPrice(displayPrice),
            originalPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
            discountLabel: discountLabel(displayPrice, p.compareAtPrice),
            productHref: `/product/${encodeURIComponent(p.sku ?? p.slug)}`,
            sku: p.sku,
            metalType: p.metalType,
            weightInGrams: p.weightInGrams,
            wastagePercentage: p.wastagePercentage,
            makingChargesPercentage: p.makingChargesPercentage,
            sizeLength: p.sizeLength,
            price: displayPrice,
            mrp: p.compareAtPrice,
            slug: p.slug,
          };
        });

        if (!cancelled) setProducts(ui);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    fetchTopStyles();
    return () => {
      cancelled = true;
    };
  }, [activeCategoryId, activeCategory?._id, categories, metalRates]);

  return (
    <section className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Filter buttons row */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2">
            <button
              key="ALL"
              type="button"
              onClick={() => setActiveCategoryId("ALL")}
              className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide uppercase border transition-colors ${
                activeCategoryId === "ALL"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-900 border-gray-300 hover:bg-black hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const isActive = cat._id === activeCategoryId;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat._id)}
                  className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide uppercase border transition-colors ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:bg-black hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Products row – scrollable on mobile, 4 cards like reference on desktop */}
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible">
            {loadingProducts
              ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 sm:shrink min-w-[160px] sm:min-w-[200px] md:min-w-[230px]"
                  >
                    <ProductCard
                      image={product.image}
                      title={product.title}
                      currentPrice={product.currentPrice}
                      originalPrice={product.originalPrice}
                      discountLabel={product.discountLabel}
                      productId={product.productHref}
                      sku={product.sku}
                      metalType={product.metalType}
                      weightInGrams={product.weightInGrams}
                      wastagePercentage={product.wastagePercentage}
                      makingChargesPercentage={product.makingChargesPercentage}
                      sizeLength={product.sizeLength}
                      price={product.price}
                      mrp={product.mrp}
                      slug={product.slug}
                    />
                  </div>
                ))}
          </div>

          {/* View all button */}
          <div className="flex justify-center pt-2 sm:pt-3">
            {activeCategoryId === "ALL" ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="px-6 sm:px-8 py-1.5 sm:py-2 border border-gray-300 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                View All
              </button>
            ) : activeCategory?.slug ? (
              <Link
                href={`/category/${activeCategory.slug}`}
                className="px-6 sm:px-8 py-1.5 sm:py-2 border border-gray-900 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide bg-white text-gray-900 hover:bg-black hover:text-white transition-colors"
              >
                View All
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

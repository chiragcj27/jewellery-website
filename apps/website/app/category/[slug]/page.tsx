"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import { api } from "@/lib/api";
import { getDisplayPrice } from "@/lib/priceCalculator";
import type { MetalRateData } from "@/lib/priceCalculator";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  filters?: Array<{
    name: string;
    slug: string;
    type: 'select' | 'multiselect';
    options: string[];
  }>;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string | { _id: string; name: string; slug: string };
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  description?: string;
  sizeLength?: string;
  category: string | { _id: string; name: string; slug: string };
  subcategory: string | { _id: string; name: string; slug: string };
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  useDynamicPricing?: boolean;
  weightInGrams?: number;
  metalType?: string;
  wastagePercentage?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.slug as string;
  const subcategorySlug = searchParams.get("subcategory");

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [metalRates, setMetalRates] = useState<MetalRateData[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("Best selling");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (categorySlug) {
          // Fetch category by slug from URL params
          const categoryResult = await api.categories.getBySlug(categorySlug);
          
          if (categoryResult.success && categoryResult.data) {
            setCategory(categoryResult.data);
            
            // Fetch subcategories for this category
            const subcategoriesResult = await api.subcategories.getAll(categoryResult.data._id);
            if (subcategoriesResult.success && subcategoriesResult.data) {
              const activeSubcats = subcategoriesResult.data.filter((sub: Subcategory) => sub.isActive);
              setSubcategories(activeSubcats);
            }
          } else {
            setError("Category not found");
          }
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  // Fetch metal rates for dynamic pricing
  useEffect(() => {
    const fetchMetalRates = async () => {
      try {
        const res = await api.metalRates.getAll(true) as { success?: boolean; data?: MetalRateData[] };
        if (res.success && Array.isArray(res.data)) {
          setMetalRates(res.data);
        }
      } catch (err) {
        console.error("Error fetching metal rates:", err);
      }
    };
    fetchMetalRates();
  }, []);

  // Fetch products based on category and active subcategory
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      try {
        const productsResult = await api.products.getAll(
          category._id,
          activeSubcategory || undefined
        );

        if (productsResult.success && productsResult.data) {
          const activeProducts = productsResult.data.filter((product: Product) => product.isActive);
          setProducts(activeProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [category, activeSubcategory]);

  // Set active subcategory from URL parameter
  useEffect(() => {
    if (subcategorySlug && subcategories.length > 0) {
      const matchingSubcategory = subcategories.find(sub => sub.slug === subcategorySlug);
      if (matchingSubcategory) {
        setActiveSubcategory(matchingSubcategory._id);
      }
    }
  }, [subcategorySlug, subcategories]);

  // Resolve display price (fixed or calculated for dynamic pricing)
  const getProductPrice = (p: Product): number => {
    const displayPrice = getDisplayPrice(
      {
        price: p.price,
        useDynamicPricing: p.useDynamicPricing ?? false,
        weightInGrams: p.weightInGrams,
        metalType: p.metalType,
      },
      metalRates
    );
    return displayPrice ?? p.price ?? 0;
  };

  // Sort products based on sortBy value (use resolved price for dynamic pricing)
  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = getProductPrice(a);
    const bPrice = getProductPrice(b);
    switch (sortBy) {
      case "Price: Low to High":
        return aPrice - bPrice;
      case "Price: High to Low":
        return bPrice - aPrice;
      case "Newest":
        return 0; // Already sorted by createdAt in API
      default:
        return 0;
    }
  });

  const displaySubcategories =
    subcategories.length > 0
      ? [
          { _id: "all", name: `All ${category?.name || "Products"}`, slug: "all" },
          ...subcategories,
        ]
      : [];

  const formatPrice = (price: number | undefined | null) => {
    if (price == null || typeof price !== 'number') return '₹0.00';
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateDiscount = (price: number | undefined | null, compareAtPrice?: number | null) => {
    if (price == null || !compareAtPrice || compareAtPrice <= price) return null;
    const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    return `(${discount}%)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Category Banner */}
      <div className="relative w-full h-[300px] md:h-[600px] overflow-hidden">
        <Image
          src={category?.image || "https://palmonas.com/cdn/shop/files/Web_BAnner_1_1.jpg?v=1769252002&width=2000"}
          alt={category?.name || "Category Banner"}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      </div>

      {/* Category Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-normal text-center mb-4">
          {category?.name || "All Products"}
        </h1>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-900">{category?.name || "Category"}</span>
        </div>

        {/* Subcategory Tabs */}
        <div className="flex items-center justify-center gap-6 mb-8 overflow-x-auto pb-2">
          {displaySubcategories.map((subcategory) => (
            <button
              key={subcategory._id}
              onClick={() => setActiveSubcategory(subcategory._id === 'all' ? null : subcategory._id)}
              className={`whitespace-nowrap text-lg font-medium pb-2 border-b-2 transition-colors ${
                (activeSubcategory === subcategory._id || (!activeSubcategory && subcategory._id === 'all'))
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {subcategory.name}
            </button>
          ))}
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex items-center justify-between mb-8">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            FILTER
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-none text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option>Best selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Most Popular</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Product Grid */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((apiProduct) => {
              const displayPrice = getDisplayPrice(
                {
                  price: apiProduct.price,
                  useDynamicPricing: apiProduct.useDynamicPricing ?? false,
                  weightInGrams: apiProduct.weightInGrams,
                  metalType: apiProduct.metalType,
                },
                metalRates
              );
              const priceToShow = displayPrice ?? apiProduct.price ?? 0;
              return (
                <ProductCard
                  key={apiProduct._id}
                  image={apiProduct.images[0] || ""}
                  title={apiProduct.name}
                  currentPrice={formatPrice(priceToShow)}
                  originalPrice={
                    apiProduct.compareAtPrice
                      ? formatPrice(apiProduct.compareAtPrice)
                      : undefined
                  }
                  discountLabel={
                    calculateDiscount(priceToShow, apiProduct.compareAtPrice) ||
                    undefined
                  }
                  offerTag={undefined}
                  productId={`/product/${apiProduct.sku ?? apiProduct.slug}`}
                  sku={apiProduct.sku}
                  metalType={apiProduct.metalType}
                  weightInGrams={apiProduct.weightInGrams}
                  wastagePercentage={apiProduct.wastagePercentage}
                  sizeLength={apiProduct.sizeLength}
                  price={priceToShow}
                  mrp={apiProduct.compareAtPrice ?? undefined}
                  slug={apiProduct.slug}
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
              <div className="max-w-md text-center">
                <p className="text-2xl font-medium text-gray-800 mb-2">
                  No products in this subcategory yet
                </p>
                <p className="text-gray-500">
                  {activeSubcategory
                    ? "We don't have any items here at the moment. Try another filter or check back later."
                    : "We don't have any items in this category yet. Check back soon."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

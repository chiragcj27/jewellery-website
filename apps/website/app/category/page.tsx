"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/product-card";

// Sample product data
const SAMPLE_PRODUCTS = [
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Hearts All Over Bracelet",
    currentPrice: "₹2,229.00",
    originalPrice: "₹3,149.00",
    discountLabel: "(30%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Crystal Love Bangle Bracelet",
    currentPrice: "₹2,659.00",
    originalPrice: "₹3,799.00",
    discountLabel: "(30%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Diamond Affair Bracelet",
    currentPrice: "₹2,553.00",
    originalPrice: "₹3,647.00",
    discountLabel: "(30%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Nail Bangle Bracelet",
    currentPrice: "₹2,258.00",
    originalPrice: "₹3,226.00",
    discountLabel: "(30%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/BR9YG0019_05_Y.png?v=1765893184&width=400",
    title: "Charm Love Bracelet",
    currentPrice: "₹2,499.00",
    originalPrice: "₹3,399.00",
    discountLabel: "(27%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWCHBR046-G-5_0040.jpg?v=1744520085",
    title: "Evil Eye Protection Bracelet",
    currentPrice: "₹2,199.00",
    originalPrice: "₹2,999.00",
    discountLabel: "(27%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWCHBR047-G-5_0040.jpg?v=1744520085",
    title: "Butterfly Dreams Bracelet",
    currentPrice: "₹2,799.00",
    originalPrice: "₹3,699.00",
    discountLabel: "(24%)",
    offerTag: "Buy 1 Get 1",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWCHBR048-G-5_0040.jpg?v=1744520085",
    title: "Infinity Love Bracelet",
    currentPrice: "₹2,399.00",
    originalPrice: "₹3,199.00",
    discountLabel: "(25%)",
    offerTag: "Buy 1 Get 1",
  },
];

const SUBCATEGORIES = [
  "All Bracelets",
  "Charm Bracelets",
  "Cuff Bracelets",
  "Stone Bracelets",
  "Chain Bracelets",
  "Mangalsutra Bracelets",
  "Pearl Bracelet",
  "Baby Bracelets",
];

export default function CategoryPage() {
  const [activeTab, setActiveTab] = useState("All Bracelets");
  const [sortBy, setSortBy] = useState("Best selling");

  return (
    <>
      {/* Category Banner */}
      <div className="relative w-full h-[600px] overflow-hidden">
        <Image
          src="https://palmonas.com/cdn/shop/files/Web_BAnner_1_1.jpg?v=1769252002&width=2000"
          alt="Category Banner"
          fill
          className="object-fill"
          sizes="100vw"
          priority
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      </div>

      {/* Category Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-normal text-center mb-4">All Bracelets</h1>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-900">All Bracelets</span>
        </div>

        {/* Subcategory Tabs */}
        <div className="flex items-center justify-center gap-6 mb-8 overflow-x-auto pb-2">
          {SUBCATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`whitespace-nowrap text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === category
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {category}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SAMPLE_PRODUCTS.map((product, index) => (
            <ProductCard
              key={index}
              image={product.image}
              title={product.title}
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              discountLabel={product.discountLabel}
              offerTag={product.offerTag}
            />
          ))}
        </div>
      </div>
    </>
  );
}
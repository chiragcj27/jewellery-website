"use client";

import { useEffect, useMemo, useState } from "react";
import Banner from "@/components/banner";
import CategoryCarousel from "@/components/category-carousel";
import TopStylesSection from "@/components/top-styles-section";
import Marquee from "react-fast-marquee";
import FeaturedBanner from "@/components/featured-banner";
import ImageCaraousel from "@/components/image-caraousel";
import ProductCard from "@/components/product-card";
import ShopWithConfidence from "@/components/shop-with-confidence";
import { api } from "@/lib/api";
import { formatPrice, getDisplayPrice, type MetalRateData } from "@/lib/priceCalculator";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  cardImage?: string;
  cardImageHover?: string;
  isActive: boolean;
  displayOrder: number;
}

/** Generate a SVG data-URI placeholder with the category name as text */
function categoryPlaceholder(name: string): string {
  const encoded = encodeURIComponent(name);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533'%3E%3Crect fill='%23e5e5e5' width='400' height='533'/%3E%3Ctext fill='%23737373' font-family='sans-serif' font-size='28' font-weight='600' text-anchor='middle' dominant-baseline='middle' x='200' y='266'%3E${encoded}%3C/text%3E%3C/svg%3E`;
}

interface FeaturedProduct {
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

function discountLabel(
  price: number | null | undefined,
  compareAtPrice?: number
): string | undefined {
  if (price == null || !Number.isFinite(price)) return undefined;
  if (!compareAtPrice || compareAtPrice <= price) return undefined;
  const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `${discount}% OFF`;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [metalRates, setMetalRates] = useState<MetalRateData[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api.categories.getAll();
        if (result.success && Array.isArray(result.data)) {
          setCategories(
            result.data.filter((cat: Category) => cat.isActive)
          );
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadMetalRates = async () => {
      try {
        const res = (await api.metalRates.getAll(true)) as {
          success?: boolean;
          data?: MetalRateData[];
        };
        if (res.success && Array.isArray(res.data)) setMetalRates(res.data);
      } catch {
        /* fixed-price products still render */
      }
    };
    loadMetalRates();
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const res = (await api.products.getAll(undefined, undefined, {
          featured: true,
          limit: 16,
        })) as { success?: boolean; data?: FeaturedProduct[] };
        if (res.success && Array.isArray(res.data)) {
          setFeaturedProducts(res.data.filter((p) => p.isActive));
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    loadFeatured();
  }, []);

  const featuredProductCards = useMemo(
    () =>
      featuredProducts.map((p) => {
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
        return { p, displayPrice };
      }),
    [featuredProducts, metalRates]
  );

  // Map API categories to the shape CategoryCarousel expects
  const carouselCategories = categories.map((cat) => ({
    label: cat.name,
    image: cat.cardImage || categoryPlaceholder(cat.name),
    hoverImage: cat.cardImageHover || undefined,
    href: `/category/${cat.slug}`,
  }));

  return (
    <div>
      <Banner />
      <div className="bg-black/90 w-full h-[32px] sm:h-[36px] md:h-[40px] flex flex-row">
        <Marquee speed={100}>
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 md:px-10">Free shipping on orders over Rs 15,000</div>

        </Marquee>
      </div>
       <section>
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mt-6 sm:mt-8 md:mt-10 mb-3 sm:mb-4">
            The Swarnorra Top Styles
          </h2>
        </div>
      </section>
      <TopStylesSection categories={categories} />
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 mt-6 sm:mt-8 md:mt-10">Shop by category</h2>
      </div>
      <section
        className="w-full"
        aria-label="Shop by category"
      >
        {loadingCategories ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-500 text-sm">Loading categories...</div>
          </div>
        ) : carouselCategories.length > 0 ? (
          <CategoryCarousel categories={carouselCategories} />
        ) : (
          <div className="flex justify-center py-12">
            <div className="text-gray-400 text-sm">No categories available</div>
          </div>
        )}
      </section>
      <FeaturedBanner heading="" imageUrl="https://jewellery-website.s3.ap-south-1.amazonaws.com/assets/NEry58alFs3L4IYu.png" />
      <ImageCaraousel />
      <FeaturedBanner heading="Request your custom design" imageUrl="https://jewellery-website.s3.ap-south-1.amazonaws.com/assets/DrKF_ofE2aKQPEUi.png" />
      <section id="featured-products" className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10">Featured Products</h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-white border border-gray-200 shadow-sm animate-pulse min-w-0"
              >
                <div className="relative aspect-4/5 bg-gray-200" />
                <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-3 sm:pb-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProductCards.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-500 text-sm text-center max-w-md">
              No featured products yet. Mark products as featured in the admin catalog to show them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {featuredProductCards.map(({ p, displayPrice }) => (
              <ProductCard
                key={p._id}
                image={p.images?.[0] || ""}
                title={p.name}
                currentPrice={formatPrice(displayPrice)}
                originalPrice={
                  p.compareAtPrice != null ? formatPrice(p.compareAtPrice) : undefined
                }
                discountLabel={discountLabel(displayPrice, p.compareAtPrice)}
                offerTag="Featured"
                sku={p.sku}
                metalType={p.metalType}
                weightInGrams={p.weightInGrams}
                wastagePercentage={p.wastagePercentage}
                makingChargesPercentage={p.makingChargesPercentage}
                sizeLength={p.sizeLength}
                price={displayPrice}
                mrp={p.compareAtPrice ?? undefined}
                slug={p.slug}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[520px] lg:h-[600px] xl:h-[720px]">
          <video
            className="w-full h-full object-cover"
            src="https://www.pexels.com/download/video/9328454/"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </section>

      {/* About Us & Store Section */}
      <section id="about-us" className="w-full bg-[#f5f0e6] py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-black/40 mb-3 font-bold">
              Est. Since 4 Generations
            </p>
            <h2 className="belleza-regular text-2xl sm:text-3xl md:text-4xl tracking-wide text-black mb-4 sm:mb-6">
              About Us
            </h2>
            <div className="flex items-center justify-center mb-6">
              <span className="h-px w-12 bg-black/20" />
              <span className="mx-3 text-black/30 text-xs">✦</span>
              <span className="h-px w-12 bg-black/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-6xl mx-auto">
            {/* Story */}
            <div className="space-y-5 sm:space-y-6 flex flex-col justify-center">
              <h3 className="belleza-regular text-xl sm:text-2xl md:text-3xl tracking-wide text-black">
                The Swarnorra by Soni Ramniklal Jewellers
              </h3>
              <p className="text-sm sm:text-base text-black/75 leading-relaxed">
                TheSwarnorra by Soni Ramniklal Jewellers is built on a proud legacy of over 90 years and four generations of jewellery craftsmanship. What began as a family tradition has grown into a trusted name known for purity, quality, and timeless design.
              </p>
              <p className="text-sm sm:text-base text-black/75 leading-relaxed">
                Blending heritage artistry with modern elegance, we create fine gold and diamond jewellery that celebrates life&apos;s most meaningful moments. Every piece reflects decades of experience, careful craftsmanship, and a commitment to excellence.
              </p>
              <p className="text-sm sm:text-base text-black/70 leading-relaxed italic">
                At TheSwarnorra, we don&apos;t just craft jewellery—we create pieces of legacy that can be cherished and passed on for generations.
              </p>

              {/* Store Info */}
              <div className="mt-4 pt-6 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-full shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1">Address</p>
                    <p className="text-xs sm:text-sm text-black/70 leading-relaxed">Soni Ramniklal Jewellers, Bindal Complex, Gorelal Square, Gondia, Maharashtra, 441601</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-full shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1">Contact</p>
                    <a href="tel:+917030995738" className="text-xs sm:text-sm text-black/70 hover:text-black transition-colors">+91 7030995738</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-full shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-1">Store Hours</p>
                    <p className="text-xs sm:text-sm text-black/70">11:00 AM – 8:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-full lg:min-h-[450px] rounded-lg overflow-hidden border border-black/10 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3728.5!2d80.1929792!3d21.4586323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2baeb227dca293%3A0x6d2b0dddab57cc38!2sSONI%20RAMNIKLAL%20JEWELLERS!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Soni Ramniklal Jewellers - Store Location"
              />
            </div>
          </div>
        </div>
      </section>

      <ShopWithConfidence />
    </div>
  );
}
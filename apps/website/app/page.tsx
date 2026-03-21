"use client";

import { useEffect, useState } from "react";
import Banner from "@/components/banner";
import CategoryCarousel from "@/components/category-carousel";
import TopStylesSection from "@/components/top-styles-section";
import Marquee from "react-fast-marquee";
import FeaturedBanner from "@/components/featured-banner";
import ImageCaraousel from "@/components/image-caraousel";
import ProductCard from "@/components/product-card";
import ShopWithConfidence from "@/components/shop-with-confidence";
import { api } from "@/lib/api";

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

const SAMPLE_PRODUCTS = [
  {
    image: "https://palmonas.com/cdn/shop/files/PM-EARRINGS-037_1_0040.jpg?v=1744528665",
    title: "Textured Gold Hoop Earrings",
    currentPrice: "₹2,499",
    originalPrice: "₹3,499",
    discountLabel: "29% OFF",
    offerTag: "Best Seller",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR004-G-5_0040.jpg?v=1744515204",
    title: "Minimal Gold Stacked Ring",
    currentPrice: "₹1,899",
    originalPrice: "₹2,499",
    discountLabel: "24% OFF",
    offerTag: "New Arrival",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR010-G-5_0040.jpg?v=1749556121",
    title: "Classic Gold Band Ring",
    currentPrice: "₹2,199",
    originalPrice: "₹2,999",
    discountLabel: "27% OFF",
    offerTag: "Limited Offer",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR001-G-5.jpg?v=1744515205",
    title: "Chunky Statement Ring",
    currentPrice: "₹2,799",
    originalPrice: "₹3,699",
    discountLabel: "24% OFF",
    offerTag: "Trending",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/NK-40_1_0040.jpg?v=1744524127",
    title: "Layered Gold Necklace",
    currentPrice: "₹3,499",
    originalPrice: "₹4,499",
    discountLabel: "22% OFF",
    offerTag: "Bestseller",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/ER159_2_0040.jpg?v=1744526452",
    title: "Crystal Drop Earrings",
    currentPrice: "₹2,299",
    originalPrice: "₹3,099",
    discountLabel: "26% OFF",
    offerTag: "Online Only",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/ER253_1_0040.jpg?v=1750244118",
    title: "Everyday Gold Studs",
    currentPrice: "₹1,499",
    originalPrice: "₹1,999",
    discountLabel: "25% OFF",
    offerTag: "Editor's Pick",
  },
  {
    image:
      "https://palmonas.com/cdn/shop/files/Artboard14_2_5d4bfe2c-a7cd-4844-be10-2cb37cd8de6c.webp?v=1768896706",
    title: "Textured Gold Chain Bracelet",
    currentPrice: "₹2,599",
    originalPrice: "₹3,299",
    discountLabel: "21% OFF",
    offerTag: "Just In",
  },
] as const;

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard
              key={product.title}
              image={product.image}
              title={product.title}
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              discountLabel={product.discountLabel}
              offerTag={product.offerTag}
            />
          ))}
        </div>
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
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface CategoryCarouselProps {
  categories: Array<{
    label: string;
    image: string;
    hoverImage?: string;
    href?: string;
  }>;
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  // We create a virtual infinite carousel by repeating the categories array
  // three times and starting the active index in the middle copy. This lets
  // us scroll "forever" without visible jumps.
  const originalLength = categories.length;
  const repeatedCategories = [...categories, ...categories, ...categories];

  const middleOffset = originalLength; // start of the middle copy
  const initialIndex =
    middleOffset + Math.floor((originalLength > 0 ? originalLength : 1) / 2);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setActiveIndex((prev) => prev + 1);
  };

  // Scroll to active card with linear animation
  useEffect(() => {
    if (!carouselRef.current || originalLength === 0) return;

    const container = carouselRef.current;
    const cards = container.children;

    const index = activeIndex;

    // Normal smooth scroll for movements inside the middle block
    if (cards[index]) {
      const activeCard = cards[index] as HTMLElement;
      const cardRect = activeCard.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollPosition =
        container.scrollLeft +
        (cardRect.left - containerRect.left) -
        containerRect.width / 2 +
        cardRect.width / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [activeIndex, originalLength]);

  return (
    <div className="relative w-full py-12 overflow-hidden">
      {/* Navigation Arrow - Left */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        aria-label="Previous category"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Navigation Arrow - Right */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        aria-label="Next category"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex gap-0 px-20 overflow-x-auto scrollbar-hide items-center"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {repeatedCategories.map((category, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          
          // Calculate scale based on distance from active card
          // Center card: larger size, side cards: smaller for clear focus
          const scale = isActive ? 1 : Math.max(0.75, 1 - distance * 0.15);
          const zIndex = isActive
            ? repeatedCategories.length + 1
            : repeatedCategories.length - distance;
          
          // Base card dimensions - larger for center card focus,
          // slightly narrower side cards so spacing feels tighter
          const baseWidth = isActive ? 460 : 360;
          const baseHeight = isActive ? 620 : 480; // 3:4 aspect ratio

          const cardContent = (
            <div
              className="relative group cursor-pointer shrink-0"
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                zIndex,
                transition: "transform 0.6s linear, width 0.6s linear, height 0.6s linear",
                scrollSnapAlign: "center",
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className={`relative w-full h-full overflow-hidden bg-neutral-200 ${
                isActive 
                  ? 'shadow-[0_12px_40px_rgb(0,0,0,0.2)]' 
                  : 'shadow-[0_6px_20px_rgb(0,0,0,0.15)]'
              }`}>
                {/* Main image */}
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                  sizes="400px"
                />
                {/* Optional hover image */}
                {category.hoverImage && (
                  <Image
                    src={category.hoverImage}
                    alt={category.label}
                    fill
                    className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="400px"
                  />
                )}
                
                {/* Text overlay – bottom center */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-8"
                  aria-hidden
                >
                  {/* Decorative line above text (for side cards) */}
                  {!isActive && (
                    <div className="w-16 h-px bg-white mb-3 opacity-80" />
                  )}
                  
                  {/* Decorative line above text (for active card) */}
                  {isActive && (
                    <div className="w-20 h-px bg-white mb-3 opacity-90" />
                  )}
                  
                  {/* Category label */}
                  <span className={`text-white uppercase tracking-wider font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center px-4 ${
                    isActive 
                      ? 'text-2xl sm:text-3xl md:text-4xl' 
                      : 'text-lg sm:text-xl md:text-2xl'
                  }`}>
                    {category.label}
                  </span>
                  
                  {/* Decorative line below text (for side cards) */}
                  {!isActive && (
                    <div className="w-16 h-px bg-white mt-3 opacity-80" />
                  )}
                  
                  {/* Up chevron icon for active card */}
                  {isActive && (
                    <div className="mt-4">
                      <svg
                        className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (category.href) {
            return (
              <a
                key={`${category.label}-${index}`}
                href={category.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
              >
                {cardContent}
              </a>
            );
          }

          return (
            <div key={`${category.label}-${index}`}>
              {cardContent}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

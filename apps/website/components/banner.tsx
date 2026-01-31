"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  id: string | number;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

interface BannerApiResponse {
  _id: string;
  image: string;
  link?: string;
  title?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default slides shown when no banners are uploaded
const defaultSlides: Slide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85",
    title: "Golden Orbs",
    subtitle: "Collection",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=85",
    title: "Silver Elegance",
    subtitle: "Collection",
  },
  {
    id: 3,
    image: "/banner.avif",
    title: "Luxury Collection",
    subtitle: "New Arrivals",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=85",
    title: "Platinum Dreams",
    subtitle: "Exclusive",
  },
];

export default function Banner() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/banners?active=true');
        if (response.ok) {
          const data: BannerApiResponse[] = await response.json();
          
          // If we have active banners, use them; otherwise use defaults
          if (data && data.length > 0) {
            const formattedSlides: Slide[] = data.map((banner: BannerApiResponse) => ({
              id: banner._id,
              image: banner.image,
              title: banner.title || '',
              link: banner.link || '',
            }));
            setSlides(formattedSlides);
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        // Keep default slides if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || loading) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, loading, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 15 seconds of manual navigation
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const goToPrevious = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide, index) => {
          const SlideContent = (
            <div
              className="min-w-full h-full relative flex items-center justify-center"
            >
              {/* Background image */}
              <Image
                src={slide.image}
                alt={slide.title || 'Banner'}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
              {/* Dark overlay for text legibility */}
              <div
                className="absolute inset-0 bg-black/40"
                aria-hidden
              />
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10">
                  {/* Optional: Show title/subtitle if needed
                  {slide.title && (
                    <h2 className="text-6xl md:text-8xl font-serif mb-4 text-white drop-shadow-lg">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                      {slide.subtitle}
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          );

          return slide.link ? (
            <Link
              key={slide.id}
              href={slide.link}
              className="min-w-full h-full"
            >
              {SlideContent}
            </Link>
          ) : (
            <div key={slide.id} className="min-w-full h-full">
              {SlideContent}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Slide Indicators (optional) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

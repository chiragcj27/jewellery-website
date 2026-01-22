"use client";

import { useState, useEffect } from "react";

interface Slide {
  id: number;
  color: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    id: 1,
    color: "#D4AF37", // Gold
    title: "Golden Orbs",
    subtitle: "Collection",
  },
  {
    id: 2,
    color: "#C0C0C0", // Silver
    title: "Silver Elegance",
    subtitle: "Collection",
  },
  {
    id: 3,
    color: "#FFD700", // Bright Gold
    title: "Luxury Collection",
    subtitle: "New Arrivals",
  },
  {
    id: 4,
    color: "#E8E8E8", // Platinum
    title: "Platinum Dreams",
    subtitle: "Exclusive",
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

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

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="min-w-full h-full relative flex items-center justify-center"
            style={{ backgroundColor: slide.color }}
          >
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center z-10">
                <h2 className="text-6xl md:text-8xl font-serif mb-4 text-white drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-8">
                  {slide.subtitle}
                </p>
                <a
                  href="#"
                  className="text-white underline text-lg hover:opacity-80 transition-opacity"
                >
                  Explore Now
                </a>
              </div>
            </div>

            {/* Placeholder gradient overlay for visual interest */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${slide.color} 0%, rgba(0,0,0,0.3) 100%)`,
              }}
            />
          </div>
        ))}
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

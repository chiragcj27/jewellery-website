"use client";

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
  const CardContent = ({
    category,
    className = "",
  }: {
    category: (typeof categories)[0];
    className?: string;
  }) => (
    <div
      className={`relative group overflow-hidden bg-neutral-200 aspect-3/4 ${className}`}
    >
      <Image
        src={category.image}
        alt={category.label}
        fill
        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      {category.hoverImage && (
        <Image
          src={category.hoverImage}
          alt={category.label}
          fill
          className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 bg-linear-to-t from-black/60 via-transparent to-transparent">
        <div className="w-16 h-px bg-white/90 mb-2 sm:mb-3" />
        <span className="text-white uppercase tracking-wider font-semibold text-center px-3 text-sm sm:text-base md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {category.label}
        </span>
        <div className="w-16 h-px bg-white/90 mt-2 sm:mt-3" />
      </div>
    </div>
  );

  return (
    <div className="w-full py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {categories.map((category, index) => {
            const content = (
              <CardContent
                key={`${category.label}-${index}`}
                category={category}
                className="rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300"
              />
            );

            if (category.href) {
              return (
                <a
                  key={`${category.label}-${index}`}
                  href={category.href}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground rounded-sm"
                >
                  {content}
                </a>
              );
            }

            return <div key={`${category.label}-${index}`}>{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

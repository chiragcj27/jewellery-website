"use client";

import Image from "next/image";

export interface CategoryCardProps {
  /** Main image URL */
  image: string;
  /** Optional image shown on hover (crossfades over main image) */
  hoverImage?: string;
  /** Label shown at bottom-left, e.g. "EARRINGS" */
  label: string;
  /** Optional link - entire card becomes clickable */
  href?: string;
}

export default function CategoryCard({
  image,
  hoverImage,
  label,
  href,
}: CategoryCardProps) {
  const content = (
    <div className="group relative w-full aspect-3/4 min-h-[280px] overflow-hidden bg-neutral-200">
      {/* Main image */}
      <Image
        src={image}
        alt=""
        fill
        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
        sizes="(max-width: 768px) 50vw, 16.666vw"
      />
      {/* Optional hover image */}
      {hoverImage && (
        <Image
          src={hoverImage}
          alt=""
          fill
          className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          sizes="(max-width: 768px) 50vw, 16.666vw"
        />
      )}
      {/* Text overlay – bottom-left, white, uppercase */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent pt-16 pb-4 px-4"
        aria-hidden
      >
        <span className="text-white uppercase tracking-wider font-medium text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground">
        {content}
      </a>
    );
  }

  return content;
}

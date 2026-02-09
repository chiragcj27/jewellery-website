import Image from "next/image";

interface FeaturedBannerProps {
  heading: string;
  imageUrl: string;
}

export default function FeaturedBanner({ heading, imageUrl }: FeaturedBannerProps) {
  return (
    <section className="w-full">
      {/* Heading */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8 md:pt-12 pb-4 sm:pb-5 md:pb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center tracking-wide">
          {heading}
        </h2>
      </div>

      {/* Full-width banner image */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[480px] mt-3 sm:mt-4 md:mt-5">
        <Image
          src={imageUrl}
          alt={heading}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
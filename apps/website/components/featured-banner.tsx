import Image from "next/image";

interface FeaturedBannerProps {
  heading: string;
  imageUrl: string;
}

export default function FeaturedBanner({ heading, imageUrl }: FeaturedBannerProps) {
  return (
    <section className="w-full">
      {/* Heading */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8 md:pt-12 pb-3 sm:pb-4 md:pb-6">
        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center tracking-wide">
          {heading}
        </h2>
      </div>

      {/* Full-width banner image */}
      <div className="relative w-full h-[200px] sm:h-[260px] md:h-[340px] lg:h-[420px] xl:h-[520px] mt-2 sm:mt-3 md:mt-4">
        <Image
          src={imageUrl}
          alt={heading}
          fill
          priority
          className="object-contain sm:object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
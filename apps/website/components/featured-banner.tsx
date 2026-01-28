import Image from "next/image";

interface FeaturedBannerProps {
  heading: string;
  imageUrl: string;
}

export default function FeaturedBanner({ heading, imageUrl }: FeaturedBannerProps) {
  return (
    <section className="w-full">
      {/* Heading */}
      <div className="container mx-auto px-4 pt-12 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-wide">
          {heading}
        </h2>
      </div>

      {/* Full-width banner image */}
      <div className="relative w-full h-[260px] sm:h-[360px] md:h-[480px] mt-5">
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
const FEATURES = [
  {
    title: "SKIN SAFE",
    description:
      "Our jewelry is hypoallergenic and skin-safe, crafted with care to ensure comfort for all skin types. Enjoy beautiful, irritation-free wear every day, knowing each piece is designed with your well-being in mind.",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-14 h-14 mx-auto"
        aria-hidden
      >
        <circle cx="32" cy="32" r="14" />
        <path d="M24 30 Q32 34 40 30" />
        <path d="M26 26 Q28 24 30 26" />
        <path d="M34 26 Q36 24 38 26" />
        <path d="M40 27 C38 25 36 25 36 27 C36 29 40 31 40 31 C40 31 44 29 44 27 C44 25 42 25 40 27" />
      </svg>
    ),
  },
  {
    title: "18K GOLD VERMEIL",
    description:
      "Our jewelry is crafted from premium metals like surgical steel, sterling silver, and thick 18k gold plating, ensuring durability and lasting shine. Experience luxury and quality with every piece, designed to stand the test of time.",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-14 h-14 mx-auto"
        aria-hidden
      >
        <rect x="14" y="24" width="36" height="12" rx="2" />
        <rect x="16" y="34" width="32" height="12" rx="2" />
        <path d="M32 12 L34 18 L40 18 L35 22 L37 28 L32 24 L27 28 L29 22 L24 18 L30 18 Z" />
      </svg>
    ),
  },
  {
    title: "AUTHENTIC DIAMONDS",
    description:
      "Our lab-grown diamonds are SGL Certified, ensuring the highest standards of quality and authenticity same like natural diamonds. Each diamond undergoes rigorous testing to guarantee its brilliance and ethical origins. Shine with confidence in every sparkly moment.",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-14 h-14 mx-auto"
        aria-hidden
      >
        <path d="M32 10 L44 26 L32 54 L20 26 Z" />
        <path d="M20 26 L32 26 L32 54" />
        <path d="M32 26 L44 26 L32 54" />
        <path d="M32 10 L20 26" />
        <path d="M32 10 L44 26" />
        <path d="M26 14 L28 18" />
        <path d="M38 14 L36 18" />
        <path d="M28 22 L32 18" />
        <path d="M36 22 L32 18" />
      </svg>
    ),
  },
] as const;

export default function ShopWithConfidence() {
  return (
    <section
      className="w-full bg-[#f8f8f8] py-16 md:py-20"
      aria-labelledby="shop-with-confidence-heading"
    >
      <div className="container mx-auto px-4">
        <h2
          id="shop-with-confidence-heading"
          className="text-2xl md:text-3xl font-bold text-center text-black uppercase tracking-wide mb-12 md:mb-16"
        >
          Shop with Confidence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-5xl mx-auto">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col">
              <div className="text-black mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-black/90 text-sm leading-relaxed text-left">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

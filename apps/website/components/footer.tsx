"use client";
export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-black text-white">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-4">
          {/* Brand & Story */}
          <div className="space-y-3 sm:space-y-4 md:col-span-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.25em] belleza-regular">
              ZIVARA
            </h2>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-gray-300">
              Curated fine jewellery crafted to celebrate everyday luxury.
              Thoughtfully designed silhouettes, modern textures and timeless
              details that become part of your signature style.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                22KT &amp; 18KT
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                Lab Grown Diamonds
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                Everyday Luxury
              </span>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Shop
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <a href="/22kt-ready" className="hover:text-white">
                  22KT Ready
                </a>
              </li>
              <li>
                <a href="/18kt-ready" className="hover:text-white">
                  18KT Ready
                </a>
              </li>
              <li>
                <a href="/9kt-ready" className="hover:text-white">
                  9KT Ready
                </a>
              </li>
              <li>
                <a href="/silver-ready" className="hover:text-white">
                  Silver Ready
                </a>
              </li>
              <li>
                <a href="/coins" className="hover:text-white">
                  Coins
                </a>
              </li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Help
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <a href="/customer-care" className="hover:text-white">
                  Customer Care
                </a>
              </li>
              <li>
                <a href="/shipping" className="hover:text-white">
                  Shipping &amp; Returns
                </a>
              </li>
              <li>
                <a href="/size-guide" className="hover:text-white">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="/faqs" className="hover:text-white">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Social */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col gap-6 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 sm:space-y-3 max-w-md">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Join the inner circle
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              Be the first to know about new drops, styling edits and
              exclusive previews.
            </p>
            <form
              className="flex flex-col gap-2 sm:gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-none border border-white/20 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none focus:border-white"
              />
              <button
                type="submit"
                className="w-full rounded-none border border-white bg-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white sm:w-auto"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Follow
            </p>
            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <a href="#" className="hover:text-white">
                Instagram
              </a>
              <a href="#" className="hover:text-white">
                Pinterest
              </a>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black py-3 sm:py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 sm:gap-3 px-4 text-[10px] sm:text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} Zivara. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </a>
            <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
            <a href="/terms" className="hover:text-white">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


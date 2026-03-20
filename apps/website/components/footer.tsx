"use client";
export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-black text-white">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Story */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[0.25em] belleza-regular">
              The Swarnorra
            </h2>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-gray-300">
              TheSwarnorra by Soni Ramniklal Jewellers is built on a proud legacy of over 90 years and four generations of jewellery craftsmanship. Blending heritage artistry with modern elegance, we create fine gold and diamond jewellery that celebrates life&apos;s most meaningful moments.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                22KT Gold
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                Genuine Gold
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 border border-white/10">
                Hallmarked
              </span>
            </div>
          </div>

          {/* Store Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Visit Our Store
            </h3>
            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Soni Ramniklal Jewellers, Bindal Complex, Gorelal Square, Gondia</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:7030995738" className="hover:text-white transition-colors">7030995738</a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>11:00 AM – 8:30 PM</span>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/place/SONI+RAMNIKLAL+JEWELLERS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mt-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View on Google Maps
                </a>
              </li>
            </ul>
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
                <a href="/policies/returns" className="hover:text-white">
                  Returns &amp; Exchange
                </a>
              </li>
              <li>
                <a href="/policies/returns#cancellation" className="hover:text-white">
                  Cancellation &amp; Refund
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
          <p>© {new Date().getFullYear()} The Swarnorra by Soni Ramniklal Jewellers. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a href="/policies/returns" className="hover:text-white">
              Return Policy
            </a>
            <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
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

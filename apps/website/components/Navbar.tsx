"use client";

import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-black">
      {/* Top Section - Utility Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-black">LOREUM</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-3 pr-12 rounded-lg bg-[#f5f5f0] border-none outline-none text-black placeholder:text-gray-500"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:opacity-70 transition-opacity"
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>

          {/* User Icons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Profile Icon with Lightning */}
            <button
              className="relative text-black hover:opacity-70 transition-opacity"
              aria-label="Account"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></span>
            </button>

            {/* Wishlist Icon with Badge */}
            <button
              className="relative text-black hover:opacity-70 transition-opacity"
              aria-label="Wishlist"
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
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                0
              </span>
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              className="relative text-black hover:opacity-70 transition-opacity"
              aria-label="Shopping Cart"
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
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Navigation Links */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <NavLink href="/new-arrivals">New Arrivals</NavLink>
            <NavLink href="/best-seller">Best Seller</NavLink>
            <NavLink href="/fine-silver">Fine Silver</NavLink>
            
            {/* 9KT Fine Gold with Luxe Label */}
            <div className="relative">
              <span className="absolute -top-5 left-0 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                Luxe
              </span>
              <NavLink href="/9kt-fine-gold">9KT Fine Gold</NavLink>
            </div>

            {/* Emily In Paris with à la mode Label */}
            <div className="relative">
              <span className="absolute -top-5 left-0 bg-blue-400 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                à la mode
              </span>
              <NavLink href="/emily-in-paris">Emily In Paris</NavLink>
            </div>

            <NavLink href="/shraddhas-favourite">Shraddha&apos;s Favourite</NavLink>
            <NavLink href="/demi-fine-jewellery">Demi-fine Jewellery</NavLink>
            <NavLink href="/gifting">Gifting</NavLink>
            <NavLink href="/about-us">About Us</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-black hover:opacity-70 transition-opacity whitespace-nowrap"
    >
      {children}
    </a>
  );
}
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import PreHeader from "./pre-header";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/api";

interface CategoryNavItem {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  displayOrder?: number;
}

export default function Navbar() {
  const { user, logout, isWholesaler } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryNavItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // useSyncExternalStore avoids hydration mismatch: server snapshot is 0, client uses persisted cart.
  const cartItemCount = useSyncExternalStore(
    (onStoreChange) => useCartStore.subscribe(onStoreChange),
    () => useCartStore.getState().getTotalItems(),
    () => 0
  );
  const wishlistCount = useSyncExternalStore(
    (onStoreChange) => useWishlistStore.subscribe(onStoreChange),
    () => useWishlistStore.getState().getCount(),
    () => 0
  );

  useEffect(() => {
    let isMounted = true;

    api.categories
      .getAll()
      .then((result) => {
        if (!isMounted) return;
        if (result?.success && Array.isArray(result.data)) {
          const activeSorted = [...result.data]
            .filter((category: CategoryNavItem) => category.isActive !== false)
            .sort(
              (a: CategoryNavItem, b: CategoryNavItem) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
            );
          setCategories(activeSorted);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories for navbar:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
    <PreHeader />
    <nav className="bg-white sticky top-0 z-50 border-b border-black">
      {/* Top Section - Utility Bar */}
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-black"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Brand Logo */}
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black belleza-regular">ZIVARA</h1>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-lg bg-[#f5f5f0] border-none outline-none text-black placeholder:text-gray-500 text-sm sm:text-base"
              />
              <button
                type="button"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-black hover:opacity-70 transition-opacity"
                aria-label="Search"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="md:hidden w-8 h-8 flex items-center justify-center text-black"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
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

            {isWholesaler && (
              <span className="hidden sm:inline-block text-[10px] sm:text-xs font-medium uppercase tracking-wide text-black/70 bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                Business
              </span>
            )}
            {/* Profile / Account */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth"
                  className="relative text-black hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  aria-label="Account"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
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
                  <span className="text-xs sm:text-sm font-medium hidden lg:inline truncate max-w-[100px]">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-[10px] sm:text-xs text-black/55 hover:text-black transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="relative text-black hover:opacity-70 transition-opacity"
                aria-label="Sign in"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
              </Link>
            )}

            {/* Wishlist Icon with Badge */}
            <Link
              href="/wishlist"
              className="relative text-black hover:opacity-70 transition-opacity"
              aria-label="Wishlist"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-black text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon with Badge */}
            <Link
              href="/cart"
              className="relative text-black hover:opacity-70 transition-opacity"
              aria-label="Shopping Cart"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-black text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                {cartItemCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Shown when mobile menu is open */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#f5f5f0] border-none outline-none text-black placeholder:text-gray-500 text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4"
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
      )}

      {/* Bottom Section - Navigation Links */}
      <div className={`border-t border-gray-200 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 flex-wrap">
            {categories.length > 0 ? (
              categories.map((category) => (
                <NavLink
                  key={category._id}
                  href={`/category/${category.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-sm sm:text-base font-semibold">
                    {category.name}
                  </span>
                </NavLink>
              ))
            ) : (
              <>
                <NavLink href="/22kt-ready" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">22KT Ready</span>
                </NavLink>
                <NavLink href="/18kt-ready" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">18KT Ready</span>
                </NavLink>
                <NavLink href="/9kt-ready" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">9KT Ready</span>
                </NavLink>
                <NavLink href="/22kt-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">22KT Order</span>
                </NavLink>
                <NavLink href="/18kt-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">18KT Order</span>
                </NavLink>
                <NavLink href="/20kt-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">20KT Order</span>
                </NavLink>
                <NavLink href="/14kt-9kt-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">
                    14KT &amp; 9KT Order
                  </span>
                </NavLink>
                <NavLink href="/silver-ready" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">
                    Silver Ready
                  </span>
                </NavLink>
                <NavLink href="/platinum-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">
                    Platinum Order
                  </span>
                </NavLink>
                <NavLink href="/lab-grown-order" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">
                    Lab Grown Order
                  </span>
                </NavLink>
                <NavLink href="/coins" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-sm sm:text-base font-semibold">Coins</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-black hover:opacity-70 transition-opacity whitespace-nowrap py-1 lg:py-0"
    >
      {children}
    </a>
  );
}

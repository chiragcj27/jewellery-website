"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export default function OrdersPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-8 text-center">
          <h1 className="text-2xl belleza-regular text-black">My Orders</h1>
          <p className="mt-3 text-sm text-black/60">
            Please sign in to view your order history.
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-black/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-black/10 bg-white p-8 text-center">
        <h1 className="text-2xl belleza-regular text-black">My Orders</h1>
        <p className="mt-3 text-sm text-black/60">
          Hi {user.name}, your order history will appear here soon.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-black/20 px-5 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

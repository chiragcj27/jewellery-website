"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#1a1714]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(184,134,11,0.1) 0%, transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 25 L35 30 L30 45 L25 30 L10 25 L25 20 Z' fill='%23d4af37' fill-opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <p className="belleza-regular text-4xl text-[#f5f0e6] leading-tight max-w-sm">
            Your journey to timeless pieces begins here.
          </p>
          <p className="rubik-regular mt-4 text-[#a89f91] text-sm max-w-xs">
            Sign in to save your favourites, track orders, and enjoy a seamless experience.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="belleza-regular text-2xl text-black inline-block mb-6 hover:opacity-70 transition-opacity"
          >
            ZIVARA
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/6 p-8 sm:p-10">
            <h1 className="belleza-regular text-2xl text-black mb-1">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-black/55 mb-7">
              {mode === "signin"
                ? "Sign in to continue to ZIVARA"
                : "Join us for a seamless shopping experience"}
            </p>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-black/10 mb-7">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`pb-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  mode === "signin"
                    ? "border-black text-black"
                    : "border-transparent text-black/45 hover:text-black/65"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`pb-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  mode === "signup"
                    ? "border-black text-black"
                    : "border-transparent text-black/45 hover:text-black/65"
                }`}
              >
                Create account
              </button>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5"
            >
              {mode === "signup" && (
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-black/65">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-black/65">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-black/65">
                    Password
                  </label>
                  {mode === "signin" && (
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-black/55 hover:text-black transition-colors"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
              </div>

              {mode === "signin" && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-black/25 text-black focus:ring-2 focus:ring-black/10 focus:ring-offset-0"
                  />
                  <span className="text-sm text-black/65">Remember me</span>
                </label>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-black text-white font-medium text-sm tracking-wide hover:bg-black/90 active:scale-[0.995] transition-all shadow-sm mt-1"
              >
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-black/45 leading-relaxed">
            By continuing, you agree to ZIVARA&apos;s{" "}
            <Link href="/terms" className="underline hover:text-black/60 transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-black/60 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

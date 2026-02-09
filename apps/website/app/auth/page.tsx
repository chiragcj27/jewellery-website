"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/api";

type AccountType = "customer" | "business";
type Mode = "signin" | "signup";

const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|jpg|png|gif|webp)$/;

export default function AuthPage() {
  const router = useRouter();
  const { login, registerCustomer, registerWholesaler } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [city, setCity] = useState("");
  const [visitingCardFile, setVisitingCardFile] = useState<File | null>(null);
  const [visitingCardPreview, setVisitingCardPreview] = useState<string | null>(null);
  const [mobNumber, setMobNumber] = useState("");
  const [gstCertFiles, setGstCertFiles] = useState<File[]>([]);
  const [gstNo, setGstNo] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visitingCardInputRef = useRef<HTMLInputElement>(null);
  const gstCertInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const result = await login(email, password);
        if (result.ok) {
          router.push("/");
          return;
        }
        setError(result.error || "Sign in failed");
        if (result.code === "WHOLESALER_PENDING_APPROVAL") {
          setSuccessMessage(
            "Your business account is pending approval. You will be able to sign in once our team approves it."
          );
        }
        return;
      }

      if (mode === "signup") {
        if (accountType === "customer") {
          const result = await registerCustomer(email, password, name);
          if (result.ok) {
            router.push("/");
            return;
          }
          setError(result.error || "Registration failed");
          return;
        }

        if (accountType === "business") {
          if (!firmName.trim()) {
            setError("Firm name is required");
            return;
          }
          if (!city.trim()) {
            setError("City is required");
            return;
          }
          if (!visitingCardFile) {
            setError("Please upload your visiting card image");
            return;
          }
          if (!mobNumber.trim()) {
            setError("Mobile number is required");
            return;
          }
          if (gstCertFiles.length === 0) {
            setError("Please upload at least one GST certificate file");
            return;
          }
          const uploadRes = await api.assets.upload(visitingCardFile);
          if (!uploadRes.success || !uploadRes.data?.url) {
            setError(uploadRes.error || "Failed to upload visiting card image");
            return;
          }
          const visitingCardUrl = uploadRes.data.url as string;
          const gstUrls: string[] = [];
          for (const file of gstCertFiles) {
            const gstRes = await api.assets.upload(file);
            if (!gstRes.success || !gstRes.data?.url) {
              setError(gstRes.error || "Failed to upload GST certificate file");
              return;
            }
            gstUrls.push(gstRes.data.url as string);
          }
          const result = await registerWholesaler({
            email,
            password,
            name,
            firmName: firmName.trim(),
            city: city.trim(),
            visitingCardImage: visitingCardUrl,
            mobNumber: mobNumber.trim(),
            gstCertificateFiles: gstUrls,
            gstNo: gstNo.trim() || undefined,
          });
          if (result.ok) {
            setSuccessMessage(
              "Your business account has been created. It will be reviewed by our team and you will be notified once approved. You can sign in after approval."
            );
            setMode("signin");
            setEmail("");
            setPassword("");
            setName("");
            setFirmName("");
            setCity("");
            setVisitingCardFile(null);
            setVisitingCardPreview((p) => {
              if (p) URL.revokeObjectURL(p);
              return null;
            });
            setMobNumber("");
            setGstCertFiles([]);
            setGstNo("");
            return;
          }
          setError(result.error || "Registration failed");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setSuccessMessage("");
  };

  const switchAccountType = (t: AccountType) => {
    setAccountType(t);
    setError("");
    setSuccessMessage("");
    if (t === "customer") {
      setFirmName("");
      setCity("");
      setVisitingCardFile(null);
      setVisitingCardPreview((p) => {
        if (p) URL.revokeObjectURL(p);
        return null;
      });
      setMobNumber("");
      setGstCertFiles([]);
      setGstNo("");
    }
  };

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
            {accountType === "customer"
              ? "Your journey to timeless pieces begins here."
              : "Business login for wholesalers."}
          </p>
          <p className="rubik-regular mt-4 text-[#a89f91] text-sm max-w-xs">
            {accountType === "customer"
              ? "Sign in to save your favourites, track orders, and enjoy a seamless experience."
              : "Sign in to view trade pricing, wastage and purity, and place wholesale orders."}
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

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/6 p-8 sm:p-10">
            <h1 className="belleza-regular text-2xl text-black mb-1">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-black/55 mb-5">
              {accountType === "customer"
                ? mode === "signin"
                  ? "Sign in to continue to ZIVARA"
                  : "Join us for a seamless shopping experience"
                : mode === "signin"
                  ? "Sign in to your business account"
                  : "Register as a wholesaler (account subject to approval)"}
            </p>

            {/* Account type: Customer / Business */}
            <div className="flex gap-4 border-b border-black/10 mb-5 pb-4">
              <button
                type="button"
                onClick={() => switchAccountType("customer")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  accountType === "customer"
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black/65 hover:border-black/40"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => switchAccountType("business")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  accountType === "business"
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black/65 hover:border-black/40"
                }`}
              >
                Business login
              </button>
            </div>

            {/* Sign in / Create account tabs */}
            <div className="flex gap-6 border-b border-black/10 mb-7">
              <button
                type="button"
                onClick={() => switchMode("signin")}
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
                onClick={() => switchMode("signup")}
                className={`pb-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  mode === "signup"
                    ? "border-black text-black"
                    : "border-transparent text-black/45 hover:text-black/65"
                }`}
              >
                Create account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium uppercase tracking-wider text-black/65"
                    >
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
                      required={mode === "signup"}
                    />
                  </div>
                  {accountType === "business" && (
                    <>
                      <div className="space-y-2">
                        <label
                          htmlFor="firmName"
                          className="block text-xs font-medium uppercase tracking-wider text-black/65"
                        >
                          Firm name
                        </label>
                        <input
                          id="firmName"
                          type="text"
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                          placeholder="Your firm / business name"
                          className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                          autoComplete="organization"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="city"
                          className="block text-xs font-medium uppercase tracking-wider text-black/65"
                        >
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="mobNumber"
                          className="block text-xs font-medium uppercase tracking-wider text-black/65"
                        >
                          Mobile number
                        </label>
                        <input
                          id="mobNumber"
                          type="tel"
                          value={mobNumber}
                          onChange={(e) => setMobNumber(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                          autoComplete="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-wider text-black/65">
                          Visiting card image
                        </label>
                        <input
                          ref={visitingCardInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f && ALLOWED_IMAGE_TYPES.test(f.type)) {
                              setVisitingCardFile(f);
                              setVisitingCardPreview(URL.createObjectURL(f));
                            } else if (f) {
                              setError("Please choose an image (JPEG, PNG, GIF or WebP)");
                            }
                          }}
                          className="w-full text-sm text-black/65 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black/10 file:text-black"
                        />
                        {visitingCardPreview && (
                          <div className="mt-2">
                            <img
                              src={visitingCardPreview}
                              alt="Visiting card preview"
                              className="h-24 object-contain rounded-lg border border-black/10"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-wider text-black/65">
                          GST certificate files
                        </label>
                        <input
                          ref={gstCertInputRef}
                          type="file"
                          accept=".pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            const valid = files.filter(
                              (f) => f.type.startsWith("image/") || f.type === "application/pdf"
                            );
                            if (valid.length !== files.length) {
                              setError("Only PDF or images (JPEG, PNG, GIF, WebP) are allowed");
                            }
                            setGstCertFiles((prev) => [...prev, ...valid]);
                          }}
                          className="w-full text-sm text-black/65 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black/10 file:text-black"
                        />
                        {gstCertFiles.length > 0 && (
                          <ul className="mt-2 text-sm text-black/65 space-y-1">
                            {gstCertFiles.map((f, i) => (
                              <li key={i} className="flex items-center justify-between">
                                <span>{f.name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGstCertFiles((prev) => prev.filter((_, j) => j !== i))
                                  }
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="gstNo"
                          className="block text-xs font-medium uppercase tracking-wider text-black/65"
                        >
                          GST number (optional)
                        </label>
                        <input
                          id="gstNo"
                          type="text"
                          value={gstNo}
                          onChange={(e) => setGstNo(e.target.value)}
                          placeholder="e.g. 27XXXXXXXXXX1Z5"
                          className="w-full px-4 py-3.5 rounded-xl bg-[#faf9f7] border border-black/8 text-black placeholder:text-black/35 outline-none focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
                          autoComplete="off"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium uppercase tracking-wider text-black/65"
                >
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
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-wider text-black/65"
                  >
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
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-black/25 text-black focus:ring-2 focus:ring-black/10 focus:ring-offset-0"
                  />
                  <span className="text-sm text-black/65">Remember me</span>
                </label>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-black text-white font-medium text-sm tracking-wide hover:bg-black/90 active:scale-[0.995] transition-all shadow-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-black/45 leading-relaxed">
            By continuing, you agree to ZIVARA&apos;s{" "}
            <Link href="/terms" className="underline hover:text-black/60 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-black/60 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

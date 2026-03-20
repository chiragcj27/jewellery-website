import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | The Swarnorra",
  description:
    "Learn how The Swarnorra protects your privacy and personal information when shopping for pure gold jewellery on our website.",
};

/* ── tiny reusable pieces ── */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-6 sm:py-8">
      <span className="h-px w-12 bg-black/20" />
      <span className="mx-3 text-black/30 text-xs">✦</span>
      <span className="h-px w-12 bg-black/20" />
    </div>
  );
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="belleza-regular text-xl sm:text-2xl md:text-3xl tracking-wide text-black scroll-mt-28"
    >
      {children}
    </h2>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 sm:gap-3 text-sm sm:text-base text-black/80 leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
      <span>{children}</span>
    </li>
  );
}

/* ── page ── */

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#f5f0e6]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container mx-auto px-4 py-14 sm:py-16 md:py-20 text-center relative z-10">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-white/50 mb-3 sm:mb-4">
            The Swarnorra
          </p>
          <h1 className="belleza-regular text-3xl sm:text-4xl md:text-5xl tracking-wide mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/60 leading-relaxed">
            Your trust is our most valuable asset. We are committed to protecting
            your personal information and ensuring your shopping experience is
            completely secure.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16 max-w-3xl">

        {/* ── Introduction ── */}
        <section>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4">
            At The Swarnorra, we respect the privacy of our clientele. This
            Privacy Policy outlines how we collect, use, protect, and handle
            your Personally Identifiable Information in accordance with our
            website and retail operations.
          </p>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed">
            By visiting our website and utilizing our services, you consent to
            the practices described in this policy.
          </p>
        </section>

        <SectionDivider />

        {/* ── Information We Collect ── */}
        <section id="collection">
          <SectionHeading>Information We Collect</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
            We collect information seamlessly to provide you with a tailored luxury shopping experience:
          </p>

          <div className="mt-6 sm:mt-8 space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-3">
                Personal Information
              </h3>
              <ul className="space-y-3">
                <Bullet>Name, email address, mailing/billing addresses, and phone number when you register or place an order.</Bullet>
                <Bullet>Measurement details (e.g., ring sizes) provided for customized pieces.</Bullet>
                <Bullet>Communication records when you contact our customer support or concierge.</Bullet>
              </ul>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-3">
                Financial Information
              </h3>
              <ul className="space-y-3">
                <Bullet>
                  Payment details, including credit card numbers and billing information.
                  <em>Note: All payment data is processed through highly secure, encrypted payment gateways. We do not store full credit card numbers on our servers.</em>
                </Bullet>
              </ul>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-3">
                Automated Data
              </h3>
              <ul className="space-y-3">
                <Bullet>IP addresses, browser types, device identifiers, and browsing activity to enhance website performance and personalize product recommendations.</Bullet>
              </ul>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── How We Use the Info ── */}
        <section id="usage">
          <SectionHeading>How We Use Your Information</SectionHeading>
          <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>To process transactions, fulfill high-value orders securely, and arrange specialized delivery services.</Bullet>
            <Bullet>To send periodic emails regarding your order or bespoke design updates.</Bullet>
            <Bullet>To tailor your online experience, presenting collections and pieces most relevant to your aesthetic preferences.</Bullet>
            <Bullet>To comply with legal obligations, including tax logging and anti-fraud verification essential for the fine jewellery sector.</Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Security ── */}
        <section id="security" className="rounded-lg border border-black/10 bg-white/60 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
             <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3 className="belleza-regular text-lg sm:text-xl text-black">
              Commitment to Security
            </h3>
          </div>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4">
            Given the nature of high-value jewellery transactions, your security is our priority. Our website is scanned on a regular basis for security holes and known vulnerabilities.
          </p>
          <ul className="space-y-3">
            <Bullet>Your personal information is contained behind secured networks.</Bullet>
            <Bullet>Only a limited number of persons with special access rights can view your data, and they are required to keep it confidential.</Bullet>
            <Bullet>All sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.</Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Third Parties ── */}
        <section id="third-parties">
          <SectionHeading>Third-Party Disclosures</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
            We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties for marketing purposes.
          </p>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
            We do, however, share necessary data with trusted partners who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information strictly confidential. These include:
          </p>
          <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>Secure logistics and courier partners specialized in vault-to-door delivery.</Bullet>
            <Bullet>Verified payment gateway providers.</Bullet>
            <Bullet>Government or regulatory bodies if requested, to comply with laws governing the gold trading and jewellery industry.</Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Cookies ── */}
        <section id="cookies">
          <SectionHeading>Cookie Policy</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
             Cookies are small files transferred to your computer&apos;s hard drive through your Web browser (if allowed) that enable our systems to recognize your browser and capture certain intelligence.
          </p>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
             We use cookies to help us remember and process the items in your cart, understand and save your preferences for future visits, and compile aggregate data about site traffic so that we can offer a superior site experience in the future.
          </p>
        </section>

         <SectionDivider />

         {/* ── Contact CTA ── */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm text-black/50 mb-4">
            For any privacy-related inquiries or to request data deletion, contact our Data Protection Officer.
          </p>
          <Link
            href="/contact"
            className="inline-block border border-black bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] transition hover:bg-transparent hover:text-black"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}

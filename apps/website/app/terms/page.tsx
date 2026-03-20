import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | The Swarnorra",
  description:
    "Review the Terms of Use, conditions, and legal agreements for purchasing pure gold jewellery from The Swarnorra.",
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

export default function TermsOfUse() {
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
            Terms of Use
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/60 leading-relaxed">
             Please read these conditions carefully before utilizing our website or purchasing our fine jewellery. Accessing our platform indicates your agreement to be bound by these Terms.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16 max-w-3xl">

        {/* ── General Acceptance ── */}
        <section id="general">
          <SectionHeading>1. General conditions</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/80 leading-relaxed">
            By visiting our site and/or purchasing from The Swarnorra, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions. These terms apply to all users of the site, including browsers, customers, merchants, and contributors of content.
          </p>
          <p className="mt-4 text-sm sm:text-base text-black/80 leading-relaxed">
             We reserve the right to refuse service to anyone for any reason at any time, particularly to protect our business from fraudulent, high-risk transactions.
          </p>
        </section>

        <SectionDivider />

        {/* ── Products & Pricing ── */}
        <section id="pricing">
          <SectionHeading>2. Products &amp; Pricing Variations</SectionHeading>
          <div className="mt-5 sm:mt-6 rounded-lg border border-black/10 bg-white/50 p-5 sm:p-6 mb-5">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-3">
               Important notice regarding gold jewellery
            </h3>
            <p className="text-sm text-black/70 leading-relaxed mb-4">
               Due to the handcrafted nature of fine jewellery and the fluctuating nature of precious metal markets, please note the following:
            </p>
            <ul className="space-y-3">
              <Bullet>
                <strong>Weight Variations:</strong> The final weight of manufactured pieces may vary slightly from the estimated weight displayed online. The final invoice value will reflect the exact weight of the dispatched piece.
              </Bullet>
              <Bullet>
                <strong>Market Rates:</strong> Prices of pieces (especially those made-to-order) may be subject to change based on real-time daily gold rates until the order is confirmed and firmly paid.
              </Bullet>
              <Bullet>
                <strong>Visual Representation:</strong> We have made every effort to display the colors, textures, and brilliance of our jewellery as accurately as possible. However, we cannot guarantee that your device&apos;s display will be entirely accurate.
              </Bullet>
            </ul>
          </div>
        </section>

        <SectionDivider />

        {/* ── Orders & Payments ── */}
         <section id="orders">
          <SectionHeading>3. Orders &amp; Cancellations</SectionHeading>
          <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>
              An order constitutes an offer to purchase. All orders are subject to acceptance and availability.
            </Bullet>
            <Bullet>
               We reserve the right to limit the quantities of any products or services that we offer.
            </Bullet>
            <Bullet>
               In the event we make a change to or cancel an order (e.g., due to stock unavailability or suspected fraud), we will attempt to notify you via the email or phone number provided.
            </Bullet>
            <Bullet>
               For detailed information on your rights to cancel, please review our <Link href="/policies/returns" className="underline decoration-black/30 underline-offset-4 hover:decoration-black">Return &amp; Cancellation Policy</Link>.
            </Bullet>
          </ul>
        </section>

        <SectionDivider />

         {/* ── Intellectual Property ── */}
        <section id="intellectual-property">
          <SectionHeading>4. Intellectual Property</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/80 leading-relaxed">
            All content included on this site, such as bespoke jewellery designs, photography, text, graphics, logos, and digital downloads is the exclusive property of The Swarnorra or its content suppliers and is protected by international copyright and hallmark laws.
          </p>
          <p className="mt-4 text-sm sm:text-base text-black/80 leading-relaxed">
            Reproduction, duplication, or exploitation of our designs, imagery, or branding without express written permission is strictly prohibited and subject to legal action.
          </p>
        </section>

        <SectionDivider />

        {/* ── Liability ── */}
        <section id="liability">
          <SectionHeading>5. Limitation of Liability</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/80 leading-relaxed">
             While we ensure the utmost care in crafting and delivering our pieces:
          </p>
           <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>We do not guarantee that the use of our service will be uninterrupted, timely, secure, or error-free.</Bullet>
            <Bullet>The Swarnorra shall not be liable for any direct, indirect, incidental, punitive, or consequential damages arising from your use of any of the service or any products procured using the service.</Bullet>
            <Bullet>Our liability for transit issues ceases once the secure package is handed over to the authorized recipient (as confirmed by OTP or signature).</Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Governing Law ── */}
        <section id="governing-law" className="rounded-lg border border-black/10 bg-black text-white p-6 sm:p-8 text-center mt-8">
           <h2 className="belleza-regular text-xl sm:text-2xl md:text-3xl tracking-wide mb-3">
            Governing Law
          </h2>
          <p className="max-w-lg mx-auto text-sm sm:text-base text-white/70 leading-relaxed">
            These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of <strong>India</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}

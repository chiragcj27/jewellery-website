import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Cancellation Policy | The Swarnorra",
  description:
    "Learn about our return, cancellation, refund, and lifetime exchange policies for pure gold jewellery at The Swarnorra.",
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

export default function ReturnsPolicy() {
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
            Return &amp; Cancellation Policy
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/60 leading-relaxed">
            Every piece is crafted in pure gold with exceptional attention to detail
            and certified authenticity. Our policies are thoughtfully designed to
            protect both our clients and the integrity of our craftsmanship.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16 max-w-3xl">

        {/* ── Order Cancellation ── */}
        <section id="cancellation">
          <SectionHeading id="cancellation-heading">Order Cancellation</SectionHeading>
          <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>Orders may be cancelled within 24 hours of confirmation.</Bullet>
            <Bullet>
              Once the piece enters production or dispatch stage, cancellation will
              not be possible.
            </Bullet>
            <Bullet>
              Customised, engraved, or made-to-order jewellery cannot be cancelled
              after confirmation.
            </Bullet>
            <Bullet>
              Approved cancellations will be refunded within 5–7 business days to the
              original mode of payment.
            </Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Returns ── */}
        <section id="returns">
          <SectionHeading id="returns-heading">Returns</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
            Due to the intrinsic value of real gold jewellery, we maintain a
            carefully structured return policy.
          </p>

          {/* Eligible */}
          <div className="mt-6 sm:mt-8 rounded-lg border border-black/10 bg-white/60 p-5 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-4">
              Eligible Returns
            </h3>
            <p className="text-sm text-black/60 mb-4">
              Returns are accepted only in the following rare situations:
            </p>
            <ul className="space-y-3">
              <Bullet>Manufacturing defect</Bullet>
              <Bullet>Incorrect product delivered</Bullet>
              <Bullet>
                Transit damage (must be reported within 48 hours of delivery)
              </Bullet>
            </ul>
            <div className="mt-5 flex items-start gap-2.5 rounded-md bg-amber-50 border border-amber-200/60 px-4 py-3 text-xs sm:text-sm text-amber-800">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>
                An unboxing video and clear images are <strong>mandatory</strong> for
                verification.
              </span>
            </div>
          </div>

          {/* Not Eligible */}
          <div className="mt-5 sm:mt-6 rounded-lg border border-black/10 bg-white/40 p-5 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-black/90 mb-4">
              Not Eligible for Return
            </h3>
            <ul className="space-y-3">
              <Bullet>Change of preference or personal liking</Bullet>
              <Bullet>Minor variations due to lighting or screen display</Bullet>
              <Bullet>Customised or engraved jewellery</Bullet>
              <Bullet>Pieces showing signs of wear, damage, or tampering</Bullet>
              <Bullet>Products without original invoice, tag, or packaging</Bullet>
            </ul>
          </div>
        </section>

        <SectionDivider />

        {/* ── Return Process ── */}
        <section id="return-process">
          <SectionHeading>Return Process</SectionHeading>
          <ol className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
            {[
              "Contact our support team within 48 hours of delivery.",
              "Share order details, images, and unboxing video.",
              "Upon approval, a secure reverse pickup will be arranged (subject to serviceability).",
              "The piece must pass a quality inspection before approval of refund or exchange.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-4">
                <span className="flex shrink-0 items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/20 text-xs sm:text-sm font-semibold text-black/70">
                  {i + 1}
                </span>
                <span className="text-sm sm:text-base text-black/80 leading-relaxed pt-1">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <SectionDivider />

        {/* ── Refunds ── */}
        <section id="refunds">
          <SectionHeading>Refunds</SectionHeading>
          <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <Bullet>
              Refunds are processed after successful quality verification.
            </Bullet>
            <Bullet>
              Amount will be credited within 7–10 business days to the original
              payment method.
            </Bullet>
            <Bullet>
              Making charges, shipping, and applicable transaction fees may be
              deducted where applicable.
            </Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Lifetime Exchange ── */}
        <section id="exchange">
          <SectionHeading>Lifetime Exchange Policy</SectionHeading>
          <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
            We are pleased to offer a lifetime exchange on our gold jewellery:
          </p>
          <ul className="mt-5 space-y-3 sm:space-y-4">
            <Bullet>
              Gold value will be calculated at the prevailing market rate on the day
              of exchange.
            </Bullet>
            <Bullet>
              Making charges and wastage deductions will apply as per policy.
            </Bullet>
            <Bullet>
              The piece must pass purity and condition verification.
            </Bullet>
          </ul>
        </section>

        <SectionDivider />

        {/* ── Authenticity Assurance ── */}
        <section id="authenticity" className="rounded-lg border border-black/10 bg-white/70 p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2 className="belleza-regular text-xl sm:text-2xl md:text-3xl tracking-wide text-black mb-3">
            Authenticity Assurance
          </h2>
          <p className="max-w-lg mx-auto text-sm sm:text-base text-black/70 leading-relaxed">
            All our jewellery is <strong>BIS Hallmarked</strong> and crafted in
            compliance with Indian regulatory standards, ensuring purity,
            transparency, and trust.
          </p>
        </section>

        {/* ── Contact CTA ── */}
        <div className="mt-10 sm:mt-12 text-center">
          <p className="text-sm text-black/50 mb-4">
            Have questions about our policies?
          </p>
          <Link
            href="/contact"
            className="inline-block border border-black bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] transition hover:bg-transparent hover:text-black"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}

import Image from "next/image";
import { MessageCircle, Sparkle, Star } from "lucide-react";

// Set once a cut-out subject photo exists (e.g. "/images/hero/patient.webp").
// Until then the mint shape behind the feature card renders on its own as
// an intentional soft background form, not an empty placeholder — nothing
// else about the layout needs to change when the asset arrives.
const heroSubjectImageSrc: string | undefined = undefined;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-clinic-bg">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-clinic-mint/30 bg-clinic-mintLight px-4 py-1.5 text-xs font-semibold text-clinic-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-clinic-mint" />
              Dental Clinic · Bekasi
            </span>
            <h1 className="mt-6 font-sans text-5xl font-light tracking-tight leading-[1.05] text-clinic-text md:text-6xl">
              Modern dental care,{" "}
              <span className="font-semibold text-clinic-navy">built around you.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-clinic-body">
              Premium dental treatment backed by experienced specialists,
              modern equipment, and an AI assistant that answers your
              questions instantly. Available any time of day.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#lead-form"
                className="inline-flex items-center gap-2 rounded-lg bg-clinic-navy px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-clinic-navyDark"
              >
                Book an Appointment
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#ai-demo"
                className="inline-flex items-center gap-2 rounded-lg border border-clinic-mint/20 bg-clinic-mintLight px-6 py-3 font-semibold text-clinic-navy transition-colors hover:bg-white"
              >
                <MessageCircle size={20} strokeWidth={1.75} />
                Ask our AI
              </a>
            </div>

            {/* Pricing transparency called out this early on purpose — a
                multi-branch competitor that routes every price question to
                WhatsApp cannot copy this. Honest, not a claim of being
                cheapest. */}
            <a
              href="#pricing"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-clinic-body transition-colors hover:text-clinic-navy"
            >
              Transparent pricing, real rupiah figures, no calling required
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          {/* Right — feature card overlapping a mint shape reserved for a
              future patient photo. The shape is the layout's image slot:
              set heroSubjectImageSrc above once a cut-out photo exists. */}
          <div className="relative hidden lg:block">
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-10 h-96 w-96 overflow-hidden rounded-full bg-clinic-mintLight"
            >
              {heroSubjectImageSrc && (
                <Image
                  src={heroSubjectImageSrc}
                  alt=""
                  fill
                  sizes="384px"
                  className="object-cover"
                />
              )}
            </div>

            {/* Sparse accent marks — brightness, not dental iconography. */}
            <Sparkle
              aria-hidden="true"
              className="absolute -left-3 top-10 h-5 w-5 text-clinic-mint"
              strokeWidth={1.5}
            />
            <Star
              aria-hidden="true"
              className="absolute right-16 -top-6 h-4 w-4 text-clinic-navy/40"
              strokeWidth={1.5}
            />
            <Sparkle
              aria-hidden="true"
              className="absolute -left-6 bottom-24 h-4 w-4 text-clinic-mint/60"
              strokeWidth={1.5}
            />

            <div className="relative z-10 ml-6 mt-20 rounded-2xl bg-clinic-navy p-8 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-mint">
                Why patients choose us
              </p>
              <h3 className="mt-3 font-sans text-xl font-bold">
                A complete dental experience
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Everything you need, under one roof in central Bekasi.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "AI-powered patient assistant (24/7)",
                  "Digital X-ray & same-day results",
                  "Specialist dentists on staff",
                  "Easy WhatsApp appointment booking",
                  "BPJS & private insurance accepted",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-clinic-mint"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-clinic-mint animate-pulse" />
                  <p className="text-xs font-semibold text-white">
                    AI Assistant · Online Now
                  </p>
                </div>
                <p className="mt-2 text-xs text-white/50">
                  &ldquo;What&apos;s the cost of teeth whitening?&rdquo; Ask
                  anything, get an instant answer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { MessageCircle, Clock, MapPin, CalendarCheck } from "lucide-react";

const heroSubjectImageSrc = "/images/hero/dentist-consultation.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-clinic-bg pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main 2-column Hero Split (modeled after Damessa Bekasi Figma) */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left — Headline, Subtitle & Primary CTA */}
          <div className="min-w-0 lg:col-span-6">
            <h1 className="font-sans text-4xl font-light tracking-tight leading-[1.08] text-clinic-text sm:text-5xl md:text-6xl">
              Modern dental care,{" "}
              <span className="font-semibold text-clinic-navy">
                built around you.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-clinic-body sm:text-lg">
              BrightPath Dental in Bekasi Selatan brings together experienced
              dental specialists, digital X-ray and CAD/CAM technology, and a
              24/7 AI assistant ready to care for children and adults.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <a
                href="#lead-form"
                className="inline-flex items-center gap-2 rounded-full bg-clinic-navy px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-clinic-navyDark"
              >
                <CalendarCheck size={17} strokeWidth={1.75} />
                Book an Appointment
              </a>
              <a
                href="#ai-demo"
                className="inline-flex items-center gap-2 rounded-full border border-clinic-mint/30 bg-clinic-mintLight px-6 py-3.5 text-sm font-semibold text-clinic-navy transition-colors hover:bg-white"
              >
                <MessageCircle size={18} strokeWidth={1.75} />
                Ask our AI
              </a>
            </div>

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

          {/* Right — Consultation Photo with soft organic frame */}
          <div className="relative min-w-0 lg:col-span-6">
            <div
              aria-hidden="true"
              className="absolute -right-6 -top-6 hidden h-64 w-64 rounded-full bg-clinic-mintLight sm:block"
            />
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-clinic-border bg-clinic-mintLight shadow-md">
              <Image
                src={heroSubjectImageSrc}
                alt="Dentist at BrightPath Dental Bekasi explaining a digital panoramic dental X-ray on a tablet to a smiling patient"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Damessa-style Bottom Operational Hours & Address Bar */}
        <div className="mt-10 rounded-2xl border border-clinic-border bg-white p-6 shadow-sm md:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            {/* Jam Operasional */}
            <div className="flex items-start gap-3.5 lg:col-span-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-clinic-mintLight text-clinic-navy">
                <Clock size={20} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-clinic-navy">
                  Operating Hours
                </p>
                <p className="mt-1 text-sm font-medium text-clinic-text">
                  Mon–Fri: 08.00–20.00 WIB
                </p>
                <p className="text-xs text-clinic-muted">
                  Sat: 08.00–17.00 · Sun: 09.00–14.00 WIB
                </p>
              </div>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-3.5 lg:col-span-5 lg:border-l lg:border-clinic-border lg:pl-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-clinic-mintLight text-clinic-navy">
                <MapPin size={20} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-clinic-navy">
                  Clinic Address
                </p>
                <p className="mt-1 text-sm font-medium text-clinic-text">
                  Jl. Ahmad Yani No. 45, Bekasi Selatan
                </p>
                <p className="text-xs text-clinic-muted">
                  Kota Bekasi 17141 · Near Grand Galaxy · Free Parking
                </p>
              </div>
            </div>

            {/* Quick Reservation Actions */}
            <div className="flex flex-wrap items-center gap-3 lg:col-span-3 lg:justify-end">
              <a
                href="#lead-form"
                className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-clinic-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-clinic-navyDark sm:flex-initial"
              >
                Reserve Now
              </a>
              <a
                href="#facility"
                className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-clinic-border bg-clinic-bg px-4 py-2.5 text-xs font-semibold text-clinic-navy transition-colors hover:border-clinic-navy sm:flex-initial"
              >
                Clinic Tour
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

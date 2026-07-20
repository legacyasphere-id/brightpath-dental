import {
  ClipboardCheck,
  Sparkles,
  Anchor,
  Smile,
  ShieldCheck,
  Baby,
  type LucideIcon,
} from "lucide-react";

const services: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ClipboardCheck,
    title: "General Check-up & Cleaning",
    description:
      "Comprehensive oral examination, professional scaling, and polishing to keep your smile healthy.",
  },
  {
    icon: Sparkles,
    title: "Teeth Whitening",
    description:
      "Professional-grade bleaching treatments for noticeably whiter teeth — results in a single session.",
  },
  {
    icon: Anchor,
    title: "Dental Implants",
    description:
      "Permanent tooth replacement that looks, feels, and functions like a natural tooth.",
  },
  {
    icon: Smile,
    title: "Orthodontics & Braces",
    description:
      "Metal, ceramic, and clear aligner options to straighten teeth and correct bite issues.",
  },
  {
    icon: ShieldCheck,
    title: "Root Canal Treatment",
    description:
      "Pain-free endodontic therapy to save infected teeth and eliminate persistent toothaches.",
  },
  {
    icon: Baby,
    title: "Pediatric Dentistry",
    description:
      "Gentle, child-friendly care in a welcoming environment designed for little patients.",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-clinic-surface px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/60">
            What We Offer
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
            Our Services
          </h2>
          <p className="mt-3 max-w-xl text-clinic-body">
            From routine check-ups to advanced restorative work — everything
            under one roof in Bekasi.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group rounded-xl border border-clinic-border bg-clinic-bg p-6 transition-all hover:border-clinic-navy hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinic-mintLight">
                  <Icon size={22} strokeWidth={1.75} className="text-clinic-navy" />
                </div>
                <h3 className="mt-4 font-sans text-base font-semibold text-clinic-text">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-clinic-body">
                  {s.description}
                </p>
                <a
                  href="#lead-form"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-clinic-navy opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Book this service →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

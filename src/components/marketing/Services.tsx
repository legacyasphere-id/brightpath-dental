const services = [
  {
    icon: "🪥",
    title: "General Check-up & Cleaning",
    description:
      "Comprehensive oral examination, professional scaling, and polishing to keep your smile healthy.",
  },
  {
    icon: "✨",
    title: "Teeth Whitening",
    description:
      "Professional-grade bleaching treatments for noticeably whiter teeth — results in a single session.",
  },
  {
    icon: "🦷",
    title: "Dental Implants",
    description:
      "Permanent tooth replacement that looks, feels, and functions like a natural tooth.",
  },
  {
    icon: "😁",
    title: "Orthodontics & Braces",
    description:
      "Metal, ceramic, and clear aligner options to straighten teeth and correct bite issues.",
  },
  {
    icon: "🩹",
    title: "Root Canal Treatment",
    description:
      "Pain-free endodontic therapy to save infected teeth and eliminate persistent toothaches.",
  },
  {
    icon: "👶",
    title: "Pediatric Dentistry",
    description:
      "Gentle, child-friendly care in a welcoming environment designed for little patients.",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-clinic-surface px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
            What We Offer
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold text-clinic-text">
            Our Services
          </h2>
          <p className="mt-3 max-w-xl text-clinic-body">
            From routine check-ups to advanced restorative work — everything
            under one roof in Bekasi.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-xl border border-clinic-border bg-clinic-bg p-6 transition-all hover:border-clinic-navy hover:shadow-md"
            >
              <span className="text-3xl">{s.icon}</span>
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
          ))}
        </div>
      </div>
    </section>
  );
}

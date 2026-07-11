const reasons = [
  {
    icon: "🤖",
    title: "AI-Powered Assistance",
    description:
      "Get instant answers 24/7 via our intelligent AI assistant — from pricing to procedure details, in Bahasa or English.",
  },
  {
    icon: "🔬",
    title: "Modern Equipment",
    description:
      "Digital X-rays, CAD/CAM same-day crowns, and sterilization protocols that exceed Indonesian health standards.",
  },
  {
    icon: "👨‍⚕️",
    title: "Specialist Team",
    description:
      "Every doctor holds an accredited Indonesian dental specialist degree with active clinical experience.",
  },
  {
    icon: "📍",
    title: "Central Bekasi Location",
    description:
      "Conveniently located in central Bekasi with ample parking and easy access from major arterial roads.",
  },
];

const stats = [
  { value: "5,000+", label: "Patients treated" },
  { value: "10+", label: "Years operating" },
  { value: "3", label: "Dental specialists" },
  { value: "98%", label: "Patient satisfaction" },
];

export function WhyUs() {
  return (
    <section className="bg-clinic-navy px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
            Why Choose Us
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold">
            Why BrightPath?
          </h2>
          <p className="mt-3 max-w-xl text-white/65">
            We combine clinical expertise with modern technology to deliver a
            dental experience that&apos;s genuinely different.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-clinic-mint/30"
            >
              <span className="text-3xl">{r.icon}</span>
              <h3 className="mt-4 font-sans text-base font-semibold text-white">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-sans text-3xl font-extrabold text-clinic-mint">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

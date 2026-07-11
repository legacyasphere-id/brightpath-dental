export function Hero() {
  return (
    <section className="relative overflow-hidden bg-clinic-bg">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-clinic-mint opacity-5" />
        <div className="absolute right-32 bottom-0 h-64 w-64 translate-y-1/3 rounded-full bg-clinic-navy opacity-5" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-clinic-mint/30 bg-clinic-mintLight px-4 py-1.5 text-xs font-semibold text-clinic-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-clinic-mint" />
              Dental Clinic · Bekasi
            </span>
            <h1 className="mt-6 font-sans text-4xl font-extrabold leading-tight text-clinic-text md:text-5xl">
              Modern dental care,{" "}
              <span className="text-clinic-navy">built around you.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-clinic-body">
              Premium dental treatment backed by experienced specialists, modern
              equipment, and an AI assistant that answers your questions
              instantly — any time of day.
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
                className="inline-flex items-center gap-2 rounded-lg border border-clinic-border bg-white px-6 py-3 font-semibold text-clinic-navy transition-colors hover:bg-clinic-bg"
              >
                <span aria-hidden>💬</span> Ask our AI
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {[
                { value: "5,000+", label: "Patients Served" },
                { value: "10+", label: "Years Experience" },
                { value: "15+", label: "Dental Services" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-sans text-2xl font-extrabold text-clinic-navy">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-clinic-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card (DanPhe-inspired: dark panel with feature checklist) */}
          <div className="hidden lg:block">
            <div className="rounded-2xl bg-clinic-navy p-8 text-white shadow-xl">
              <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
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
                  "Sterilization above Indonesian standard",
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
                  &ldquo;What&apos;s the cost of teeth whitening?&rdquo; — ask
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

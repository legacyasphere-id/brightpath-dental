const doctors = [
  {
    name: "drg. Anisa Rahma, Sp.KG",
    specialty: "Conservative & Cosmetic Dentistry",
    bio: "10+ years specializing in restorative and cosmetic procedures. Graduate of Universitas Indonesia Faculty of Dentistry.",
    initials: "AR",
    bg: "bg-clinic-navy",
  },
  {
    name: "drg. Budi Santoso, Sp.Ort",
    specialty: "Orthodontics",
    bio: "Specialist in metal braces, ceramic braces, and clear aligner systems. Trusted by 2,000+ orthodontic patients.",
    initials: "BS",
    bg: "bg-clinic-teal",
  },
  {
    name: "drg. Citra Dewi",
    specialty: "Pediatric & General Dentistry",
    bio: "Gentle approach for patients of all ages, with specialized training in child-friendly dental techniques.",
    initials: "CD",
    bg: "bg-clinic-navyDark",
  },
];

export function Doctors() {
  return (
    <section id="doctors" className="bg-clinic-surface px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/60">
            Meet the Team
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
            Our Doctors
          </h2>
          <p className="mt-3 max-w-xl text-clinic-body">
            Experienced dental specialists who put patient comfort and clinical
            excellence first.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <div
              key={doc.name}
              className="rounded-xl border border-clinic-border bg-clinic-bg p-6 transition-shadow hover:shadow-md"
            >
              {/* Avatar */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${doc.bg} font-sans text-lg font-bold text-white`}
              >
                {doc.initials}
              </div>
              <div className="mt-4">
                <h3 className="font-sans text-base font-semibold text-clinic-text">
                  {doc.name}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-clinic-mint">
                  {doc.specialty}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-clinic-body">
                {doc.bio}
              </p>
              <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 text-yellow-400"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-xs text-clinic-muted">5.0</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

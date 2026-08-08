import Image from "next/image";

const doctors = [
  {
    name: "drg. Anisa Rahma, Sp.KG",
    specialty: "Conservative & Cosmetic Dentistry",
    bio: "12+ years specializing in restorative and cosmetic procedures. Graduate of Universitas Indonesia Faculty of Dentistry.",
    photo: "/images/doctors/anisa-rahma.webp",
    alt: "drg. Anisa Rahma, Sp.KG — spesialis konservasi gigi dan estetika",
  },
  {
    name: "drg. Budi Santoso, Sp.Ort",
    specialty: "Orthodontics",
    bio: "9+ years in orthodontics, spanning metal braces, ceramic braces, and clear aligner systems. Trusted by 2,000+ orthodontic patients.",
    photo: "/images/doctors/budi-santoso.webp",
    alt: "drg. Budi Santoso, Sp.Ort — spesialis ortodontik",
  },
  {
    name: "drg. Citra Dewi",
    specialty: "Pediatric & General Dentistry",
    bio: "7+ years with a gentle approach for patients of all ages, backed by specialized training in child-friendly dental techniques.",
    photo: "/images/doctors/citra-dewi.webp",
    alt: "drg. Citra Dewi — dokter gigi umum dan spesialis anak",
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
              <Image
                src={doc.photo}
                alt={doc.alt}
                width={800}
                height={800}
                className="h-14 w-14 rounded-full object-cover"
              />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

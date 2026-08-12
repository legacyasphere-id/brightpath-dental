import Image from "next/image";
import { SECTION_PADDING } from "@/lib/utils";

const doctors = [
  {
    name: "drg. Anisa Rahma",
    // Only Anisa and Budi hold a Sp. title — drg. Citra Dewi does not, and
    // this must never say otherwise (see BRIGHTPATHHANDOFF.md, RUN A).
    credential: "Sp.KG",
    specialty: "Conservative & Cosmetic Dentistry",
    years: "12+",
    university: "Universitas Indonesia",
    bio: "Specializing in restorative and cosmetic procedures.",
    photo: "/images/doctors/anisa-rahma.webp",
    alt: "drg. Anisa Rahma, Sp.KG, spesialis konservasi gigi dan estetika",
  },
  {
    name: "drg. Budi Santoso",
    credential: "Sp.Ort",
    specialty: "Orthodontics",
    years: "9+",
    university: "Universitas Airlangga",
    bio: "Metal braces, ceramic braces, and clear aligner systems. Trusted by 2,000+ orthodontic patients.",
    photo: "/images/doctors/budi-santoso.webp",
    alt: "drg. Budi Santoso, Sp.Ort, spesialis ortodontik",
  },
  {
    name: "drg. Citra Dewi",
    credential: null,
    specialty: "Pediatric & General Dentistry",
    years: "7+",
    university: "Universitas Trisakti",
    bio: "A gentle approach for patients of all ages, backed by specialized training in child-friendly dental techniques.",
    photo: "/images/doctors/citra-dewi.webp",
    alt: "drg. Citra Dewi, dokter gigi umum dan spesialis anak",
  },
];

export function Doctors() {
  return (
    <section id="doctors" className={`bg-clinic-surface ${SECTION_PADDING}`}>
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
              <div className="flex items-center gap-4">
                <Image
                  src={doc.photo}
                  alt={doc.alt}
                  width={800}
                  height={800}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-sans text-base font-semibold text-clinic-text">
                    {doc.name}
                    {doc.credential && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-clinic-mintLight px-2 py-0.5 text-xs font-bold text-clinic-navy">
                        {doc.credential}
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-clinic-mint">
                    {doc.specialty}
                  </p>
                </div>
              </div>

              {/* Years and university were present only in prose before,
                  easy to skim past. Pulled out as their own labeled line so
                  they read as credentials, not filler. */}
              <div className="mt-4 flex items-center gap-4 border-y border-clinic-border py-3 text-sm">
                <div>
                  <p className="font-sans text-lg font-bold text-clinic-navy">
                    {doc.years}
                  </p>
                  <p className="text-xs text-clinic-muted">Years Practice</p>
                </div>
                <div className="h-8 w-px bg-clinic-border" />
                <div>
                  <p className="font-semibold text-clinic-text">{doc.university}</p>
                  <p className="text-xs text-clinic-muted">Graduate</p>
                </div>
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

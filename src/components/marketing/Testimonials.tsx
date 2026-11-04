import { SECTION_PADDING } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Sudah coba beberapa klinik gigi di Bekasi, tapi BrightPath yang paling nyaman. Dokternya ramah, prosedurnya cepat, dan hasilnya memuaskan!",
    name: "Rina S.",
    initial: "R",
    timeAgo: "1 bulan yang lalu",
    treatment: "Teeth Whitening",
    stars: 5,
  },
  {
    quote:
      "Proses pasang kawat giginya profesional banget. AI chat-nya juga sangat membantu. Saya bisa tanya-tanya kapan pun tanpa harus telepon klinik.",
    name: "Dimas P.",
    initial: "D",
    timeAgo: "2 minggu yang lalu",
    treatment: "Orthodontic Braces",
    stars: 5,
  },
  {
    quote:
      "Anak saya yang 6 tahun awalnya takut ke dokter gigi. Di sini tim-nya sangat sabar dan ramah. Sekarang anak saya malah nggak sabar mau kontrol lagi!",
    name: "Ibu Sari W.",
    initial: "S",
    timeAgo: "3 minggu yang lalu",
    treatment: "Pediatric Dentistry",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className={`bg-clinic-bg ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        {/* Damessa Figma Centered Rating Summary Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/75">
            Patient Stories
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
            What patients say
          </h2>
          <div className="mt-4 inline-flex flex-col items-center rounded-2xl border border-clinic-border bg-white px-6 py-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-clinic-navy">
              EXCELLENT · 5.0 RATING
            </span>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-yellow-400"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="mt-1 text-xs text-clinic-muted">
              Trusted by 5,000+ patients in Bekasi
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-clinic-border bg-clinic-surface p-6 shadow-sm"
            >
              {/* Reviewer Header with Initial Circle (Damessa style) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clinic-navy text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clinic-text">
                      {t.name}
                    </p>
                    <p className="text-xs text-clinic-muted">
                      {t.treatment} · {t.timeAgo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-yellow-400"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-clinic-body">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

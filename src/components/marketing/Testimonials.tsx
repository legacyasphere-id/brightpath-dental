const testimonials = [
  {
    quote:
      "Sudah coba beberapa klinik gigi di Bekasi, tapi BrightPath yang paling nyaman. Dokternya ramah, prosedurnya cepat, dan hasilnya memuaskan!",
    name: "Rina S.",
    treatment: "Teeth Whitening",
    stars: 5,
  },
  {
    quote:
      "Proses pasang kawat giginya profesional banget. AI chat-nya juga sangat membantu — saya bisa tanya-tanya kapan pun tanpa harus telepon klinik.",
    name: "Dimas P.",
    treatment: "Orthodontic Braces",
    stars: 5,
  },
  {
    quote:
      "Anak saya yang 6 tahun awalnya takut ke dokter gigi. Di sini tim-nya sangat sabar dan ramah. Sekarang anak saya malah nggak sabar mau kontrol lagi!",
    name: "Ibu Sari W.",
    treatment: "Pediatric Dentistry",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-clinic-bg px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
            Patient Stories
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold text-clinic-text">
            What patients say
          </h2>
          <p className="mt-3 max-w-xl text-clinic-body">
            Real feedback from real patients. We never edit or manufacture
            reviews.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-clinic-border bg-clinic-surface p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
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
              <p className="mt-4 flex-1 text-sm italic leading-relaxed text-clinic-body">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 border-t border-clinic-border pt-4">
                <p className="text-sm font-semibold text-clinic-text">
                  {t.name}
                </p>
                <p className="text-xs text-clinic-muted">{t.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

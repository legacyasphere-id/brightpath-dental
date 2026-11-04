"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useChatWidget } from "@/components/chat/ChatWidget";
import { SECTION_PADDING } from "@/lib/utils";

const sampleQuestions = [
  "Berapa biaya pemutihan gigi?",
  "Apakah ada dokter spesialis ortodonti?",
  "Berapa lama proses perawatan saluran akar?",
  "Apakah menerima BPJS?",
];

export function AIDemo() {
  const { open, openWithMessage } = useChatWidget();

  return (
    <section id="ai-demo" className={`bg-clinic-mintLight ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 rounded-3xl border border-clinic-border bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: 3D Mascot showcase */}
          <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-clinic-mint/20 bg-[#EAF3EF]">
              <Image
                src="/images/mascot/ai-mascot.webp"
                alt="Maskot Asisten AI BrightPath Dental"
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 360px, 90vw"
                className="object-contain p-2"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Floating speech preview */}
            <div className="-mt-5 relative z-10 mx-3 rounded-2xl border border-clinic-border bg-white p-3.5 shadow-md sm:mx-5">
              <p className="text-xs font-semibold text-clinic-navy">
                BrightPath AI · Siap Membantu 24/7
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-clinic-body">
                &ldquo;Halo! Mau cek estimasi biaya perawatan atau jadwal praktik dokter hari ini?&rdquo;
              </p>
            </div>
          </div>

          {/* Right column: Copy, sample chips, and CTA */}
          <div className="min-w-0 lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-clinic-mint">
              Asisten AI · Online 24 Jam
            </p>
            <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-clinic-navy sm:text-4xl">
              Tanya asisten AI kami
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-clinic-body sm:text-base">
              Punya pertanyaan soal prosedur, harga, atau jadwal? Asisten AI
              kami langsung menjawab kapan saja dalam Bahasa Indonesia. Tidak
              perlu menunggu balasan admin.
            </p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-clinic-muted">
              Coba klik salah satu pertanyaan:
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => openWithMessage(q)}
                  className="rounded-full border border-clinic-border bg-clinic-bg px-4 py-2 text-left text-sm text-clinic-body transition-colors hover:border-clinic-mint hover:bg-white hover:text-clinic-navy"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={open}
                className="inline-flex items-center gap-2.5 rounded-full bg-clinic-navy px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-clinic-mint"
              >
                <MessageCircle size={18} strokeWidth={1.75} />
                Mulai Chat Sekarang
              </button>
              <span className="text-xs text-clinic-muted">
                Gratis · Tanpa pendaftaran · Jawaban instan
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

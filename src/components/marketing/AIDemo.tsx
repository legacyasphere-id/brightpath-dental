"use client";

import { MessageCircle } from "lucide-react";
import { useChatWidget } from "@/components/chat/ChatWidget";
import { SECTION_PADDING } from "@/lib/utils";

const sampleQuestions = [
  "Berapa biaya pemutihan gigi?",
  "Apakah ada dokter spesialis ortodonti?",
  "Berapa lama proses perawatan saluran akar?",
  "Apakah menerima BPJS?",
];

// Positioned immediately below the hero, not several sections down — this
// is the single biggest gap a 24-branch competitor's "message us and wait"
// floating button doesn't answer: instant, any hour, in Indonesian,
// grounded in the clinic's own documents.
export function AIDemo() {
  const { open, openWithMessage } = useChatWidget();

  return (
    <section id="ai-demo" className={`bg-clinic-mintLight ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-clinic-mint/30 bg-white px-4 py-1.5 text-xs font-semibold text-clinic-navy">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clinic-mint" />
            Asisten AI · Online 24 Jam
          </span>
          <h2 className="mt-4 font-sans text-4xl font-light tracking-tight text-clinic-text">
            Tanya asisten AI kami
          </h2>
          <p className="mt-3 max-w-lg text-clinic-body">
            Punya pertanyaan soal prosedur, harga, atau jadwal? Asisten AI
            kami langsung menjawab, kapan saja, dalam Bahasa Indonesia.
            Tidak perlu menunggu balasan.
          </p>

          {/* Tap a question, get a real answer — same send path
              ChatEmptyState's own chips use, not a second chat mockup. */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => openWithMessage(q)}
                className="rounded-full border border-clinic-border bg-white px-4 py-2 text-sm text-clinic-body shadow-sm transition-colors hover:border-clinic-mint hover:text-clinic-navy"
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={open}
            className="mt-8 inline-flex items-center gap-3 rounded-xl border border-clinic-mint/30 bg-white px-8 py-4 text-base font-semibold text-clinic-navy shadow-sm transition-colors hover:border-clinic-mint"
          >
            <MessageCircle size={20} strokeWidth={1.75} />
            Mulai Chat Sekarang
          </button>
          <p className="mt-3 text-xs text-clinic-muted">
            Gratis, tanpa pendaftaran, jawaban instan
          </p>
        </div>
      </div>
    </section>
  );
}

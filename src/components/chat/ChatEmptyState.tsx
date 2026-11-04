import Image from "next/image";

// Ordered shortest first so they wrap more evenly in the flex row.
const SUGGESTED_QUESTIONS = [
  "Jam praktik klinik?",
  "Apakah menerima BPJS?",
  "Berapa biaya periksa gigi?",
  "Dokter siapa yang menangani kawat gigi?",
];

// Static, client-side, no API call — renders instantly on open and still
// works when the chat backend is down. The chips steer visitors toward
// specific questions, since open-ended ones retrieve badly against the KB.
export function ChatEmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-4 px-1 py-2">
      <div className="flex items-center gap-3.5 rounded-xl border border-clinic-mint/20 bg-clinic-mintLight/60 p-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-clinic-mint/30 bg-[#EAF3EF]">
          <Image
            src="/images/mascot/ai-mascot-avatar.webp"
            alt="Asisten AI BrightPath Dental"
            fill
            sizes="56px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-clinic-text">
            Halo! Saya asisten AI BrightPath Dental.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-clinic-body">
            Tanya apa saja soal layanan, harga, jadwal dokter, atau lokasi
            klinik.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            className="rounded-full border border-clinic-border bg-clinic-bg px-3 py-1.5 text-xs text-clinic-body transition-colors hover:border-clinic-mint hover:text-clinic-navy"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

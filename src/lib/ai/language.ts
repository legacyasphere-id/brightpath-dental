export type Language = "id" | "en";

// Pure text heuristic, no server dependencies — safe to import from both
// server code (route handlers) and client components (error copy needs the
// same detection the replies use, even when the request never reached the
// server).
export function detectLanguage(text: string): Language {
  const idIndicators = [
    "apa", "berapa", "bagaimana", "apakah", "dimana", "kapan",
    "boleh", "bisa", "tolong", "saya", "mau", "ingin", "harga",
    "dokter", "gigi", "klinik", "jadwal", "janji", "daftar",
    "kawat", "tambal", "cabut", "scaling", "bpjs",
  ];
  const lower = text.toLowerCase();
  const idMatches = idIndicators.filter((w) => lower.includes(w)).length;
  return idMatches >= 2 ? "id" : "en";
}

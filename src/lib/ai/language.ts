export type Language = "id" | "en";

const ID_INDICATORS = [
  "apa", "berapa", "bagaimana", "apakah", "dimana", "kapan",
  "boleh", "bisa", "tolong", "saya", "mau", "ingin", "harga",
  "dokter", "gigi", "klinik", "jadwal", "janji", "daftar",
  "kawat", "tambal", "cabut", "scaling", "bpjs",
];

const EN_INDICATORS = [
  "what", "how", "when", "where", "why", "which",
  "please", "price", "cost", "hour",
  "open", "close", "doctor", "dentist", "book",
  "appointment", "schedule", "service",
  "insurance", "available", "today", "tomorrow",
];

// Pure text heuristic, no server dependencies — safe to import from both
// server code (route handlers) and client components (error copy needs the
// same detection the replies use, even when the request never reached the
// server).
//
// Nearly every visitor to this clinic is Indonesian, so the default has to
// be Indonesian, not English. Classify as "en" only on positive English
// evidence that outweighs any Indonesian evidence; everything else —
// including short or ambiguous text with no evidence either way, like
// "hallo" or "ok" — defaults to "id". This must agree with the LANGUAGE
// RULE in prompts.ts, which already tells the model to do the same thing
// for ambiguous greetings; before this change the two contradicted each
// other whenever this function ran without ever reaching the model (e.g.
// the retrieval-failure error path).
export function detectLanguage(text: string): Language {
  const lower = text.toLowerCase();
  const idMatches = ID_INDICATORS.filter((w) => lower.includes(w)).length;
  const enMatches = EN_INDICATORS.filter((w) => lower.includes(w)).length;
  return enMatches >= 2 && enMatches > idMatches ? "en" : "id";
}

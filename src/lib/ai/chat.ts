const LEAD_KEYWORDS = [
  "book",
  "appointment",
  "schedule",
  "daftar",
  "booking",
  "available",
  "when can i",
  "is there a slot",
  "how do i register",
  "first visit",
  "walk in",
];

export function detectLead(message: string): boolean {
  const lower = message.toLowerCase();
  return LEAD_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Phase 3: stream gpt-4o-mini completions back to the client as SSE.
export async function streamChat(
  _systemPrompt: string,
  _userMessage: string,
): Promise<ReadableStream<Uint8Array>> {
  throw new Error("streamChat is implemented in Phase 3");
}

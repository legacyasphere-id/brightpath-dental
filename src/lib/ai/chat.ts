import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Streams a gpt-4o-mini completion as SSE ("data: <token>\n\n" per chunk,
// "data: [DONE]\n\n" to close). The caller pipes this straight into a
// Response body for the /api/chat route (Phase 3).
export async function streamChat(
  systemPrompt: string,
  userMessage: string,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
  } catch (error) {
    console.error("[ai/chat] streamChat() failed to start:", error);
    throw new Error("Failed to start chat completion — OpenAI request failed");
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) {
            controller.enqueue(encoder.encode(`data: ${token}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("[ai/chat] streamChat() failed mid-stream:", error);
        controller.enqueue(
          encoder.encode(
            `data: [ERROR] I'm having trouble responding right now — please try again or use the booking form.\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });
}

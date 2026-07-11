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

function sseEvent(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

// Streams a gpt-4o-mini completion as SSE — `data: {"content": "<token>"}` per
// chunk, `data: {"requiresLead": true}` once if the accumulated response
// contains booking intent, then `data: [DONE]` to close. The caller returns
// this directly as a Response body for the /api/chat route.
export async function streamChat(
  systemPrompt: string,
  userMessage: string,
): Promise<ReadableStream<Uint8Array>> {
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

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    let fullText = "";

    try {
      for await (const chunk of completion) {
        const token = chunk.choices[0]?.delta?.content ?? "";
        if (token) {
          fullText += token;
          await writer.write(encoder.encode(sseEvent({ content: token })));
        }
      }

      if (detectLead(fullText)) {
        await writer.write(encoder.encode(sseEvent({ requiresLead: true })));
      }
    } catch (error) {
      console.error("[ai/chat] streamChat() failed mid-stream:", error);
      await writer.write(
        encoder.encode(
          sseEvent({
            error:
              "I'm having trouble responding right now — please try again or use the booking form.",
          }),
        ),
      );
    } finally {
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    }
  })();

  return readable;
}

import OpenAI from "openai";
import type { ChatErrorCode } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://brightpath-dental.vercel.app",
    "X-Title": "BrightPath Dental",
  },
});

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

function sseErrorEvent(code: ChatErrorCode, message: string): string {
  return `event: error\ndata: ${JSON.stringify({ code, message })}\n\n`;
}

// A stream that immediately emits a structured error event and closes.
// Used whenever a failure is known before any content could be streamed,
// so the client always gets one consistent SSE shape to parse regardless
// of where in the pipeline the failure happened.
export function errorStream(
  code: ChatErrorCode,
  message: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sseErrorEvent(code, message)));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
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
      model: process.env.OPENAI_CHAT_MODEL ?? "openai/gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
  } catch (error) {
    console.error("[ai/chat] model_failed — failed to start completion:", error);
    return errorStream(
      "model_failed",
      "OpenRouter request failed to start.",
    );
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

      if (fullText === "") {
        // The model stream completed without throwing but produced zero
        // tokens. Left alone this renders as a permanently empty bubble —
        // treat it as an error rather than a valid (empty) reply. An
        // assistant message must never end its life with no content and
        // no error attached.
        console.error(
          "[ai/chat] unknown — model stream closed with zero content",
        );
        await writer.write(
          encoder.encode(
            sseErrorEvent(
              "unknown",
              "Model stream closed with zero content.",
            ),
          ),
        );
      } else if (detectLead(fullText)) {
        await writer.write(encoder.encode(sseEvent({ requiresLead: true })));
      }
    } catch (error) {
      console.error("[ai/chat] model_failed — stream interrupted mid-response:", error);
      await writer.write(
        encoder.encode(
          sseErrorEvent("model_failed", "OpenRouter stream interrupted."),
        ),
      );
    } finally {
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    }
  })();

  return readable;
}

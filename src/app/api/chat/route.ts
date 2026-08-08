import { retrieveContext, detectLanguage } from "@/lib/ai/retrieval";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { streamChat, errorStream } from "@/lib/ai/chat";
import type { ChatRequestBody } from "@/types";

function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, sessionId } = body;

  if (!message || typeof message !== "string") {
    return Response.json({ error: "message is required" }, { status: 400 });
  }
  if (!sessionId || typeof sessionId !== "string") {
    return Response.json({ error: "sessionId is required" }, { status: 400 });
  }

  let chunks;
  try {
    // retrieveContext() embeds the message and calls the match_embeddings()
    // RPC internally, with threshold/top-k read from RAG_SIMILARITY_THRESHOLD
    // (0.7) and RAG_TOP_K — pass 5 explicitly so this endpoint's behavior
    // doesn't silently drift if those env vars ever change.
    chunks = await retrieveContext(message, 5);
  } catch (error) {
    // Supabase unreachable, RPC error, DNS — never fall back to answering
    // without retrieved context. The KB holds prices, schedules, insurance
    // terms, and doctor credentials; a model guessing those from memory
    // would invent them. Failing honestly beats answering confidently and
    // wrong. Returned as an SSE stream (not a plain JSON error) so the
    // client has exactly one response shape to parse regardless of which
    // stage failed.
    console.error("[api/chat] retrieval_failed:", {
      sessionId,
      messageLength: message.length,
      error,
    });
    return sseResponse(
      errorStream("retrieval_failed", "Failed to retrieve KB context."),
    );
  }

  const language = detectLanguage(message);
  const systemPrompt = buildSystemPrompt(chunks, language);

  // streamChat() never throws — a failure to start the completion resolves
  // to an error-and-close stream internally, so this is always a valid SSE
  // response body.
  const stream = await streamChat(systemPrompt, message);
  return sseResponse(stream);
}

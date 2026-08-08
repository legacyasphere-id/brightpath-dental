import { after } from "next/server";
import { retrieveContext, detectLanguage } from "@/lib/ai/retrieval";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { streamChat, errorStream, noContextStream } from "@/lib/ai/chat";
import { logChatTurn } from "@/lib/supabase/logging";
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

  // Computed up front, independent of retrieval, so an error reply follows
  // the same language rule a successful reply would have used — an error
  // is still a reply.
  const language = detectLanguage(message);

  // Logged immediately, regardless of what happens next — scheduled via
  // after() so it doesn't add latency ahead of retrieval. See
  // lib/supabase/logging.ts: never blocks or breaks the response.
  after(() => logChatTurn(sessionId, "user", message, null));

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
    // A retrieval_failed turn still leaves a record of what was asked and
    // why it failed — this is the whole point of logging failed turns too.
    after(() =>
      logChatTurn(
        sessionId,
        "assistant",
        "[retrieval_failed] Failed to retrieve KB context.",
        null,
      ),
    );
    return sseResponse(
      errorStream("retrieval_failed", "Failed to retrieve KB context.", language),
    );
  }

  if (chunks.length === 0) {
    // Retrieval succeeded but matched nothing — not a throw, so the
    // retrieval_failed branch above never sees it. Left alone, this handed
    // the model an empty context block and asked it to answer anyway,
    // which it did, fluently, from its own general knowledge of dentistry.
    // On a medical site that means invented prices, credentials, and
    // services. Zero chunks is a first-class outcome: skip the model
    // entirely and reply honestly instead of trusting a prompt-level
    // instruction to catch it. See BRIGHTPATHHANDOFF.md.
    return sseResponse(noContextStream(language, { sessionId, sources: [] }));
  }

  const systemPrompt = buildSystemPrompt(chunks, language);
  const sources = chunks.map((c) => ({
    chunk_id: c.chunk_id,
    document_name: c.document_name,
    similarity: c.similarity,
  }));

  // streamChat() never throws — a failure to start the completion resolves
  // to an error-and-close stream internally, so this is always a valid SSE
  // response body. It logs the assistant turn itself, once the stream
  // actually settles (success, model_failed, or zero-content), since only
  // it knows the final content.
  const stream = await streamChat(systemPrompt, message, language, {
    sessionId,
    sources,
  });
  return sseResponse(stream);
}

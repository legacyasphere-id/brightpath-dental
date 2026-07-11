import { retrieveContext, detectLanguage } from "@/lib/ai/retrieval";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { streamChat } from "@/lib/ai/chat";
import type { ChatRequestBody } from "@/types";

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
    console.error("[api/chat] retrieval failed:", error);
    return Response.json(
      { error: "Failed to retrieve context" },
      { status: 500 },
    );
  }

  const language = detectLanguage(message);
  const systemPrompt = buildSystemPrompt(chunks, language);

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await streamChat(systemPrompt, message);
  } catch (error) {
    console.error("[api/chat] streamChat failed:", error);
    return Response.json(
      { error: "Failed to start chat stream" },
      { status: 500 },
    );
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

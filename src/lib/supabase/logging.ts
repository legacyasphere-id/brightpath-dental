import { createAnonClient } from "@/lib/supabase/server";
import type { MessageRole, MessageSource } from "@/types";

// Fire-and-forget conversation logging via log_chat_turn() — the anon
// key, same as retrieval. Never throws: a logging failure must never
// block or break the chat response, so every failure is caught and
// logged server-side instead of propagating. Callers can await this
// without their own try/catch, or fire it inside next/server's after()
// so it doesn't add latency to the streamed reply.
export async function logChatTurn(
  sessionId: string,
  role: MessageRole,
  content: string,
  sources: MessageSource[] | null = null,
): Promise<void> {
  try {
    const supabase = createAnonClient();
    const { error } = await supabase.rpc("log_chat_turn", {
      p_session_id: sessionId,
      p_role: role,
      p_content: content,
      p_sources: sources,
    });
    if (error) {
      console.error("[chat/logging] log_chat_turn() failed:", error);
    }
  } catch (error) {
    console.error("[chat/logging] logChatTurn() threw:", error);
  }
}

import { createServiceClient } from "@/lib/supabase/server";
import { embed } from "@/lib/ai/embeddings";
import type { RetrievedChunk } from "@/types";

const DEFAULT_THRESHOLD = Number(process.env.RAG_SIMILARITY_THRESHOLD ?? 0.7);
const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K ?? 5);

// Embeds the query, runs pgvector cosine similarity via the match_embeddings()
// RPC, and returns the top-k chunks above the similarity threshold. An empty
// result is expected and safe — buildSystemPrompt() instructs the model to
// say so rather than invent an answer (see prompts.ts).
export async function retrieveContext(
  query: string,
  k: number = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embed(query);
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("match_embeddings", {
    query_embedding: queryEmbedding,
    match_threshold: DEFAULT_THRESHOLD,
    match_count: k,
  });

  if (error) {
    console.error("[ai/retrieval] match_embeddings() failed:", error);
    throw new Error("Failed to retrieve context — vector search failed");
  }

  type MatchEmbeddingsRow = {
    chunk_id: string;
    document_name: string;
    content: string;
    similarity: number;
  };

  return ((data ?? []) as MatchEmbeddingsRow[]).map((row) => ({
    chunk_id: row.chunk_id,
    document_name: row.document_name,
    content: row.content,
    similarity: row.similarity,
  }));
}

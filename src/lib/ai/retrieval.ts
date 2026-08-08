import { createAnonClient } from "@/lib/supabase/server";
import { embed } from "@/lib/ai/embeddings";
import type { RetrievedChunk } from "@/types";

export { detectLanguage } from "@/lib/ai/language";

// A cosine threshold earns its keep on a large, heterogeneous corpus where
// it excludes off-topic documents. This KB is six chunks, all about one
// small clinic, all mutually relevant — there is nothing off-topic to
// exclude, so a threshold here only produces false negatives on short,
// real visitor questions (a related multi-question query's lowest passing
// chunk scored 0.5128; "ada layanan apa saja?" asked alone scored below
// 0.7 on all six chunks). Left low rather than removed entirely, as a
// floor against genuinely degenerate embeddings (empty/garbage input),
// not as a relevance filter — relevance is the model's job now, via the
// "say I don't know" instruction plus the zero-chunk guard in
// api/chat/route.ts, which is enforced in code and does not depend on
// the model behaving well.
const DEFAULT_THRESHOLD = Number(process.env.RAG_SIMILARITY_THRESHOLD ?? 0.15);
const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K ?? 5);

// Embeds the query, runs pgvector cosine similarity via the match_embeddings()
// RPC, and returns the top-k chunks above the similarity threshold. An empty
// result now short-circuits before the model is ever called — see the
// chunks.length === 0 branch in api/chat/route.ts.
export async function retrieveContext(
  query: string,
  k: number = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embed(query);
  const supabase = createAnonClient();

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

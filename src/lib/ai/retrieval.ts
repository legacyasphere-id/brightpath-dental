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

// Short questions produce diffuse embeddings that sit weakly and
// near-equally far from every chunk — measured directly, not assumed: the
// exact query "ada layanan apa saja?" scored 0.34-0.43 across the KB and
// missed 01-services.txt entirely, but a longer, topically fuller phrasing
// of the same question scored 0.58-0.64 across the board and surfaced it
// at rank one. Every chunk's similarity moved together, not just the one
// document, which is why this expands the query before embedding it rather
// than touching the threshold or the KB content again.
//
// Fixed and generic on purpose, not tuned per question: it prefixes clinic
// context and casts a broad vocabulary net across the KB's whole topic
// space (services, doctors, pricing) rather than guessing which words a
// specific question needs. No extra model call, so no added latency on a
// streaming reply. Retrieval embeds this expanded form; the model still
// answers the user's original, unexpanded message — see api/chat/route.ts,
// which passes `message` (not this) to streamChat().
export function expandQueryForRetrieval(query: string): string {
  return `Pertanyaan pasien klinik gigi BrightPath Dental di Bekasi: "${query}"
Pasien mencari informasi mengenai layanan, perawatan, prosedur, durasi, dokter yang menangani, atau harga yang relevan dengan pertanyaan tersebut.`;
}

// Embeds the (expanded) query, runs pgvector cosine similarity via the
// match_embeddings() RPC, and returns the top-k chunks above the similarity
// threshold. An empty result now short-circuits before the model is ever
// called — see the chunks.length === 0 branch in api/chat/route.ts.
export async function retrieveContext(
  query: string,
  k: number = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embed(expandQueryForRetrieval(query));
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

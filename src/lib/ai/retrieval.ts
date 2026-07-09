import type { RetrievedChunk } from "@/types";

// Phase 2: embed the query, call a pgvector similarity RPC, return top-k chunks.
export async function retrieveContext(
  _query: string,
  _k = 5,
): Promise<RetrievedChunk[]> {
  throw new Error("retrieveContext is implemented in Phase 2");
}

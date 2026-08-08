-- Let the public chat route retrieve KB context via the anon key instead
-- of the service role key, without exposing document_chunks, documents,
-- or embeddings to direct anon reads.
--
-- match_embeddings() was SECURITY INVOKER (the default), so RLS applied
-- to everything it read using the CALLING role's permissions. All three
-- tables it reads are restricted to `authenticated` only ("Admin full
-- access", qual: auth.role() = 'authenticated'), so under anon it always
-- returned zero rows via RLS with no error, or — before this migration —
-- the chat route worked around that entirely by using the service role
-- key, which bypasses RLS on every table, not just these three.
--
-- Making this function SECURITY DEFINER lets it run with the function
-- owner's privileges regardless of caller, so anon can call it and get
-- real results, while the underlying tables stay locked to authenticated
-- and this function becomes the only read surface for anon.
--
-- search_path is pinned explicitly. A SECURITY DEFINER function without
-- a pinned search_path resolves unqualified names against the CALLER's
-- search_path, not a fixed one — a classic Postgres privilege-escalation
-- vector (a malicious public-writable object could shadow a name this
-- function expects). Pinning it closes that off without needing to
-- fully schema-qualify every reference in the query body.
--
-- match_count is clamped server-side rather than trusted as-is. Once
-- this function is executable by anon, any caller can invoke it directly
-- with an arbitrary match_count and page through the whole knowledge
-- base. The content itself is public marketing material, but an
-- uncapped limit on a public RPC is an easy denial-of-service vector for
-- no reason — clamp rather than error, so a bad value just gets a
-- smaller result instead of a failed request.
create or replace function public.match_embeddings(
  query_embedding vector,
  match_threshold double precision default 0.7,
  match_count integer default 5
)
returns table (
  id uuid,
  chunk_id uuid,
  content text,
  document_name text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select
    e.id,
    e.chunk_id,
    dc.content,
    d.name as document_name,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  join document_chunks dc on dc.id = e.chunk_id
  join documents d on d.id = dc.document_id
  where 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$function$;

-- Make the grant surface deliberate rather than inherited from the
-- default PUBLIC grant new functions get.
revoke execute on function public.match_embeddings(vector, double precision, integer) from public;
grant execute on function public.match_embeddings(vector, double precision, integer) to anon, authenticated;

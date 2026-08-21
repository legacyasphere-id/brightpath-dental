-- Supabase Postgres advisor cleanup, three findings from a live security/
-- performance review (get_advisors), verified against the actual policies
-- and indexes on the project before writing this, not assumed from a
-- generic checklist.

-- 1. auth_rls_initplan: every "Admin full access to X" policy called
-- auth.role() directly in its USING clause, which Postgres re-evaluates
-- per row rather than once per statement. Wrapping it in a scalar
-- subquery lets the planner treat it as an InitPlan (evaluated once) —
-- same access, cheaper at scale. Six policies had this pattern; the
-- leads one is handled separately below since it also needs splitting.
alter policy "Admin full access to documents" on documents
  using ((select auth.role()) = 'authenticated');

alter policy "Admin full access to chunks" on document_chunks
  using ((select auth.role()) = 'authenticated');

alter policy "Admin full access to embeddings" on embeddings
  using ((select auth.role()) = 'authenticated');

alter policy "Admin full access to conversations" on conversations
  using ((select auth.role()) = 'authenticated');

alter policy "Admin full access to messages" on messages
  using ((select auth.role()) = 'authenticated');

-- 2. unindexed_foreign_keys: these four FK columns had no covering
-- index, so every cascade delete (documents -> document_chunks ->
-- embeddings, conversations -> messages) and every join on them was a
-- sequential scan of the child table.
create index if not exists idx_conversations_lead_id
  on conversations (lead_id);

create index if not exists idx_document_chunks_document_id
  on document_chunks (document_id);

create index if not exists idx_embeddings_chunk_id
  on embeddings (chunk_id);

create index if not exists idx_messages_conversation_id
  on messages (conversation_id);

-- 3. multiple_permissive_policies on leads: "Admin full access to
-- leads" was FOR ALL, so it already covered INSERT, on top of the
-- separate "Public insert leads" policy — both permissive, both
-- evaluated on every anon/authenticated insert. Postgres policies
-- can't express "ALL except INSERT" in one CREATE POLICY, so the ALL
-- policy is replaced with three single-command policies (carrying the
-- same InitPlan fix as above) and "Public insert leads" stays the one
-- policy that governs INSERT.
drop policy "Admin full access to leads" on leads;

create policy "Admin select leads"
  on leads for select
  using ((select auth.role()) = 'authenticated');

create policy "Admin update leads"
  on leads for update
  using ((select auth.role()) = 'authenticated');

create policy "Admin delete leads"
  on leads for delete
  using ((select auth.role()) = 'authenticated');

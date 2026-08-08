-- Let the public chat route log conversation turns via the anon key
-- without exposing conversations/messages to direct anon read or write.
--
-- Same pattern as 003_match_embeddings_security_definer.sql: a narrow,
-- audited SECURITY DEFINER function is the only access anon gets, the
-- base tables are locked to authenticated (admin) only.
--
-- Before this migration, both tables had "Public insert" (with_check:
-- true) AND "Public select" (qual: true) policies with full anon table
-- grants underneath them. Insert-only would have been permissive but
-- defensible; Public select meant every visitor's chat content, not
-- just messages.sources, was readable by anyone holding the anon key —
-- confirmed live (inserted a row as anon, then read it back as anon,
-- saw the full table). Nothing in the app actually uses anon SELECT on
-- these tables today (no admin conversations page exists yet), so this
-- was pure unused exposure. This is the third permissive default found
-- in this schema in one day, after the chat route's service-role key
-- and document_chunks/documents/embeddings' broad anon table grants —
-- treat any table not explicitly checked as more open than intended.

-- Required for the function's atomic "create conversation if new"
-- upsert. Did not exist before this migration; each browser session
-- generates exactly one sessionId (crypto.randomUUID() per ChatPanel
-- mount), so this is a 1:1 mapping in practice, not just in intent.
alter table conversations
  add constraint conversations_session_id_key unique (session_id);

create or replace function public.log_chat_turn(
  p_session_id text,
  p_role text,
  p_content text,
  p_sources jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_conversation_id uuid;
begin
  -- This is a public, unauthenticated write primitive (unlike
  -- match_embeddings, which only reads) — validate rather than trust
  -- the caller, since anon can invoke this directly with any arguments,
  -- not just through the app's own chat route.
  if p_role not in ('user', 'assistant') then
    raise exception 'log_chat_turn: invalid role %', p_role;
  end if;

  insert into conversations (session_id)
  values (p_session_id)
  on conflict (session_id) do nothing
  returning id into v_conversation_id;

  if v_conversation_id is null then
    select id into v_conversation_id
    from conversations
    where session_id = p_session_id;
  end if;

  -- Cap content length. Without this, anyone with the anon key (public,
  -- shipped to every browser) could use this table as free unlimited
  -- storage. Clamp rather than error, consistent with match_count in
  -- match_embeddings — a bad value degrades gracefully.
  insert into messages (conversation_id, role, content, sources)
  values (v_conversation_id, p_role, left(p_content, 4000), p_sources);
end;
$function$;

revoke execute on function public.log_chat_turn(text, text, text, jsonb) from public;
grant execute on function public.log_chat_turn(text, text, text, jsonb) to anon, authenticated;

-- The function is now the only write path and the sole reason anon
-- needs any access at all. Base tables locked to authenticated
-- (the existing "Admin full access" policies) for a future admin page.
drop policy if exists "Public insert conversations" on conversations;
drop policy if exists "Public select conversations" on conversations;
drop policy if exists "Public insert messages" on messages;
drop policy if exists "Public select messages" on messages;

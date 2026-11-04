-- ADMIN_EMAILS allowlist enforced at the database layer, not just in the
-- Next.js app (admin layout + /api/knowledge GET/POST). Supabase Auth
-- proves *who* signed in; it says nothing about whether that account is
-- supposed to have admin rights. Before this migration, every
-- "Admin full access to X" / "Admin select/update/delete leads" policy
-- only checked auth.role() = 'authenticated' — any account that could
-- sign up (email/password sign-ups are not yet disabled — see the PR
-- this migration ships with) had full admin rights at the database
-- layer, regardless of what the app layer decided.
--
-- admin_emails holds the same allowlist as the app's ADMIN_EMAILS env
-- var. The two have to be kept in sync by hand — a deployed Vercel
-- function's environment isn't readable from Postgres, so there's no
-- way to derive one from the other automatically. To add or remove an
-- admin, update both: the ADMIN_EMAILS env var in Vercel, and this
-- table via the Supabase SQL editor, e.g.:
--   insert into admin_emails (email) values ('someone@brightpathdental.com');
--
-- Direct table access is revoked from anon/authenticated; the only way
-- to query it is through is_admin(), a SECURITY DEFINER function, so a
-- non-admin can't use a failed RLS check to enumerate who IS an admin.
create table if not exists admin_emails (
  email text primary key
);

alter table admin_emails enable row level security;
revoke all on admin_emails from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select exists (
    select 1 from admin_emails
    where lower(email) = lower((select auth.jwt() ->> 'email'))
  );
$function$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Every admin policy's auth.role() check becomes is_admin(). Same
-- InitPlan-friendly shape as migration 005's performance fix — is_admin()
-- already wraps its own auth.jwt() lookup in a subquery, so this doesn't
-- reintroduce a per-row re-evaluation.
alter policy "Admin full access to documents" on documents
  using (is_admin());

alter policy "Admin full access to chunks" on document_chunks
  using (is_admin());

alter policy "Admin full access to embeddings" on embeddings
  using (is_admin());

alter policy "Admin full access to conversations" on conversations
  using (is_admin());

alter policy "Admin full access to messages" on messages
  using (is_admin());

alter policy "Admin select leads" on leads
  using (is_admin());

alter policy "Admin update leads" on leads
  using (is_admin());

alter policy "Admin delete leads" on leads
  using (is_admin());

-- "Public insert leads" (anon, with_check: true) let anyone holding the
-- anon key insert directly into leads, bypassing the app's own
-- validation (zod schema, rate limiting, honeypot — see /api/leads).
-- Confirmed before dropping it that nothing relies on that path: the
-- only place leads are ever inserted is /api/leads/route.ts, and it
-- uses createServiceClient() (service role), which bypasses RLS
-- entirely — this policy was never actually exercised by the real app,
-- only by whoever else had the anon key. No client component talks to
-- Supabase directly for leads (grepped for `.from("leads")` and for any
-- Supabase client call under src/components — the only hit is the API
-- route itself).
drop policy "Public insert leads" on leads;

-- Storage bucket for uploaded clinic documents (knowledge base source files).
-- Private bucket — all access goes through server-side routes using the
-- service role key, which bypasses storage RLS.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

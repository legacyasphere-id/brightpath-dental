-- Enable pgvector
create extension if not exists vector;

-- Settings (clinic config)
create table settings (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      text,
  updated_at timestamptz default now()
);

-- Documents (uploaded knowledge base files)
create table documents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  file_path   text not null,
  file_type   text not null, -- pdf | docx | txt
  file_size   int,
  status      text default 'processing', -- processing | ready | error
  chunk_count int default 0,
  created_at  timestamptz default now()
);

-- Document chunks (text pieces for RAG)
create table document_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content     text not null,
  chunk_index int not null,
  token_count int,
  created_at  timestamptz default now()
);

-- Embeddings (pgvector)
create table embeddings (
  id         uuid primary key default gen_random_uuid(),
  chunk_id   uuid references document_chunks(id) on delete cascade,
  embedding  vector(1536) not null,
  created_at timestamptz default now()
);

create index on embeddings using ivfflat (embedding vector_cosine_ops);

-- Conversations (chat sessions)
create table conversations (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null, -- anonymous browser session
  created_at timestamptz default now(),
  lead_id    uuid -- set when lead is captured
);

-- Messages (individual chat turns)
create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role            text not null, -- user | assistant
  content         text not null,
  sources         jsonb, -- [{chunk_id, document_name, excerpt}]
  created_at      timestamptz default now()
);

-- Leads (captured patient inquiries)
create table leads (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  phone            text not null,
  service_interest text,
  preferred_date   date,
  source           text default 'chat', -- chat | form
  conversation_id  uuid references conversations(id),
  status           text default 'new', -- new | contacted | booked | closed
  notes            text,
  created_at       timestamptz default now()
);

-- RLS: leads readable by authenticated admin only
alter table leads enable row level security;

create policy "Admin can read leads"
  on leads for select to authenticated using (true);

create policy "Anyone can insert leads"
  on leads for insert to anon with check (true);

-- Seed default settings
insert into settings (key, value) values
  ('clinic_name', 'BrightPath Dental'),
  ('clinic_phone', '+62-xxx-xxxx-xxxx'),
  ('clinic_whatsapp', '62xxxxxxxxxx'),
  ('ai_welcome_message',
   'Hi! I am BrightPath AI. Ask me about our services, pricing, or doctors.');

# BrightPath Dental — AI Business Platform Demo

> **AI-powered dental clinic platform** — marketing website + RAG knowledge assistant + lead capture + admin dashboard. Built as the first vertical of Legacya Sphere's reusable AI Business Platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stack: Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Stack: Supabase](https://img.shields.io/badge/Supabase-pgvector-green)](https://supabase.com)

---

## What This Is

BrightPath Dental is a **production-ready demo** of the Legacya Sphere AI Business Platform — a reusable architecture that can be deployed for any industry (clinics, agencies, consultants, SMEs) with minimal customization.

The platform solves the core pipeline every client business needs:

```
Marketing Website → AI Chat (RAG) → Lead Capture → Admin Dashboard
```

**The AI assistant is trained on the clinic's own documents** — services, pricing, doctor profiles, FAQs, policies — and answers patient questions instantly, 24/7, without staff involvement.

---

## Live Demo

> Coming soon — deploy your own in under 10 minutes.

---

## Features

### Patient-Facing
- ✅ Premium marketing website (services, doctors, pricing, testimonials)
- ✅ AI chat widget — answers questions from the clinic's knowledge base
- ✅ Transparent service pricing on homepage
- ✅ Lead capture form — no login, no app download required
- ✅ Mobile-first, sub-3s load time

### AI Layer
- ✅ RAG pipeline — Upload clinic documents → AI answers from them
- ✅ Lead detection — AI surfaces booking form when intent is detected
- ✅ Conversation history saved to Supabase
- ✅ Source attribution — AI cites which document it answered from

### Admin Dashboard
- ✅ Real-time lead inbox — new leads appear instantly
- ✅ Knowledge base management — upload PDFs, DOCX, TXT
- ✅ Chat history review — see what patients asked
- ✅ Supabase Auth — secure admin access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| AI | OpenAI API (embeddings + chat) |
| Deployment | Vercel (Edge Functions) |
| Storage | Supabase Storage (document uploads) |

---

## Project Structure

```
brightpath-dental/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Marketing homepage
│   │   ├── admin/                      # Protected admin area
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── leads/page.tsx          # Leads inbox
│   │   │   └── knowledge/page.tsx      # Knowledge base management
│   │   └── api/
│   │       ├── chat/route.ts           # RAG chat endpoint
│   │       ├── leads/route.ts          # Lead capture endpoint
│   │       └── knowledge/route.ts      # Document upload + embedding
│   ├── components/
│   │   ├── marketing/                  # Homepage sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Doctors.tsx
│   │   │   ├── AIDemo.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── LeadForm.tsx
│   │   ├── chat/                       # AI chat widget
│   │   │   ├── ChatWidget.tsx          # Floating button + panel
│   │   │   ├── ChatMessage.tsx
│   │   │   └── LeadCapture.tsx         # Inline form in chat
│   │   └── admin/                      # Admin UI components
│   │       ├── LeadsTable.tsx
│   │       ├── KnowledgeUpload.tsx
│   │       └── StatsCard.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts               # Browser Supabase client
│       │   └── server.ts               # Server Supabase client
│       └── ai/
│           ├── embeddings.ts           # OpenAI text-embedding-3-small
│           ├── retrieval.ts            # pgvector similarity search
│           ├── prompts.ts              # System prompt builder
│           └── chat.ts                 # GPT-4o-mini + lead detection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # All tables + pgvector setup
├── docs/
│   ├── ARCHITECTURE.md
│   ├── RAG_FLOW.md
│   └── DEPLOYMENT.md
├── .env.example
└── README.md
```

---

## Database Schema

```sql
-- Core tables
users                   -- Supabase Auth (admin users)
documents               -- Uploaded knowledge base files
document_chunks         -- Text chunks from documents
embeddings              -- pgvector embeddings (1536 dims)
conversations           -- Chat sessions
messages                -- Individual chat messages
leads                   -- Captured patient leads
settings                -- Clinic configuration (name, colors, etc.)
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/legacyasphere-id/brightpath-dental.git
cd brightpath-dental
npm install
```

### 2. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (or use cloud project)
supabase start

# Run migrations
supabase db push
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in your keys (see .env.example)
```

### 4. Run development server

```bash
npm run dev
# → http://localhost:3000 (marketing site)
# → http://localhost:3000/admin (admin dashboard)
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Required keys:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

---

## Definition of Done (MVP)

- [ ] Upload clinic documents (PDF, DOCX, TXT)
- [ ] AI answers questions using retrieved document context
- [ ] Visitor submits lead via chat or homepage form
- [ ] Lead appears in admin dashboard in real time
- [ ] Application deploys successfully on Vercel

---

## Roadmap

| Version | Features |
|---------|---------|
| **v1 (MVP)** | Marketing site + AI chat + Lead capture + Admin dashboard |
| v2 | WhatsApp integration + Booking system |
| v3 | Stripe payments + CRM + Analytics |
| v4 | Multi-clinic / multi-tenant support |
| v5 | Voice AI + Multilingual support |

---

## Reusability

This platform is designed to be deployed for any industry by changing:
1. The knowledge base content (upload different documents)
2. The design tokens (colors, fonts, logo)
3. The clinic/business settings (name, services, contact)

The architecture — RAG engine, lead capture, admin dashboard — is identical across all verticals.

**Target industries:** Dental clinics · GP clinics · Law firms · Accounting firms · Consultants · SMEs

---

## Built By

**Legacya Sphere** — AI-Native Business Systems Studio  
[legacya-portofolio.vercel.app](https://legacya-portofolio.vercel.app) · Bekasi, Indonesia

---

## License

MIT — see [LICENSE](LICENSE)

# BrightPath Dental — AI Business Platform

AI-powered dental clinic platform built by [Legacya Sphere](https://legacya-portofolio.vercel.app). Marketing website + RAG knowledge assistant + lead capture + automated lead notifications + admin dashboard.

**Live:** [brightpath-dental.vercel.app](https://brightpath-dental.vercel.app)

---

## What This Is

BrightPath Dental is a production-ready client delivery — the first vertical of Legacya Sphere's reusable AI Business Platform. The same architecture (RAG engine, lead capture, admin panel, automation) can be deployed for any industry with minimal customization.

The core pipeline:

```
Marketing Website → AI Chat (RAG) → Lead Capture → Make.com → Notification → Admin Dashboard
```

The AI assistant is trained on the clinic's own documents — services, pricing, doctor profiles, FAQs — and answers patient questions 24/7 without staff involvement. New leads fire a webhook to Make.com, which can route a notification (WhatsApp, email, Telegram — whatever's configured on the Make.com scenario) to the clinic.

---

## Features

**Patient-Facing**
- Premium marketing website (services, doctors, pricing, testimonials)
- AI chat widget — answers questions from the clinic's knowledge base
- Bahasa Indonesia auto-detection — AI responds in the patient's language
- Lead capture form — no login, no app download required
- Mobile-first, sub-3s load time

**AI Layer**
- RAG pipeline — upload clinic documents → AI answers from them
- Lead detection — AI surfaces booking form when intent is detected
- Bahasa Indonesia / English auto-detect on every message

**Automation**
- Make.com webhook fires on every new lead — wrapped in `next/server`'s `after()` so it survives the serverless function returning its response
- Webhook URL is configurable via env var — route it to WhatsApp, email, Slack, Telegram, or any HTTP target via a Make.com scenario
- Fire-and-forget: a Make.com outage never delays or breaks lead capture

**Admin Dashboard**
- Lead inbox — all captured leads with name, phone, service interest, notes
- Knowledge base management — upload PDFs, DOCX, TXT with drag & drop
- Supabase Auth — secure admin access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| AI | GPT-4o-mini (chat) + text-embedding-3-small (RAG), via OpenRouter |
| Automation | Make.com webhook |
| Deployment | Vercel |
| Testing | Playwright (E2E) + Vitest (unit) |

---

## Project Structure

```
brightpath-dental/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Marketing homepage
│   │   ├── admin/
│   │   │   ├── login/page.tsx              # Admin sign-in
│   │   │   └── (protected)/                # Auth-guarded admin routes
│   │   │       ├── layout.tsx              # Auth guard
│   │   │       ├── page.tsx                # Dashboard overview
│   │   │       ├── leads/page.tsx          # Leads inbox
│   │   │       └── knowledge/page.tsx      # Knowledge base management
│   │   └── api/
│   │       ├── chat/route.ts               # RAG chat endpoint (SSE streaming)
│   │       ├── leads/route.ts              # Lead capture + Make.com webhook
│   │       └── knowledge/route.ts          # Document upload + embedding
│   ├── components/
│   │   ├── marketing/                      # Homepage sections
│   │   ├── chat/                           # AI chat widget
│   │   └── admin/                          # Admin UI (LeadsTable, KnowledgeUpload)
│   ├── lib/
│   │   ├── supabase/                       # Browser + server clients
│   │   └── ai/                             # Embeddings, retrieval, prompts, chat
│   ├── types/                              # Shared TypeScript types
│   └── __tests__/                          # Vitest unit tests
├── tests/                                  # Playwright E2E tests
│   ├── homepage.spec.ts
│   ├── chat.spec.ts
│   ├── lead-form.spec.ts
│   └── admin.spec.ts
├── supabase/
│   └── migrations/                         # All tables + pgvector setup
├── .env.example
└── README.md
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
Create a project at [supabase.com](https://supabase.com), then run the migration:
```bash
# Paste contents of supabase/migrations/001_initial_schema.sql into the Supabase SQL Editor
```

### 3. Configure environment
```bash
cp .env.example .env.local
# Fill in your keys (see Environment Variables below)
```

### 4. Run development server
```bash
npm run dev
# → http://localhost:3000        (marketing site)
# → http://localhost:3000/admin  (admin dashboard)
```

### 5. Run tests
```bash
npm run test          # Playwright E2E (requires dev server running)
npm run test:unit     # Unit tests (Vitest)
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (via OpenRouter)
OPENAI_API_KEY=

# Make.com (optional — skip to disable lead notifications)
MAKECOM_WEBHOOK_URL=
```

See [`.env.example`](.env.example) for the full list.

---

## Roadmap

| Version | Features |
|---------|---------|
| v1 (shipped) | Marketing site · AI chat (RAG) · Lead capture · Make.com automation · Admin dashboard |
| v2 | Booking calendar · WhatsApp Business integration |
| v3 | Stripe payments · CRM · Analytics |
| v4 | Multi-clinic / multi-tenant support |
| v5 | Voice AI · Multilingual support |

---

## Reusability

Deploy for any industry by changing:
- The knowledge base content (upload different documents)
- The design tokens (colors, fonts, logo)
- The clinic/business name and contact info

The architecture — RAG engine, lead capture, admin dashboard, automation — is identical across all verticals.

**Target industries:** Dental clinics · GP clinics · Law firms · Accounting firms · Consultants · SMEs

---

## Built By

[Legacya Sphere](https://legacya-portofolio.vercel.app) — AI-Native Business Systems Studio
Bekasi, Indonesia

---

## License

MIT — see [LICENSE](LICENSE)

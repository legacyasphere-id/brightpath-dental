# BrightPath Dental

AI-powered dental clinic platform: marketing site, RAG-grounded chat assistant, lead capture, and an admin dashboard. Built by [Legacya Sphere](https://legacya-portofolio.vercel.app).

**Live:** [brightpath-dental.vercel.app](https://brightpath-dental.vercel.app)

For the story of how this system reached its current shape, including bugs found, diagnoses that were wrong before they were right, and the reasoning behind each design decision, see [`BRIGHTPATHHANDOFF.md`](./BRIGHTPATHHANDOFF.md). This file describes what the system does now.

---

## What this is

A patient visits the site, opens the chat widget, and asks a question in Bahasa Indonesia or English. The assistant answers only from the clinic's own documents (services, pricing, doctors, FAQs), never from its own general knowledge. If a visitor shows booking intent, the widget collects their details and the lead lands in Supabase, triggers an optional Make.com webhook, and shows up in the admin dashboard.

The two properties that make that safe to run on a medical site are both enforced in code, not in the system prompt. See below for why that distinction matters.

---

## Architecture

### The chat request lifecycle

1. The message arrives at `POST /api/chat`. Language is detected (`detectLanguage()`, Indonesian by default, English only on positive evidence) so the reply and any error state match the language the visitor is writing in.
2. The user's turn is logged immediately via `log_chat_turn()`, independent of what happens next.
3. Before the message is embedded for retrieval, it is expanded: `expandQueryForRetrieval()` wraps it in a fixed template that adds clinic context and vocabulary spanning the knowledge base's topic space. Short questions produce diffuse embeddings that sit weakly and near equally far from every document, which made retrieval unreliable for exactly the short questions real visitors ask. The expansion is query side only. The model still answers the visitor's original, unexpanded message.
4. Retrieval runs against Supabase via `match_embeddings()`, a `SECURITY DEFINER` Postgres function, filtered by `RAG_SIMILARITY_THRESHOLD` and limited to `RAG_TOP_K` results.
5. **If retrieval returns zero chunks, the model is never called.** The route short circuits to a fixed, language matched reply that says the assistant does not have that information and offers the clinic's WhatsApp number. See "Why the zero context guard lives in code" below.
6. If chunks were retrieved, the system prompt is built from them and the reply streams back over Server Sent Events, one `{"content": "..."}` frame per token, ending in `data: [DONE]`.
7. The assistant's turn is logged once the stream settles, with `sources` recording which chunks were used and at what similarity, whatever the outcome.

### Why the zero context guard lives in code, not in prompt wording

Earlier versions of this system relied on an instruction telling the model to say it did not know the answer when the context did not cover the question. That instruction worked reliably for topics the model had no opinion on, and failed exactly once: a visitor asked what services the clinic offers, retrieval returned nothing, and the model answered anyway from its own general knowledge of dentistry. It invented a service the clinic does not offer and omitted the clinic's highest value one.

The instruction was not poorly worded. It failed because a language model's confidence in its own general knowledge and its willingness to say "I don't know" are inversely related, and a prompt cannot change that relationship no matter how it is phrased. A stronger instruction would only move the failure to the next topic the model happens to know well. The fix is a plain `chunks.length === 0` check in `api/chat/route.ts` that runs before the system prompt is ever built. It does not depend on the model's judgment at all.

### Why conversation logging is not optional

`messages.sources` records which chunks were retrieved and at what similarity for every assistant reply, success or failure. It exists specifically so retrieval can be debugged from real traffic instead of guessed at from first principles. The bug described above was found by reading that column back after a real production question, not by reasoning about the knowledge base's structure. An earlier diagnosis of a related symptom, made before this logging existed, reasoned from corpus size instead and was wrong. Do not remove `messages.sources` or make it optional. It is the only way retrieval failures on this system are ever actually diagnosed rather than guessed at.

### Least privilege data access

The public chat route never holds a credential that can bypass Postgres row level security. `retrieveContext()` and `log_chat_turn()` both run through `createAnonClient()`, the same anon key already shipped to every browser. Two `SECURITY DEFINER` functions, `match_embeddings()` and `log_chat_turn()`, are the only way the anon key can touch the knowledge base and conversation tables: both have a pinned `search_path`, `EXECUTE` revoked from `PUBLIC` and granted explicitly to `anon`, and `log_chat_turn()` additionally clamps content length and validates the message role before it writes anything. `conversations` and `messages` have no direct anon read or write policy at all. `log_chat_turn()` is the only write path into either table. The service role key is used only by `/api/leads` and the admin knowledge upload route, which have a legitimate need for elevated writes and are not reachable by an anonymous visitor's browser session in the same way the chat route is.

### Reliability

`GET /api/health` runs a cheap read against Supabase through the anon client and returns HTTP 200 with `db: true` when it succeeds, HTTP 503 otherwise, so an uptime monitor can key on status code alone. It is unauthenticated on purpose, since both an external monitor and Vercel's own cron need to reach it without a session. `vercel.json` runs it once daily, which keeps Supabase's free tier project from pausing after seven idle days, the exact condition that caused an earlier outage.

### Social preview

`opengraph-image.tsx` generates the 1200x630 share image at request time from JSX via `next/og`, using the same brand colors and logo mark as the header, rather than a static file that can drift out of sync with a redesign. `twitter-image.tsx` re-exports it directly. `icon.svg`, `apple-icon.tsx`, and a maskable `icon-512.png` route cover the rest of the icon surface, and `favicon.ico` is a real multi size ICO generated by `scripts/generate-favicon.mjs` rather than a single low resolution fallback.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) and TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL and pgvector) |
| Auth | Supabase Auth |
| AI | GPT-4o-mini (chat) and text-embedding-3-small (RAG), via OpenRouter |
| Automation | Make.com webhook |
| Deployment | Vercel |
| Testing | Playwright (E2E) and Vitest (unit) |

---

## Project structure

```
brightpath-dental/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Marketing homepage
│   │   ├── layout.tsx                       # Root layout, metadata, OG/Twitter config
│   │   ├── opengraph-image.tsx              # OG image, generated via next/og
│   │   ├── twitter-image.tsx                # Re-exports the OG image
│   │   ├── apple-icon.tsx                   # 180x180 icon, generated
│   │   ├── icon.svg                         # Static scalable favicon
│   │   ├── icon-512.png/route.tsx           # Maskable icon for the web manifest
│   │   ├── manifest.ts                      # Web app manifest
│   │   ├── admin/
│   │   │   ├── login/page.tsx               # Admin sign-in
│   │   │   └── (protected)/                 # Auth-guarded admin routes
│   │   │       ├── layout.tsx               # Auth guard
│   │   │       ├── page.tsx                 # Dashboard overview
│   │   │       ├── leads/page.tsx           # Leads inbox
│   │   │       └── knowledge/page.tsx       # Knowledge base management
│   │   └── api/
│   │       ├── chat/route.ts                # RAG chat endpoint, SSE streaming
│   │       ├── leads/route.ts                # Lead capture and Make.com webhook
│   │       ├── knowledge/route.ts            # Document upload, chunking, embedding
│   │       └── health/route.ts               # Uptime check, hit by the daily cron
│   ├── components/
│   │   ├── marketing/                        # Homepage sections
│   │   ├── chat/                             # Chat widget, empty state, error card
│   │   └── admin/                            # Leads table, knowledge upload UI
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                     # Anon, service role, and session clients
│   │   │   ├── client.ts                     # Browser client
│   │   │   └── logging.ts                    # log_chat_turn() wrapper
│   │   └── ai/
│   │       ├── embeddings.ts                 # embed() via OpenRouter
│   │       ├── retrieval.ts                  # Query expansion, match_embeddings() call
│   │       ├── prompts.ts                    # System prompt builder
│   │       ├── chat.ts                       # Streaming completion, SSE protocol
│   │       └── language.ts                   # detectLanguage(), no server dependencies
│   ├── types/                                # Shared TypeScript types
│   └── __tests__/                            # Vitest unit tests
├── tests/                                    # Playwright E2E tests
├── supabase/
│   └── migrations/                           # Schema, RLS policies, SECURITY DEFINER functions
├── scripts/
│   └── generate-favicon.mjs                  # Regenerates favicon.ico from the brand mark
├── vercel.json                               # Daily keep-alive cron for /api/health
├── .env.example
└── README.md
```

---

## Getting started

### 1. Clone and install
```bash
git clone https://github.com/legacyasphere-id/brightpath-dental.git
cd brightpath-dental
npm install
```

### 2. Set up Supabase
Create a project at [supabase.com](https://supabase.com), then run every file in `supabase/migrations/` against it, in order, via the SQL Editor. The later migrations depend on tables the earlier ones create.

### 3. Configure environment
```bash
cp .env.example .env.local
# Fill in your keys, see Environment Variables below
```

### 4. Run the development server
```bash
npm run dev
# http://localhost:3000        marketing site
# http://localhost:3000/admin  admin dashboard
```

### 5. Run tests
```bash
npm run test:unit     # Vitest, no running server required
npm run test          # Playwright E2E, requires the dev server running
```

---

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI, via OpenRouter
OPENAI_API_KEY=

# Make.com, optional. Leave unset to skip lead notifications entirely.
MAKECOM_WEBHOOK_URL=
```

See [`.env.example`](.env.example) for the full list, including RAG tuning knobs (`RAG_TOP_K`, `RAG_SIMILARITY_THRESHOLD`, chunking size and overlap).

**Key formats.** Supabase's project API keys have moved to a new format. `SUPABASE_SERVICE_ROLE_KEY` now expects the new `sb_secret_...` service role key, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` expects the new publishable key that replaces the legacy anon JWT. Both are read by name only in this codebase, `src/lib/supabase/server.ts`, so either the new format or the legacy JWT format works as long as the value in Vercel actually matches what Supabase currently issues for that role. If Supabase's legacy JWTs are disabled on the project, the old-format values stop working even if they are still present in Vercel, since validation happens on Supabase's side, not this codebase's.

**On Vercel, do not mark `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Sensitive.** Sensitive environment variables are withheld from the build step and only injected at runtime. Next.js needs `NEXT_PUBLIC_` values available during `next build` to embed them correctly. `SUPABASE_SERVICE_ROLE_KEY` and `MAKECOM_WEBHOOK_URL` are server only secrets and should stay marked Sensitive.

---

## Testing

- **Unit tests** (`src/__tests__/`, Vitest): retrieval and query expansion, the zero context guard, prompt construction, language detection, lead and health API routes, markdown rendering in the chat bubble.
- **E2E tests** (`tests/`, Playwright): homepage sections, the chat widget's empty state and error handling, the lead form, and the admin routes.
- Vitest mocks the Supabase and OpenAI clients directly, so `npm run test:unit` needs no environment variables at all. Playwright starts a real `next dev` server, which needs `.env.local` populated (placeholder values are enough, see `.env.example`), since some clients are constructed at module load and throw on an empty key even before any network call happens. Playwright's own tests then mock the network calls themselves rather than depending on live credentials.

---

## Roadmap

| Version | Features |
|---|---|
| v1 (shipped) | Marketing site, AI chat (RAG), lead capture, Make.com automation, admin dashboard |
| v2 | Booking calendar, WhatsApp Business integration |
| v3 | Stripe payments, CRM, analytics |
| v4 | Multi clinic, multi tenant support |
| v5 | Voice AI, multilingual support |

---

## Reusability

Deploy for a different business by changing the knowledge base content, the design tokens, and the business name and contact info. The architecture, RAG engine, lead capture, admin dashboard, automation, is identical across verticals.

**Target industries:** dental clinics, GP clinics, law firms, accounting firms, consultants, SMEs.

---

## Built by

[Legacya Sphere](https://legacya-portofolio.vercel.app), AI-Native Business Systems Studio
Bekasi, Indonesia

---

## License

MIT, see [LICENSE](LICENSE)

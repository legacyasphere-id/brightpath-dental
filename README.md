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

### Admin access, rate limiting, and request validation

Admin routes no longer trust a valid Supabase session on its own. `ADMIN_EMAILS` (comma-separated) is checked in two places that have to agree independently: the admin layout and `/api/knowledge` call `isAdminEmail()` (`src/lib/auth/admin.ts`) and reject anyone signed in but not on the list, signing them out server-side rather than only redirecting; the same allowlist is enforced again at the database layer by an `is_admin()` `SECURITY DEFINER` function (migration 006) wired into every admin RLS policy, so a stolen service credential or a bug in the app-layer check still can't read or write admin-only tables for an account that isn't on the list. The two checks live in different places on purpose. `admin_emails` (the database table) and `ADMIN_EMAILS` (the env var) have to be kept in sync by hand, since nothing running in Postgres can read a deployed function's environment. **If `admin_emails` has no rows, `is_admin()` returns false for every account, including the real admin.** See "Set up Supabase" above for the order this has to happen in.

`/api/chat` and `/api/leads` are both rate limited per IP (`src/lib/rate-limit.ts`, Upstash Ratelimit, sliding window) and fail open with a one-time logged warning when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` aren't set, rather than the routes going down over a missing optional dependency. `/api/chat` additionally caps message length at 1000 characters and requires `sessionId` to be a valid UUID; `/api/leads` validates its whole body against a zod schema (name and phone length and format, `source` restricted to `chat`/`form`, `conversationId` as a UUID when present) and carries a honeypot field in both lead forms that makes a bot-filled submission report success without writing a row.

`/api/knowledge` sanitizes the uploaded filename before it becomes part of the Supabase Storage key (`sanitizeFilename()`, strips any directory component and anything outside a conservative character set) and checks the file's actual bytes against its claimed extension (`matchesFileSignature()`, PDF and DOCX magic numbers) rather than trusting the extension alone.

`next.config.ts` sets a Content-Security-Policy scoped to the app's own origin plus Supabase, `frame-ancestors 'none'` and `X-Frame-Options: DENY` against clickjacking, `Referrer-Policy`, and a `Permissions-Policy` that turns off camera/microphone/geolocation. `src/middleware.ts` refreshes the Supabase session cookie on `/admin/*` and `/api/knowledge/*` only, not on the public, anonymous chat and lead routes, where it would add a Supabase Auth round trip to every request for a session that never exists there.

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
| Validation | Zod |
| Rate limiting | Upstash Ratelimit (Redis REST), optional, fails open when unconfigured |
| Automation | Make.com webhook |
| Deployment | Vercel |
| Testing | Playwright (E2E) and Vitest (unit) |

---

## Project structure

```
brightpath-dental/
├── src/
│   ├── middleware.ts                        # Supabase session refresh, /admin and /api/knowledge only
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
│   │   │       ├── layout.tsx               # Auth guard + ADMIN_EMAILS allowlist
│   │   │       ├── page.tsx                 # Dashboard overview
│   │   │       ├── leads/page.tsx           # Leads inbox
│   │   │       └── knowledge/page.tsx       # Knowledge base management
│   │   └── api/
│   │       ├── chat/route.ts                # RAG chat endpoint, SSE streaming, rate limited
│   │       ├── leads/route.ts                # Lead capture, zod validation, rate limited, honeypot
│   │       ├── knowledge/route.ts            # Document upload, chunking, embedding, admin-only
│   │       └── health/route.ts               # Uptime check, hit by the daily cron
│   ├── components/
│   │   ├── marketing/                        # Homepage sections (hero, services, doctors, FAQ, facility tour, ...)
│   │   ├── chat/                             # Chat widget, empty state, error card
│   │   └── admin/                            # Leads table, knowledge upload UI
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                     # Anon, service role, and session clients
│   │   │   ├── client.ts                     # Browser client
│   │   │   └── logging.ts                    # log_chat_turn() wrapper
│   │   ├── auth/
│   │   │   └── admin.ts                      # isAdminEmail(), reads ADMIN_EMAILS
│   │   ├── rate-limit.ts                     # Upstash-backed per-IP limiter, fails open
│   │   ├── validation.ts                     # zod lead schema, chat UUID/length checks
│   │   ├── files.ts                          # Upload filename sanitization, PDF/DOCX signature check
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
│   └── migrations/                           # Schema, RLS policies, SECURITY DEFINER functions, admin_emails/is_admin()
├── scripts/
│   └── generate-favicon.mjs                  # Regenerates favicon.ico from the brand mark
├── next.config.ts                            # CSP and other security headers
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

Migration 006 adds the `admin_emails` table that backs the database-layer admin check. Seed it with your real admin address(es) in the same sitting you set `ADMIN_EMAILS` below, not before and not separately:
```sql
insert into admin_emails (email) values ('you@yourdomain.com');
```
Until that row exists, every admin RLS check fails closed for everyone, including a legitimately signed-in admin.

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

# Admin allowlist, comma-separated. Keep in sync with the admin_emails
# table (migration 006). See "Set up Supabase" above.
ADMIN_EMAILS=

# Make.com, optional. Leave unset to skip lead notifications entirely.
MAKECOM_WEBHOOK_URL=

# Upstash Redis REST, optional. Rate limiting is skipped (not blocked)
# when either is unset. See "Admin access, rate limiting, and request
# validation" above.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

See [`.env.example`](.env.example) for the full list, including RAG tuning knobs (`RAG_TOP_K`, `RAG_SIMILARITY_THRESHOLD`, chunking size and overlap).

**Key formats.** Supabase's project API keys have moved to a new format. `SUPABASE_SERVICE_ROLE_KEY` now expects the new `sb_secret_...` service role key, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` expects the new publishable key that replaces the legacy anon JWT. Both are read by name only in this codebase, `src/lib/supabase/server.ts`, so either the new format or the legacy JWT format works as long as the value in Vercel actually matches what Supabase currently issues for that role. If Supabase's legacy JWTs are disabled on the project, the old-format values stop working even if they are still present in Vercel, since validation happens on Supabase's side, not this codebase's.

**On Vercel, do not mark `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Sensitive.** Sensitive environment variables are withheld from the build step and only injected at runtime. Next.js needs `NEXT_PUBLIC_` values available during `next build` to embed them correctly. `SUPABASE_SERVICE_ROLE_KEY` and `MAKECOM_WEBHOOK_URL` are server only secrets and should stay marked Sensitive.

**Scope every variable to Preview as well as Production**, not just Production. `SUPABASE_SERVICE_ROLE_KEY` missing from Preview throws `supabaseKey is required.` on `/api/leads` and `/api/knowledge` for any Preview deployment that exercises either route; `NEXT_PUBLIC_SUPABASE_URL` missing from Preview breaks Supabase client construction everywhere, not just those two routes.

---

## Testing

- **Unit tests** (`src/__tests__/`, Vitest): retrieval and query expansion, the zero context guard, prompt construction, language detection, lead and health API routes, markdown rendering in the chat bubble, rate limiting (fail-open behavior with and without Upstash configured), the admin allowlist, chat message/UUID validation, the leads zod schema and honeypot, and upload filename sanitization and signature checking.
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

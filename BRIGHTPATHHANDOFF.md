# BrightPath Dental — Full Handoff

Single source of truth for the current polish pass. Drop at repo root. Work one run per session, in the order given. Do not batch runs.

Last updated: Aug 8, 2026

---

## 1. Project context

Next.js marketing site for **BrightPath Dental**, a fictional clinic in Bekasi, Indonesia. **This is a portfolio project, not a live client.** No real patients, no real dentists.

Stack: Next.js (App Router) · Supabase (Postgres + pgvector) · OpenRouter · Make.com webhook for lead notification · Vercel (Hobby) · Vitest + Playwright.

Live at `brightpath-dental.vercel.app`.

The site works. This pass is about it not *looking* like it was generated in an afternoon, and about the chat feature being trustworthy enough to demo.

---

## 2. Current state

### Resolved

**Supabase outage (Aug 7).** `/api/chat` returned 500 because the Supabase project had been paused by free-tier inactivity — DNS withdrawn, `match_embeddings()` failed with `getaddrinfo ENOTFOUND`. Project restored, now `ACTIVE_HEALTHY`. **No code change was needed. Do not go looking for a bug in the chat route from that incident.**

**Run 1 — language fix.** `detectLanguage("hallo")` matched 0 of 23 Indonesian indicator words, fell to the English branch, and the model read "hallo" as German. Fixed with an explicit language rule in `src/lib/ai/prompts.ts` ahead of the branch. `detectLanguage()` itself was not changed — the rule is a guard rail over a weak detector, so other ambiguous words may still route oddly.
Branch: `fix/chat-language-detection` · pushed, no PR.
⚠️ **Unverified.** The specs passed vacuously: sandbox egress to `openrouter.ai` is blocked, retrieval throws, the assistant bubble stays `""`, and an empty string trivially contains no German. Deploy to a Vercel preview and type `hallo` to actually confirm.

**Run 6 — doctor portraits.** Three sourced portraits replace the `AR` / `BS` / `CD` initial circles. Cropped 1:1 with normalized head scale, Anisa's grey-green backdrop lifted toward white, Lanczos upscale to 800×800, WebP q82 at 10–15KB each.
Branch: `feat/doctor-portraits` · pushed, no PR.

**Copy cleanup.** Completed in an earlier session.
Branch: `chore/copy-cleanup-pass` · **merged** (PR #12).

**RUN 0 — merge sweep.** `chore/copy-cleanup-pass` (#12), `fix/chat-language-detection` (#13), and `feat/doctor-portraits` (#14) all merged cleanly into `main`, in that order, after a conflict-free dry run in a scratch worktree. `docs/handoff` (#11, this file) merged too. The language fix is still unverified live — see above.

**RUN A — contradicted facts (page vs. KB).** Cross-checked every number on the page against the live Supabase KB. Fixed: the "every doctor is a specialist" claim (WhyUs + ProofStrip — drg. Citra Dewi has no `Sp.` title), Hero's "15+ Dental Services" stat (corrected to 6, matching what's actually listed), and doctor bios understated experience (Anisa 10+ → 12+ yrs, added years for Budi/Citra to match the KB). Pricing was investigated and left unchanged — the "Basic Check-up" Rp150.000 bundle price actually matches 2 of 3 KB documents; the brief's suspected mismatch was a bad comparison (bundle price vs. exam-only price, not the same service).
Branch: `fix/contradicted-facts` · pushed, no PR.

**RUN A2 — knowledge base sync.** The remaining contradictions were inside the KB itself, not the page:
- Stale WhatsApp/phone numbers (`+62 812-8888-8888` / `+62 21-8888-8888`) in `04-clinic-info.txt` and `05-faq.txt`, left over from before the copy-cleanup phone number change. Realigned to the real numbers and — since the clinic previously had no WhatsApp number published anywhere on the site despite multiple WhatsApp-dependent CTAs — added a real one (`+62 812-2946-7180`) rather than collapsing to a single number. Wired into `Footer.tsx` and into `LeadForm.tsx`'s post-submit flow (opens a prefilled `wa.me` link after the lead is saved to Supabase — the submit button already posts to `/api/leads` and fires the Make.com webhook, so that pipeline was preserved rather than replaced).
- `02-pricing.txt`'s scaling price contradicted `05-faq.txt`/`01-services.txt` (itemized 100k+150k=250k vs. bundle total 150k). Reworded `02-pricing.txt` to state the bundle total explicitly.
- Footer hours: `Mon–Sat: 08.00–20.00` incorrectly folded Saturday into the weekday range. KB says Saturday closes at 17.00. Footer corrected to three lines (Mon–Fri / Sat / Sun), KB treated as source of truth per direction.
- All edits applied directly to `document_chunks.content` via SQL (not through the upload pipeline), verified with a fresh query, and cross-checked via `match_embeddings()` using each chunk's own stored vector (similarity 1.0) to confirm retrieval serves the new text. See the follow-up note below on why this is safe.
Branch: `fix/contradicted-facts` · pushed, no PR.

**Follow-up: stale embedding vectors.** `match_embeddings()` joins `document_chunks` live and returns `dc.content` at query time — the embedding vector is only used for similarity ranking, not as a cached copy of the text. So editing chunk content directly (as in RUN A2) takes effect immediately for what the bot quotes, without re-embedding. The vectors for the three edited chunks are now stale relative to the text (computed from the old wording), which is harmless for a phone number, an hours tweak, or a pricing clarification — it would only start to matter if a chunk's topic changed substantially enough to shift which queries retrieve it. Re-embedding through the real pipeline (`/api/knowledge` → `embed()`) requires OpenRouter, which this sandbox can't reach — do a proper re-embed of `04-clinic-info.txt`, `05-faq.txt`, and `02-pricing.txt` next time this runs somewhere with live OpenRouter access.

**RUN B — kill the empty chat bubble.** `/api/chat` now classifies failures (`retrieval_failed` / `model_failed` / `unknown`), always responds with a structured SSE `event: error` frame instead of a plain JSON 500 or a silent close, and never falls back to answering without KB context. Client replaces the pending bubble with a visible Indonesian error state (WhatsApp fallback link, retry button); a stream that closes with zero content and no error event is treated as an error too. Error copy follows the same language rule as real replies (`detectLanguage()`, extracted to `src/lib/ai/language.ts` so both server and client can use it).
Branch: `fix/chat-error-handling` · **merged** (PR #16).

**RUN C — chat panel sizing and empty state.** Panel height was a fixed `600px` regardless of viewport, clipping the header off-screen on short screens; now `h-[min(620px,calc(100dvh-7rem))]`, full-width with a small inset below 480px. Added a static, client-side empty state (greeting + 4 tappable suggestion chips) so the panel isn't blank before the first message. `AIDemo.tsx`'s sample questions translated to Indonesian to match.
Branch: `fix/chat-panel-sizing-empty-state` · **merged** (PR #17).

**`detectLanguage()` default flipped from English to Indonesian.** Nearly every visitor is Indonesian, so defaulting to English whenever none of the 23 Indonesian indicator words matched was backwards — any short/ambiguous Indonesian text (`ok`, `halo`, `hi`, `thx`, `siap`, empty string) was silently classified English. Now requires positive English evidence (a new 22-word English indicator list, ≥2 matches, outweighing any Indonesian matches) to return `"en"`; everything else defaults to `"id"`. Also fixed `buildSystemPrompt`'s own default parameter for the same reason.
Branch: `fix/detect-language-default` · **merged** (PR #18).

**Production outage (Aug 8, 17:51 WIB) — root-caused and fixed at the design level, not just patched.** Four consecutive `/api/chat` requests got the RUN B error card (confirming RUN B works as designed in production) instead of a reply. OpenRouter's own activity log showed the embedding call succeeding every time with no completion call ever firing after it — the gap was entirely between `embed()` succeeding and the model being called.

Traced it to `retrieveContext()` → `createServiceClient()` (`src/lib/supabase/server.ts`), which reads `SUPABASE_SERVICE_ROLE_KEY` with a `!` non-null assertion that does nothing at runtime. Checked the installed `@supabase/supabase-js` source directly: the client constructor throws synchronously (`Error: supabaseKey is required.`) if that env var is empty/undefined, before any network call — which is exactly the observed pattern (zero completions, `retrieval_failed`, and a fast failure). Distinguished this from a *wrong-but-present* key (e.g. anon's value pasted into the service-role slot) by checking what `match_embeddings()` would actually do under `anon`: it's `SECURITY INVOKER`, all three tables it reads have exactly one RLS policy each requiring `auth.role() = 'authenticated'`, and `anon` fails that — but RLS filters silently (empty result, no throw), so a wrong-but-present key would *not* explain zero completions; only a missing/empty key does. Root cause on the Vercel side: the var was missing or empty in whichever environment scope served those requests (Production vs. Preview) — never fully confirmed via the exact Vercel log line before the design fix below made the question moot for this code path.

**Design fix, not just an outage patch: the public chat route no longer holds a credential that bypasses RLS on every table, including `leads` (patient names and phone numbers).** Migration `supabase/migrations/003_match_embeddings_security_definer.sql`:
- `match_embeddings()` is now `SECURITY DEFINER` with a pinned `search_path` (`public, pg_temp`) — required, since an unpinned search_path on a SECURITY DEFINER function is a classic Postgres privilege-escalation vector.
- `match_count` is clamped server-side (`least(greatest(match_count, 1), 20)`) rather than trusted as-is, since the function became callable by anon and an uncapped limit on a public RPC is an easy denial-of-service vector.
- `EXECUTE` revoked from `PUBLIC`, granted explicitly to `anon` and `authenticated` — deliberate grant surface, not inherited.
- `src/lib/ai/retrieval.ts` now calls a new `createAnonClient()` (`src/lib/supabase/server.ts`) instead of `createServiceClient()` — the chat route uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, a credential that's already public (shipped to every browser), so there's no secret left to misconfigure for this specific path. `leads`/`knowledge` routes still use the service role key — out of scope for this run, they have a legitimate need for elevated writes.
- Verified live: `SET ROLE anon` in a SQL session + a real stored embedding vector confirmed `match_embeddings()` returns real rows (not zero) as anon post-migration, and that `match_count=500` clamps to 20 rows max.
Branch: `fix/chat-rag-least-privilege` · **merged** (PR #19).

**Known hardening item, flagged not fixed.** `anon` currently holds full table-level grants (SELECT/INSERT/UPDATE/DELETE) on `document_chunks`, `documents`, and `embeddings` — RLS is the *only* thing stopping direct anon reads/writes on these tables today, and it currently holds. That's broader than it needs to be: the moment anyone adds a permissive policy to one of these tables without thinking about the blast radius, or disables RLS temporarily for a migration and forgets to re-enable it, `anon` already has the underlying grant to exploit it immediately. Now that `match_embeddings()` is the sanctioned SECURITY DEFINER read path, the base table grants for `anon` could be revoked entirely with no loss of functionality. Not done in this pass — deliberately out of scope, worth a dedicated look before this ever handles anything more sensitive than public marketing copy.

**Live production verification (Aug 8).** All of RUN A2, RUN B, RUN C, and the least-privilege migration confirmed working end to end against the deployed site: pricing returns Rp 100.000 exam / Rp 150.000 bundle total exactly as reworded, hours returns the corrected three-line Mon–Fri/Sat/Sun schedule, WhatsApp returns the real number (all four stale `8888` occurrences confirmed gone from retrieval), and the empty state/panel sizing render correctly. The security migration works in production, not just under `SET ROLE` in this sandbox.

**RUN F — vague services answer, corrected diagnosis: generation, not retrieval.** Asked "ada layanan apa saja?", the bot listed 5 of the 9 services in `01-services.txt` (omitting, notably, dental implants — the highest-value service, starting at Rp 8.000.000 — and pediatric dentistry, drg. Citra Dewi's entire specialty). Investigated before touching anything: `messages.sources` is empty (conversation logging is still RUN D, not built), and both the live site and Supabase's REST endpoint are network-blocked from this sandbox, so the exact historical retrieval couldn't be read directly. The circumstantial case against retrieval is strong though — the whole KB is only 6 chunks total, `top_k=5`, so excluding a single-chunk document that's a near-paraphrase of the query would require an unusually low similarity score for a 6-chunk pool. The prompt was the more direct explanation: `prompts.ts`'s RULES block said "Keep answers under 3 sentences unless detail is needed" with no exception carved out for enumeration questions, leaving "detail needed" to the model's judgment. Added an explicit rule: enumeration questions ("what services/doctors/options exist") must list everything present in the retrieved context and are exempt from the 3-sentence guideline. Not verified live yet — needs a real question asked in production, since retrieval still fails from this sandbox (OpenRouter blocked).
Branch: `fix/services-enumeration-and-markdown` · pushed.

**Markdown rendering added to the chat bubble.** The model emits markdown (bold, bullet lists) but the bubble rendered it as a bare `<p>{content}</p>` — bullets showed as inline `- ` dashes and newlines collapsed per normal HTML whitespace handling, so structured answers (the hours list, and now potentially a 9-item service list) read as a wall of text. Added a small hand-written parser (`renderMarkdown()` in `ChatMessage.tsx`, no new dependency) covering paragraphs, bullet/numbered lists, and bold. Safe by construction rather than sanitized after the fact — content only ever becomes React children, never `dangerouslySetInnerHTML`, so there's no HTML injection surface to sanitize against in the first place. Covered by a unit test (`src/__tests__/chat/renderMarkdown.test.ts`) and confirmed visually with a mocked reply reproducing the exact reported bug (bold heading + 3-line bullet list + trailing sentence) — screenshot shared in conversation.

**Empty-state chips reordered shortest-first**, cosmetic — they were wrapping 2/1/1 in the flex row; now 2/2.

**Known mismatch, flagged not fixed.** The page's Services section shows 6 service cards; `01-services.txt` describes 9. The bot (once the enumeration fix above is confirmed live) and the page now describe a different-sized clinic. Not touched in this run — deliberately out of scope, needs a decision on whether to add the 3 missing service cards to the page or trim the KB down to match what's actually offered.

### Database — verified live

Project ref `ihtjuirlawmpmiwzdvpm`, region ap-southeast-1, `ACTIVE_HEALTHY`.

| table | rows | note |
|---|---|---|
| documents | 5 | all `status = ready` |
| document_chunks | 6 | chunked 1:1 except FAQ |
| embeddings | 6 | RAG index, healthy |
| leads | 4 | |
| settings | 6 | |
| conversations | 0 | **table exists, never wired** |
| messages | 0 | **table exists, never wired** |

Schema for the unused tables:

```
conversations: id uuid, session_id text, lead_id uuid, created_at timestamptz
messages:      id uuid, conversation_id uuid, role text, content text,
               sources jsonb, created_at timestamptz
```

`messages.sources` was designed for citation tracking and has never been written to. That is why retrieval problems currently cannot be debugged.

### Knowledge base contents

| document | tokens | covers |
|---|---|---|
| 01-services.txt | 440 | check-up, cleaning, whitening, and the rest |
| 02-pricing.txt | 338 | full IDR price list |
| 03-doctors.txt | 288 | three doctors, credentials, schedules |
| 04-clinic-info.txt | 310 | Jl. Ahmad Yani No. 45, Bekasi Selatan; landmark Grand Galaxy |
| 05-faq.txt | 500 + 151 | costs, insurance, 0% installments |

Doctors, for alt text and copy:

- **drg. Anisa Rahma, Sp.KG** — konservasi gigi dan estetika · 12 yrs · Universitas Indonesia · Sen, Rab, Jum, Sab
- **drg. Budi Santoso, Sp.Ort** — ortodonti · 9 yrs · Universitas Airlangga · Sel, Kam, Sab
- **drg. Citra Dewi** — kedokteran gigi anak dan umum · 7 yrs · Universitas Trisakti · Sen–Jum, Min

### Known open bugs

1. **Empty chat bubble** — retrieval throws, SSE closes with zero tokens, client renders a blank grey box forever. Run 2a.
2. **Chat panel overflows viewport** — panel taller than the window, header clipped off-screen. Run 7.
3. **Blank panel on open** — no empty state. Run 7.
4. **Vague retrieval** — `"disini ada service apa ya?"` returns *"dan perawatan gigi lainnya"* despite `01-services.txt` being indexed and healthy. Run 5.
5. **Supabase re-pause risk** — will pause again after 7 idle days. Run 3.

---

## 3. Standing rules

- **No em dashes** in any copy written for this project. Recast the sentence instead.
- One run per session. Show the diff before committing.
- Do not touch `.env` or commit secrets.
- If a run is blocked, stop and say so. Do not improvise a workaround.
- Playwright selectors break when copy changes — fix the selectors, not the copy.
- Sandbox egress to `openrouter.ai`, `supabase.co`, and `upload.higgsfield.ai` is blocked. Tests that depend on them pass vacuously. **Say so rather than reporting green.**

---

## 4. Runs, in order

### RUN 2a — Kill the empty chat bubble

```
Fix the empty assistant bubble in the chat UI. Server and client both
need changes.

CURRENT FAILURE: retrieveContext() throws, the SSE stream closes with
zero tokens, and the client renders an empty grey bubble forever. The
user sees a blank rectangle. This is the default failure mode whenever
Supabase or OpenRouter is unreachable.

SERVER — /api/chat
1. Wrap retrieval and the LLM call so failures are classified, not
   swallowed:
     - retrieval_failed   (Supabase unreachable, RPC error, DNS)
     - model_failed       (OpenRouter 4xx/5xx, timeout)
     - unknown
2. Emit a structured SSE error event before closing the stream, e.g.
   `event: error` with { code, message }. Do not just close silently.
3. Log the classified error server-side with enough context to debug.

IMPORTANT — do NOT fall back to answering without retrieved context.
The knowledge base holds prices, schedules, insurance terms, and doctor
credentials. A model answering those from memory will invent them. On a
medical site, failing honestly beats answering confidently and wrong.

CLIENT
4. Handle the error event: replace the pending assistant bubble with a
   visible error state. Never leave an empty bubble in the transcript.
5. Also guard the silent case: if a stream closes with zero content and
   no error event arrived, treat it as an error. An empty assistant
   message must be unrenderable by construction.
6. Error copy in Bahasa Indonesia, warm and specific, with the WhatsApp
   number as a fallback. Something like:
     "Maaf, asisten AI sedang tidak dapat dihubungi. Silakan hubungi
      kami langsung di WhatsApp [number] dan tim kami akan membantu."
   Include a tappable WhatsApp link.
7. Offer a retry affordance on the failed message.

DO NOT add conversation logging in this run.

Run the suite. Add a spec that mocks a failing /api/chat and asserts the
error state renders and no empty bubble exists in the DOM.

Show me the diff plus a screenshot of the error state at 375px.
```

---

### RUN 7 — Chat panel sizing and empty state

```
Fix two problems in the chat widget.

BUG 1 — the panel overflows the viewport
The chat panel is taller than the window, so its top edge is clipped
off-screen and the header is unreachable. Constrain it:

- max-height tied to the viewport with room for the launcher button,
  e.g. max-h-[min(620px,calc(100dvh-7rem))]
- Use dvh, not vh. On mobile Chrome and Safari, vh ignores the collapsing
  browser chrome and the panel gets cut off again.
- Anchor bottom-right, above the floating launcher, with a consistent gap.
- The message list scrolls; the header and input stay fixed.
- On narrow screens (<480px) go full-width with a small inset rather than
  a floating card.
- Verify at 375x667 and 1280x800 that the header is fully visible and the
  input is never covered by the launcher.

BUG 2 — the panel is blank when opened
Opening the chat shows a large empty white area, which reads as broken.
Add a static empty state, rendered CLIENT-SIDE with no API call, so it
appears instantly and still works when the chat backend is down.

Content, in Bahasa Indonesia:
- A short greeting, warm and specific. For example:
    "Halo! Saya asisten AI BrightPath Dental."
    "Tanya apa saja soal layanan, harga, jadwal dokter, atau lokasi klinik."
- Below it, 4 tappable suggestion chips that prefill and send the message:
    "Berapa biaya periksa gigi?"
    "Jam praktik klinik?"
    "Dokter siapa yang menangani kawat gigi?"
    "Apakah menerima BPJS?"
- Chips disappear once the first user message is sent.
- Keep it visually quiet: no illustration, no oversized icon. Text and
  chips only.

Why chips matter beyond decoration: open-ended questions retrieve badly
against this knowledge base. Steering visitors toward specific questions
improves answer quality without touching the retrieval code.

DO NOT change the system prompt, retrieval, or the error handling from
Run 2a.

Run the suite. Add specs for: panel header visible at 375x667, empty
state renders on open, clicking a chip sends that message.

Show me the diff plus screenshots of the open panel at 375px and 1280px.
```

---

### RUN 2b — Conversation logging

```
Wire chat persistence. The conversations and messages tables ALREADY
EXIST in Supabase and are empty. Do not create them.

  conversations: id uuid, session_id text, lead_id uuid, created_at
  messages:      id uuid, conversation_id uuid, role text,
                 content text, sources jsonb, created_at

- On the first message of a session, insert a conversations row keyed by
  session_id.
- On every turn, insert a messages row for the user message and one for
  the assistant reply.
- Populate messages.sources with the retrieved chunks: chunk id, document
  name, similarity score. This column is the whole point. Without it,
  retrieval cannot be debugged.
- Writes must never block or break the chat response. Wrap in try/catch,
  log failures, always stream the reply.
- Log failed turns too, with the error classification from Run 2a.

Run the suite. Show me the diff.
```

---

### RUN 3 — Keep-alive cron, OG image, favicon

```
Two isolated tasks, no overlap with app logic.

TASK A — keep-alive
The Supabase free tier pauses a project after 7 idle days. This already
took the site down once: DNS withdrawn, vector search threw ENOTFOUND,
/api/chat returned 500.

Add .github/workflows/keepalive.yml — weekly cron, runs a trivial
`select 1` against Supabase using repo secrets. Do not commit any
credentials; tell me which secrets to add.

TASK B — social and branding assets
- Build an OG image at exactly 1200x630: clinic name, one positioning
  line, logo, brand colour, generous margins. Every WhatsApp and
  LinkedIn share currently renders a blank card, and WhatsApp is the
  main sharing channel for this audience.
- Wire it into Next metadata (openGraph + twitter).
- Add a favicon and replace the plain-text header wordmark with a proper
  logo lockup. Typographic is fine.

Show me the diff.
```

---

### RUN 5 — Retrieval tuning

**Depends on Run 2b.** Send real chat messages first so there are logs to read.

```
The chatbot gives vague answers to specific questions.

SYMPTOM: "disini ada service apa ya?" returns "pemeriksaan rutin,
pemutihan gigi, dan perawatan gigi lainnya" — "and other dental
treatments" is a non-answer.

NOT a data problem. The knowledge base is healthy:
  01-services.txt    ready, 440 tokens
  02-pricing.txt     ready, 338 tokens
  03-doctors.txt     ready, 288 tokens
  04-clinic-info.txt ready, 310 tokens
  05-faq.txt         ready, 500 + 151 tokens

Read messages.sources from recent conversations to see which chunks were
actually retrieved for that question. Then, based on what you find:

1. Check top-k and the similarity threshold in the retrieval call.
2. Documents are chunked 1:1 — each file is a single chunk, so retrieval
   is all-or-nothing per document. Consider splitting by section heading.
3. Check whether the system prompt instructs the model to be brief or to
   summarise. If so, change it: when the user asks what services exist,
   it should list them.

Report what the logs showed before changing anything.
```

---

### RUN 8 — Final verify

```
Full verification pass.

- npm run build, zero type errors
- Vitest and Playwright, full suite
- Manual pass at 375px: hero crop, doctor row, pricing cards, chat panel
- Lighthouse: performance, accessibility, SEO
- Confirm every image has explicit width/height and real alt text
- Confirm no em dashes remain in body copy

Report anything that regressed.
```

---

## 5. Deferred, not scheduled

- **Doctor card treatment.** Portraits render at 56px circular — the same size and shape as the initials they replaced. Better content, same visual weight. A larger treatment (200–280px cards, credentials in type below) would land the intended effect, but needs higher-resolution sources than the current ~230px originals.
- **Remaining imagery.** Hero, service icons as a single line-icon set (not six stock photos), facility shots (X-ray unit, sterilisation tray, instruments), testimonial avatars, clinic exterior.
- **Dead-letter queue** for the Make.com webhook — a `failed_webhooks` table plus retry. Today an outage silently drops the lead notification.
- **Idempotency key** on lead insert.
- **Not doing:** Kafka, Flink, or any message broker. Over-engineering for one synchronous endpoint on one clinic site.

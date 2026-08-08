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
Branch: `chore/copy-cleanup-pass` · pushed, no PR. **Still not merged — the three identical `5.0` ratings are live on production right now.**

### Open branches needing PRs / merge

| branch | state |
|---|---|
| `chore/copy-cleanup-pass` | pushed, unmerged |
| `fix/chat-language-detection` | pushed, unmerged, unverified |
| `feat/doctor-portraits` | pushed, unmerged |

Merge these before starting new runs, or the branches will drift.

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

import { createAnonClient } from "@/lib/supabase/server";

// Never statically cache this route — a health check that got frozen at
// build time and kept serving "ok: true" forever would defeat the whole
// point of both the uptime monitor and the keep-alive cron.
export const dynamic = "force-dynamic";

// Proves the database is actually reachable, not just that the app
// booted. One cheap read against `settings` (public read policy, anon
// key — no service role here) via the same createAnonClient() the chat
// route uses. No OpenRouter call, no logging writes: fast and
// side-effect free, safe to hit from an unauthenticated uptime monitor
// or a daily cron.
//
// Status code carries the signal, not just the body — an uptime
// monitor keys on HTTP status, and a 200 with ok: false would be
// invisible to it.
export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = createAnonClient();
    const { error } = await supabase.from("settings").select("id").limit(1);

    if (error) {
      console.error("[api/health] Supabase check failed:", error);
      return Response.json({ ok: false, db: false, timestamp }, { status: 503 });
    }

    return Response.json({ ok: true, db: true, timestamp }, { status: 200 });
  } catch (error) {
    console.error("[api/health] Supabase check threw:", error);
    return Response.json({ ok: false, db: false, timestamp }, { status: 503 });
  }
}

import { after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { limited } = await checkRateLimit("leads", 5, "10 m", ip);
  if (limited) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 },
    );
  }

  const { name, phone, serviceInterest, preferredDate, conversationId, source, message, website } =
    parsed.data;

  // Honeypot (see LeadForm.tsx / LeadCapture.tsx): real visitors never
  // see or fill this field, so any non-empty value is a near-certain
  // bot. Respond as if the submission succeeded, without writing a row
  // or firing the webhook, so a bot checking the response code doesn't
  // learn it was caught and adapt.
  if (website) {
    console.warn("[api/leads] honeypot triggered, discarding submission", { ip });
    return Response.json({ success: true, leadId: null });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("leads")
    .insert({
      name,
      phone,
      service_interest: serviceInterest ?? null,
      preferred_date: preferredDate ?? null,
      conversation_id: conversationId ?? null,
      source: source ?? "chat",
      notes: message ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/leads] insert failed:", error);
    return Response.json({ error: "Failed to save lead" }, { status: 500 });
  }

  const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
  if (webhookUrl) {
    after(async () => {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          serviceInterest: serviceInterest ?? null,
          preferredDate: preferredDate ?? null,
          notes: message ?? null,
          source: source ?? "chat",
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.error("[api/leads] Make.com webhook failed:", err);
      });
    });
  }

  return Response.json({ success: true, leadId: data.id });
}

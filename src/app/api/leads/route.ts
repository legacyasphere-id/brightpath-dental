import { createServiceClient } from "@/lib/supabase/server";
import type { LeadRequestBody } from "@/types";

export async function POST(request: Request) {
  let body: LeadRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name,
    phone,
    serviceInterest,
    preferredDate,
    conversationId,
    source,
    message,
  } = body;

  if (!name || !phone) {
    return Response.json(
      { error: "name and phone are required" },
      { status: 400 },
    );
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

  // Fire Make.com webhook (fire-and-forget, never blocks response)
  const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
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
      // Log but never throw — lead is already saved, notification is best-effort
      console.error("[api/leads] Make.com webhook failed:", err);
    });
  }

  return Response.json({ success: true, leadId: data.id });
}

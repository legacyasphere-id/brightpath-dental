"use client";

import { useState } from "react";

export function LeadCapture({ conversationId }: { conversationId?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Honeypot — real visitors never see this field, so a filled value
  // means a bot. Checked server-side in /api/leads.
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          conversationId,
          source: "chat",
          website: website || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-clinic-border bg-clinic-mintLight p-4 text-sm text-clinic-text">
        Thanks, {name}! We&apos;ll confirm via WhatsApp within 1 hour.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-clinic-border bg-clinic-surface p-4"
    >
      <p className="text-sm text-clinic-body">
        Let&apos;s get you booked in — share your details and we&apos;ll
        confirm via WhatsApp.
      </p>
      <input
        type="text"
        required
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-clinic-border px-3 py-2 text-sm"
      />
      <input
        type="tel"
        required
        placeholder="WhatsApp number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-clinic-border px-3 py-2 text-sm"
      />
      {/* Honeypot — invisible to real visitors, irresistible to bots.
          Placed after the real fields rather than before, so it never
          becomes "the first text input" for a selector that assumes
          that's the name field. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="lead-capture-website">Website</label>
        <input
          type="text"
          id="lead-capture-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-clinic-mint px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Book appointment"}
      </button>
    </form>
  );
}

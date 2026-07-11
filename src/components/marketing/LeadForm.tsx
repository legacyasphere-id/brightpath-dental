"use client";

import { useState } from "react";

const services = [
  "General Check-up & Cleaning",
  "Teeth Whitening",
  "Dental Implants",
  "Orthodontics & Braces",
  "Root Canal Treatment",
  "Pediatric Dentistry",
  "Other / Not Sure Yet",
];

type FormState = {
  name: string;
  phone: string;
  service: string;
  message: string;
};

export function LeadForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          serviceInterest: form.service || undefined,
          source: "form",
          message: form.message || undefined,
        }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm({ name: "", phone: "", service: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-clinic-border px-4 py-2.5 text-sm text-clinic-text placeholder:text-clinic-muted focus:border-clinic-navy focus:outline-none focus:ring-1 focus:ring-clinic-navy";

  return (
    <section id="lead-form" className="bg-clinic-mintLight px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
            Get In Touch
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold text-clinic-text">
            Book an appointment
          </h2>
          <p className="mt-3 text-clinic-body">
            Fill out the form below and we&apos;ll confirm your appointment via
            WhatsApp within 1 hour.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl border border-clinic-mint/30 bg-white p-10 text-center shadow-sm">
            <span className="text-5xl">✅</span>
            <h3 className="mt-4 font-sans text-xl font-bold text-clinic-text">
              Booking Received!
            </h3>
            <p className="mt-2 text-clinic-body">
              We&apos;ll confirm your appointment via WhatsApp shortly. See you
              soon!
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-sm font-semibold text-clinic-navy underline"
            >
              Book another appointment
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-clinic-border bg-white p-8 shadow-sm"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-clinic-text">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-clinic-text">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08123456789"
                  value={form.phone}
                  onChange={set("phone")}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-clinic-text">
                Service Needed
              </label>
              <select
                value={form.service}
                onChange={set("service")}
                className={inputCls}
              >
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-clinic-text">
                Additional Notes{" "}
                <span className="text-clinic-muted">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe your concern or any special requests..."
                value={form.message}
                onChange={set("message")}
                className={`${inputCls} resize-none`}
              />
            </div>
            {status === "error" && (
              <p className="mt-4 text-sm text-red-600">
                Something went wrong. Please try again or contact us directly
                via WhatsApp.
              </p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 w-full rounded-lg bg-clinic-navy py-3 font-semibold text-white transition-colors hover:bg-clinic-navyDark disabled:opacity-50"
            >
              {status === "loading"
                ? "Sending..."
                : "Book Appointment via WhatsApp →"}
            </button>
            <p className="mt-3 text-center text-xs text-clinic-muted">
              By submitting, you agree to be contacted via WhatsApp for
              appointment confirmation.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

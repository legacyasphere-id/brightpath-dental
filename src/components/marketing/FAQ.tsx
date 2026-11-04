"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useChatWidget } from "@/components/chat/ChatWidget";
import { SECTION_PADDING } from "@/lib/utils";

const faqs = [
  {
    question: "How much does a dental check-up and scaling cost at BrightPath?",
    answer:
      "Our Basic Check-up bundle is Rp 150.000, which includes a comprehensive oral examination, professional scaling and polishing, digital X-ray review, and an oral hygiene consultation. For other treatments like teeth whitening (Rp 800.000) or implant consultation (Rp 250.000), see our Pricing section or ask our AI assistant.",
  },
  {
    question: "Does BrightPath Dental accept BPJS and private insurance?",
    answer:
      "Yes, we accept both BPJS Kesehatan (for covered procedures) and partner private dental insurance plans. You can message us on WhatsApp or ask our 24/7 AI assistant to check coverage for your specific plan.",
  },
  {
    question: "Can treatment payments be paid in installments?",
    answer:
      "Yes, 0% installment plans are available for major treatments such as dental implants, orthodontic braces, clear aligners, and crowns/bridges. Our front desk team will walk you through the payment options during your consultation.",
  },
  {
    question: "Which doctor handles braces, root canals, or children's dentistry?",
    answer:
      "Orthodontics and braces are handled by drg. Budi Santoso, Sp.Ort (Tue, Thu, Sat). Root canals, veneers, and cosmetic restorations are treated by drg. Anisa Rahma, Sp.KG (Mon, Wed, Fri, Sat). Pediatric and routine family check-ups are handled by drg. Citra Dewi (Mon–Fri, Sun).",
  },
  {
    question: "Where is the clinic located and what are the operating hours?",
    answer:
      "We are located at Jl. Ahmad Yani No. 45, Bekasi Selatan, Kota Bekasi 17141 (near Grand Galaxy, with free on-site parking). We are open 7 days a week: Mon–Fri 08.00–20.00, Sat 08.00–17.00, and Sun 09.00–14.00 WIB.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { open } = useChatWidget();

  return (
    <section id="faq" className={`bg-clinic-bg ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-3xl">
        {/* Centered Header (matching Damessa Figma FAQ) */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/75">
            Common Questions
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
            Frequently asked{" "}
            <span className="font-semibold text-clinic-navy">questions</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-clinic-border bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold transition-colors sm:text-base ${
                    isOpen
                      ? "bg-clinic-navy text-white"
                      : "bg-white text-clinic-text hover:bg-clinic-mintLight/50"
                  }`}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-clinic-mint" : "text-clinic-navy"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 py-5 text-sm leading-relaxed text-clinic-body">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Damessa Figma "Pertanyaan kamu belum terjawab?" Prompt */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-clinic-border bg-white p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-sans text-base font-bold text-clinic-text">
              Still have a question that isn&apos;t listed here?
            </p>
            <p className="mt-0.5 text-xs text-clinic-muted">
              Our AI assistant is online 24/7 and answers instantly from our
              clinic records.
            </p>
          </div>
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-clinic-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-clinic-navyDark"
          >
            <MessageCircle size={15} />
            Ask a Question
          </button>
        </div>
      </div>
    </section>
  );
}

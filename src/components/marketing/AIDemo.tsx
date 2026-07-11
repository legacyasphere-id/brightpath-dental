"use client";

const sampleQuestions = [
  "What's the cost of teeth whitening?",
  "Do you have an orthodontist on staff?",
  "How long does a root canal take?",
  "Is BPJS accepted here?",
];

export function AIDemo() {
  const openChat = () => {
    const btn = document.querySelector(
      'button[aria-label="Open chat"]'
    ) as HTMLButtonElement | null;
    btn?.click();
  };

  return (
    <section id="ai-demo" className="bg-clinic-mintLight px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-clinic-mint/30 bg-white px-4 py-1.5 text-xs font-semibold text-clinic-navy">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clinic-mint" />
            AI Assistant · Online 24/7
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold text-clinic-text">
            Ask our AI assistant
          </h2>
          <p className="mt-3 max-w-lg text-clinic-body">
            Have a question about a procedure, pricing, or availability? Our AI
            answers instantly — in Bahasa Indonesia or English, around the
            clock.
          </p>

          {/* Sample questions chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={openChat}
                className="rounded-full border border-clinic-border bg-white px-4 py-2 text-sm text-clinic-body shadow-sm transition-colors hover:border-clinic-mint hover:text-clinic-navy"
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={openChat}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-clinic-mint px-8 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            <span aria-hidden>💬</span> Start Chatting Now
          </button>
          <p className="mt-3 text-xs text-clinic-muted">
            Free · No registration · Instant answers
          </p>
        </div>
      </div>
    </section>
  );
}

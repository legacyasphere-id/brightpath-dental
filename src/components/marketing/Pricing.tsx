const plans = [
  {
    name: "Basic Check-up",
    price: "Rp 150.000",
    description: "Routine oral health maintenance",
    features: [
      "Comprehensive oral examination",
      "Professional cleaning & scaling",
      "Digital X-ray review",
      "Oral hygiene consultation",
    ],
    highlighted: false,
  },
  {
    name: "Whitening Package",
    price: "Rp 800.000",
    description: "Professional whitening in one session",
    features: [
      "Pre-treatment examination",
      "In-office bleaching session",
      "Take-home whitening kit",
      "30-day follow-up check",
      "Smile photography",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Implant Consultation",
    price: "Rp 250.000",
    description: "Full assessment for implant candidacy",
    features: [
      "Specialist consultation",
      "3D CT scan review",
      "Custom implant plan",
      "Detailed cost estimate",
      "Finance options guidance",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-clinic-surface px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-clinic-mint">
            Transparent Pricing
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold text-clinic-text">
            Pricing
          </h2>
          <p className="mt-3 text-clinic-body">
            No hidden fees. Honest pricing, every time.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${
                plan.highlighted
                  ? "scale-[1.02] border-clinic-navy bg-clinic-navy text-white shadow-xl"
                  : "border-clinic-border bg-clinic-bg"
              }`}
            >
              {"badge" in plan && plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clinic-mint px-3 py-0.5 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              <h3
                className={`font-sans text-lg font-bold ${plan.highlighted ? "text-white" : "text-clinic-text"}`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-1 text-xs ${plan.highlighted ? "text-white/60" : "text-clinic-muted"}`}
              >
                {plan.description}
              </p>
              <p
                className={`mt-5 font-sans text-3xl font-extrabold ${plan.highlighted ? "text-white" : "text-clinic-navy"}`}
              >
                {plan.price}
              </p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2.5 text-sm ${plan.highlighted ? "text-white/80" : "text-clinic-body"}`}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-clinic-mint"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#lead-form"
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-clinic-navy hover:bg-clinic-bg"
                    : "bg-clinic-navy text-white hover:bg-clinic-navyDark"
                }`}
              >
                Book Now
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-clinic-muted">
          Prices may vary depending on case complexity. Consultation required
          for accurate estimates. Ask our AI for quick pricing guidance.
        </p>
      </div>
    </section>
  );
}

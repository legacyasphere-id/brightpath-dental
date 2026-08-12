import { Bot, Microscope, BadgeCheck, MapPin, type LucideIcon } from "lucide-react";
import { SECTION_PADDING } from "@/lib/utils";

const reasons: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Bot,
    title: "AI-Powered Assistance",
    description:
      "Get instant answers 24/7 via our intelligent AI assistant. Ask about pricing or procedure details in Bahasa or English.",
  },
  {
    icon: Microscope,
    title: "Modern Equipment",
    description:
      "Digital X-rays, CAD/CAM same-day crowns, and autoclave sterilization for every instrument between patients.",
  },
  {
    icon: BadgeCheck,
    title: "Specialist Team",
    description:
      "Two board-certified specialists plus a pediatric-trained general dentist, all with active clinical experience.",
  },
  {
    icon: MapPin,
    title: "Central Bekasi Location",
    description:
      "Conveniently located in central Bekasi with ample parking and easy access from major arterial roads.",
  },
];

export function WhyUs() {
  return (
    <section className={`bg-clinic-navy text-white ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-mint">
            Why Choose Us
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight">
            Why BrightPath?
          </h2>
          <p className="mt-3 max-w-xl text-white/65">
            We combine clinical expertise with modern technology for every
            patient visit.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-clinic-mint/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Icon size={22} strokeWidth={1.75} className="text-clinic-mint" />
                </div>
                <h3 className="mt-4 font-sans text-base font-semibold text-white">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
